import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, properties, availability, users } from "@db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { enqueueBookingPipeline, type BookingPayload } from "./booking-pipeline";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ROOM_FACTORS: Record<string, number> = { multi_share: 0.5, twin: 0.78, private: 1.44 };
const SERVICE_FEE_UGX = 28;
const TAX_RATE = 0.18;

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const random = randomInt(100000, 10000000); // 7-digit — collision-safe at booking volumes
  return "KIT-" + year + "-" + random;
}

function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

export const bookingRouter = createRouter({
  create: publicQuery
    .input(z.object({
      propertyId: z.number().positive("Property ID must be positive"),
      userId: z.number().positive("User ID must be positive").optional(),
      checkIn: z.string().regex(DATE_RE, "checkIn must be YYYY-MM-DD"),
      checkOut: z.string().regex(DATE_RE, "checkOut must be YYYY-MM-DD"),
      adults: z.number().min(1, "At least 1 adult required").default(1),
      children: z.number().min(0).default(0),
      roomType: z.enum(["multi_share", "twin", "private"]).default("private"),
      totalPrice: z.number().positive("Total price must be positive"),
      addShuttle: z.number().min(0).default(0),
      seasonPass: z.number().min(0).default(0),
      contactName: z.string().max(255).optional(),
      contactPhone: z.string().max(50).optional(),
      contactEmail: z.string().email().max(320).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // ISO date strings compare lexicographically — no timezone ambiguity
      if (input.checkIn < todayUTC()) throw new TRPCError({ code: "BAD_REQUEST", message: "Check-in date cannot be in the past" });
      if (input.checkOut <= input.checkIn) throw new TRPCError({ code: "BAD_REQUEST", message: "Check-out date must be after check-in date" });
      if (input.adults + input.children > 20) throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum 20 guests per booking" });

      const db = getDb();
      const property = await db.select().from(properties).where(eq(properties.id, input.propertyId)).limit(1);
      if (property.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });

      // Server-authoritative user identity: logged-in user wins, guest checkout falls back to client userId
      const effectiveUserId = ctx.user?.id ?? input.userId;
      if (!effectiveUserId) throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to make a booking" });

      // Server-side price recomputation — never trust client-supplied totalPrice
      const nightsMs = new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime();
      const nights = Math.max(1, Math.round(nightsMs / (1000 * 60 * 60 * 24)));
      const perNight = Math.round(property[0].pricePerNight * (ROOM_FACTORS[input.roomType] ?? 1));
      const serverTotal = perNight * nights + SERVICE_FEE_UGX + Math.round(perNight * nights * TAX_RATE);

      const bookingRef = generateBookingRef();

      // Atomic: conflict check + booking insert + availability block in ONE transaction
      const { id: bookingId, ref: finalRef } = await db.transaction(async (tx) => {
        const conflicts = await tx.select({ count: sql<number>`count(*)` }).from(bookings).where(
          and(
            eq(bookings.propertyId, input.propertyId),
            sql`${bookings.status} IN (\'pending\', \'confirmed\')`,
            sql`${bookings.checkIn} < ${input.checkOut}`,
            sql`${bookings.checkOut} > ${input.checkIn}`,
          )
        );
        if ((conflicts[0]?.count || 0) > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "This property is not available for the selected dates" });
        }

        let result: any;
        let ref = bookingRef;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            result = await tx.insert(bookings).values({
              propertyId: input.propertyId, userId: effectiveUserId, checkIn: input.checkIn, checkOut: input.checkOut,
              adults: input.adults, children: input.children, roomType: input.roomType, totalPrice: serverTotal,
              status: "pending", addShuttle: input.addShuttle, seasonPass: input.seasonPass, bookingRef: ref,
            });
            break;
          } catch (e: any) {
            // Unique-violation on bookingRef → retry with a fresh ref
            if (String(e?.code) === "ER_DUP_ENTRY" && attempt < 2) { ref = generateBookingRef(); continue; }
            throw e;
          }
        }
        const id = Number(result[0].insertId);

        // Batch availability block — one insert, all nights (checkOut day excluded: guest leaves that morning)
        const rows: { propertyId: number; date: string; isBooked: number; bookingId: number }[] = [];
        const start = new Date(input.checkIn);
        const end = new Date(input.checkOut);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          rows.push({ propertyId: input.propertyId, date: d.toISOString().split("T")[0], isBooked: 1, bookingId: id });
        }
        if (rows.length > 0) {
          // availability has no unique key on (propertyId, date) — delete-then-insert keeps it idempotent
          await tx.delete(availability).where(
            and(eq(availability.propertyId, input.propertyId), inArray(availability.date, rows.map((r) => r.date) as any))
          );
          await tx.insert(availability).values(rows);
        }
        return { id, ref };
      });

      // AI pipeline (Nemotron logistics -> Kimi comms -> Nemotron QA) runs via a bounded
      // in-process queue — never blocks the booking response, never exhausts the event loop.
      void (async () => {
        try {
          const db2 = getDb();
          const guestRows = await db2.select().from(users).where(eq(users.id, effectiveUserId)).limit(1);
          const hostRows = await db2.select().from(users).where(eq(users.id, property[0].ownerId)).limit(1);
          const payload: BookingPayload = {
            bookingId,
            bookingRef: finalRef,
            propertyId: input.propertyId,
            propertyTitle: property[0].title,
            propertyLocation: property[0].location,
            distanceToStadium: property[0].distanceToStadium || "",
            guestName: input.contactName || guestRows[0]?.name || "Guest",
            guestEmail: input.contactEmail || guestRows[0]?.email || "",
            hostName: hostRows[0]?.name || "Host",
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            nights,
            adults: input.adults,
            children: input.children,
            roomType: input.roomType,
            addShuttle: input.addShuttle,
            seasonPass: input.seasonPass,
            priceSubtotal: perNight * nights,
            serviceFee: SERVICE_FEE_UGX,
            vat: Math.round(perNight * nights * TAX_RATE),
            totalPrice: serverTotal,
            currency: "UGX",
          };
          enqueueBookingPipeline(payload);
        } catch (err) {
          console.error("[BOOKING] AI pipeline error for " + finalRef + ":", err);
        }
      })();

      return { id: bookingId, bookingRef: finalRef, propertyId: input.propertyId, checkIn: input.checkIn, checkOut: input.checkOut, totalPrice: serverTotal, status: "pending", message: "Booking created successfully. Payment required to confirm." };
    }),

  listByUser: publicQuery.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    // Only the owner or an admin may list a user's bookings
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
    if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only view your own bookings" });
    }
    try { return (await getDb().select().from(bookings).where(eq(bookings.userId, input.userId)).orderBy(desc(bookings.checkIn))); }
    catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch bookings" }); }
  }),

  listByHost: publicQuery.input(z.object({ hostId: z.number() })).query(async ({ input, ctx }) => {
    // Only the host themselves or an admin may list a host's bookings
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
    if (ctx.user.id !== input.hostId && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only view bookings for your own properties" });
    }
    try {
      const db = getDb();
      const hostProperties = await db.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, input.hostId));
      if (hostProperties.length === 0) return [];
      const propertyIds = hostProperties.map((p) => p.id);
      // Parameterized IN — no raw string interpolation
      return db.select().from(bookings).where(inArray(bookings.propertyId, propertyIds)).orderBy(desc(bookings.checkIn));
    } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch host bookings" }); }
  }),

  cancel: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
    const db = getDb();
    const existing = await db.select().from(bookings).where(eq(bookings.id, input.id)).limit(1);
    if (existing.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
    // Only the booking owner or an admin may cancel
    if (existing[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only cancel your own bookings" });
    }
    if (existing[0].status === "cancelled") throw new TRPCError({ code: "BAD_REQUEST", message: "Booking is already cancelled" });
    if (existing[0].status === "completed") throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot cancel a completed booking" });
    await db.transaction(async (tx) => {
      await tx.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, input.id));
      await tx.update(availability).set({ isBooked: 0, bookingId: sql`NULL` }).where(eq(availability.bookingId, input.id));
    });
    return { success: true, bookingRef: existing[0].bookingRef };
  }),

  confirm: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
    const db = getDb();
    const existing = await db.select().from(bookings).where(eq(bookings.id, input.id)).limit(1);
    if (existing.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
    // Only the property host or an admin may confirm
    const prop = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, existing[0].propertyId)).limit(1);
    const isHost = prop.length > 0 && prop[0].ownerId === ctx.user.id;
    if (!isHost && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only the host or an admin can confirm bookings" });
    }
    if (existing[0].status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot confirm booking with status: " + existing[0].status });
    await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, input.id));
    return { success: true, bookingRef: existing[0].bookingRef };
  }),

  // Public payment lookup — returns only what the payment page needs (no userId/PII)
  byRef: publicQuery.input(z.object({ bookingRef: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const result = await db.select({
      bookingRef: bookings.bookingRef,
      propertyId: bookings.propertyId,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      roomType: bookings.roomType,
      adults: bookings.adults,
      children: bookings.children,
      addShuttle: bookings.addShuttle,
      seasonPass: bookings.seasonPass,
    }).from(bookings).where(eq(bookings.bookingRef, input.bookingRef)).limit(1);
    if (result.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
    return result[0];
  }),
});

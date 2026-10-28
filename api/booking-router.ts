import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import { adminQuery, authedQuery, createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, properties, availability, users } from "@db/schema";
import { eq, and, desc, sql, inArray, or } from "drizzle-orm";
import { enqueueBookingPipeline, type BookingPayload } from "./booking-pipeline";
import {
  calculateBookingQuote,
  getStayNights,
  MAX_STAY_NIGHTS,
} from "@contracts/booking-pricing";

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const random = randomInt(100000, 10000000); // 7-digit — collision-safe at booking volumes
  return "KIT-" + year + "-" + random;
}

function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

export const bookingRouter = createRouter({
  create: authedQuery
    .input(z.object({
      propertyId: z.number().int().positive("Property ID must be positive"),
      checkIn: z.string(),
      checkOut: z.string(),
      adults: z.number().int().min(1, "At least 1 adult required").default(1),
      children: z.number().int().min(0).default(0),
      roomType: z.enum(["multi_share", "twin", "private"]).default("private"),
      addShuttle: z.number().int().min(0).max(1).default(0),
      seasonPass: z.number().int().min(0).max(1).default(0),
      contactName: z.string().max(255).optional(),
      contactPhone: z.string().max(50).optional(),
      contactEmail: z.string().email().max(320).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // ISO date strings compare lexicographically — no timezone ambiguity
      const nights = getStayNights(input.checkIn, input.checkOut);
      if (nights === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter valid check-in and check-out dates" });
      }
      if (input.checkIn < todayUTC()) throw new TRPCError({ code: "BAD_REQUEST", message: "Check-in date cannot be in the past" });
      if (nights > MAX_STAY_NIGHTS) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Stays cannot exceed ${MAX_STAY_NIGHTS} nights` });
      }
      if (input.adults + input.children > 20) throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum 20 guests per booking" });

      const db = getDb();
      // The authenticated session is the only source of booking ownership.
      const effectiveUserId = ctx.user.id;

      const bookingRef = generateBookingRef();

      // Lock the property row so concurrent reservations for the same property
      // cannot both pass the overlap check before either inserts its booking.
      const { id: bookingId, ref: finalRef, property, quote } = await db.transaction(async (tx) => {
        const lockedProperties = await tx.select().from(properties)
          .where(eq(properties.id, input.propertyId))
          .limit(1)
          .for("update");
        if (lockedProperties.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
        const lockedProperty = lockedProperties[0];
        if (lockedProperty.status !== "approved") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Property is not available for booking" });
        }
        if (input.adults + input.children > lockedProperty.capacity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `This property can accommodate up to ${lockedProperty.capacity} guests`,
          });
        }

        const quote = calculateBookingQuote(lockedProperty.pricePerNight, nights, input.roomType);
        if (!quote) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "The total for this stay is outside the supported booking range" });
        }
        const conflicts = await tx.select({ count: sql<number>`count(*)` }).from(bookings).where(
          and(
            eq(bookings.propertyId, input.propertyId),
            or(
              eq(bookings.status, "confirmed"),
              eq(bookings.status, "pending"),
            ),
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
              adults: input.adults, children: input.children, roomType: input.roomType, totalPrice: quote.total,
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
        for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
          rows.push({ propertyId: input.propertyId, date: d.toISOString().split("T")[0], isBooked: 1, bookingId: id });
        }
        if (rows.length > 0) {
          // availability has no unique key on (propertyId, date) — delete-then-insert keeps it idempotent
          await tx.delete(availability).where(
            and(eq(availability.propertyId, input.propertyId), inArray(availability.date, rows.map((r) => r.date) as any))
          );
          await tx.insert(availability).values(rows);
        }
        return { id, ref, property: lockedProperty, quote };
      });

      // AI pipeline (Nemotron logistics -> Kimi comms -> Nemotron QA) runs via a bounded
      // in-process queue — never blocks the booking response, never exhausts the event loop.
      void (async () => {
        try {
          const db2 = getDb();
          const guestRows = await db2.select().from(users).where(eq(users.id, effectiveUserId)).limit(1);
          const hostRows = await db2.select().from(users).where(eq(users.id, property.ownerId)).limit(1);
          const payload: BookingPayload = {
            bookingId,
            bookingRef: finalRef,
            propertyId: input.propertyId,
            propertyTitle: property.title,
            propertyLocation: property.location,
            distanceToStadium: property.distanceToStadium || "",
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
            priceSubtotal: quote.subtotal,
            serviceFee: quote.serviceFee,
            vat: quote.tax,
            totalPrice: quote.total,
            currency: "UGX",
          };
          enqueueBookingPipeline(payload);
        } catch (err) {
          console.error("[BOOKING] AI pipeline error for " + finalRef + ":", err);
        }
      })();

      return { id: bookingId, bookingRef: finalRef, propertyId: input.propertyId, checkIn: input.checkIn, checkOut: input.checkOut, totalPrice: quote.total, status: "pending", message: "Booking created successfully. Payment required to confirm." };
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

  confirm: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.select().from(bookings).where(eq(bookings.id, input.id)).limit(1);
    if (existing.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
    if (existing[0].status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot confirm booking with status: " + existing[0].status });
    await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, input.id));
    return { success: true, bookingRef: existing[0].bookingRef };
  }),

  // Return only payment-page fields and require the booking owner.
  byRef: authedQuery.input(z.object({ bookingRef: z.string() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const result = await db.select({
      userId: bookings.userId,
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
    if (result.length === 0 || result[0].userId !== ctx.user.id) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
    }
    const { userId: _userId, ...booking } = result[0];
    return booking;
  }),
});

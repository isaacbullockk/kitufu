import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, properties, availability } from "@db/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `KIT-${year}-${random}`;
}

/**
 * Check if a property has any overlapping bookings for the given date range.
 * Returns the overlapping booking count (0 = fully available).
 */
async function checkAvailabilityConflict(
  propertyId: number,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: number
): Promise<number> {
  const db = getDb();

  // Check availability table for booked dates
  const bookedDates = await db
    .select({ count: sql<number>`count(*)` })
    .from(availability)
    .where(
      and(
        eq(availability.propertyId, propertyId),
        eq(availability.isBooked, 1),
        gte(availability.date, checkIn),
        lte(availability.date, checkOut)
      )
    );

  // Also check bookings table for overlapping pending/confirmed bookings
  const overlappingBookings = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        sql`${bookings.status} IN ('pending', 'confirmed')`,
        gte(bookings.checkOut, checkIn),
        lte(bookings.checkIn, checkOut),
        excludeBookingId ? sql`${bookings.id} != ${excludeBookingId}` : undefined
      )
    );

  return (bookedDates[0]?.count || 0) + (overlappingBookings[0]?.count || 0);
}

/**
 * Mark dates as booked in the availability table.
 */
async function blockAvailability(
  propertyId: number,
  checkIn: string,
  checkOut: string,
  bookingId: number
): Promise<void> {
  const db = getDb();
  const dates: string[] = [];
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  for (const date of dates) {
    await db
      .insert(availability)
      .values({ propertyId, date, isBooked: 1, bookingId })
      .onDuplicateKeyUpdate({ set: { isBooked: 1, bookingId } });
  }
}

export const bookingRouter = createRouter({
  // Create a new booking — with conflict detection and error handling
  create: publicQuery
    .input(
      z.object({
        propertyId: z.number().positive("Property ID must be positive"),
        userId: z.number().positive("User ID must be positive"),
        checkIn: z.string().min(1, "Check-in date is required"),
        checkOut: z.string().min(1, "Check-out date is required"),
        adults: z.number().min(1, "At least 1 adult required").default(1),
        children: z.number().min(0).default(0),
        roomType: z.enum(["multi_share", "twin", "private"]).default("private"),
        totalPrice: z.number().positive("Total price must be positive"),
        addShuttle: z.number().min(0).default(0),
        seasonPass: z.number().min(0).default(0),
      }),
    )
    .mutation(async ({ input }) => {
      // ── Validation ──
      const checkInDate = new Date(input.checkIn);
      const checkOutDate = new Date(input.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Check-in date cannot be in the past",
        });
      }
      if (checkOutDate <= checkInDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Check-out date must be after check-in date",
        });
      }
      if (input.adults + input.children > 20) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 20 guests per booking. Use group booking for larger parties.",
        });
      }

      const db = getDb();

      // ── Verify property exists ──
      const property = await db
        .select()
        .from(properties)
        .where(eq(properties.id, input.propertyId))
        .limit(1);

      if (property.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Property ${input.propertyId} not found`,
        });
      }

      // ── Conflict detection: check for overlapping bookings ──
      const conflicts = await checkAvailabilityConflict(
        input.propertyId,
        input.checkIn,
        input.checkOut
      );

      if (conflicts > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `This property is not available for the selected dates (${conflicts} conflicting booking(s)). Please choose different dates.",
        });
      }

      // ── Create booking ──
      const bookingRef = generateBookingRef();

      try {
        const result = await db.insert(bookings).values({
          propertyId: input.propertyId,
          userId: input.userId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          adults: input.adults,
          children: input.children,
          roomType: input.roomType,
          totalPrice: input.totalPrice,
          status: "pending",
          addShuttle: input.addShuttle,
          seasonPass: input.seasonPass,
          bookingRef,
        });

        const bookingId = Number(result[0].insertId);

        // ── Block availability ──
        await blockAvailability(
          input.propertyId,
          input.checkIn,
          input.checkOut,
          bookingId
        );

        return {
          id: bookingId,
          bookingRef,
          propertyId: input.propertyId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          totalPrice: input.totalPrice,
          status: "pending",
          message: "Booking created successfully. Payment required to confirm.",
        };
      } catch (err: any) {
        // If availability blocking fails, we should rollback —
        // but MySQL auto-commit means the booking is already saved.
        // Log this edge case for manual cleanup.
        console.error(`[BOOKING] Created booking ${bookingRef} but availability block failed:`, err.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Booking partially created. Please contact support.",
        });
      }
    }),

  // List bookings for a user — with error handling
  listByUser: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        return db
          .select()
          .from(bookings)
          .where(eq(bookings.userId, input.userId))
          .orderBy(desc(bookings.checkIn));
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch bookings",
        });
      }
    }),

  // List bookings for a host's properties
  listByHost: publicQuery
    .input(z.object({ hostId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        // Get all properties owned by this host, then their bookings
        const hostProperties = await db
          .select({ id: properties.id })
          .from(properties)
          .where(eq(properties.ownerId, hostId));

        if (hostProperties.length === 0) return [];

        const propertyIds = hostProperties.map((p) => p.id);
        return db
          .select()
          .from(bookings)
          .where(sql`${bookings.propertyId} IN (${propertyIds.join(",")})`)
          .orderBy(desc(bookings.checkIn));
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch host bookings",
        });
      }
    }),

  // Cancel a booking — with validation
  cancel: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Booking ${input.id} not found`,
        });
      }

      if (existing[0].status === "cancelled") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking is already cancelled",
        });
      }

      if (existing[0].status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot cancel a completed booking",
        });
      }

      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, input.id));

      // Release availability
      await db
        .update(availability)
        .set({ isBooked: 0, bookingId: sql`NULL` })
        .where(eq(availability.bookingId, input.id));

      return { success: true, bookingRef: existing[0].bookingRef };
    }),

  // Confirm a pending booking
  confirm: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Booking ${input.id} not found`,
        });
      }

      if (existing[0].status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot confirm booking with status: ${existing[0].status}`,
        });
      }

      await db
        .update(bookings)
        .set({ status: "confirmed" })
        .where(eq(bookings.id, input.id));

      return { success: true, bookingRef: existing[0].bookingRef };
    }),

  // Get booking by reference number
  byRef: publicQuery
    .input(z.object({ bookingRef: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(bookings)
        .where(eq(bookings.bookingRef, input.bookingRef))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Booking ${input.bookingRef} not found`,
        });
      }

      return result[0];
    }),
});

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, properties } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `KIT-${year}-${random}`;
}

export const bookingRouter = createRouter({
  // Create a new booking
  create: publicQuery
    .input(
      z.object({
        propertyId: z.number().positive(),
        userId: z.number().positive(),
        checkIn: z.string(), // ISO date string
        checkOut: z.string(), // ISO date string
        adults: z.number().positive().default(1),
        children: z.number().default(0),
        roomType: z
          .enum(["multi_share", "twin", "private"])
          .default("private"),
        totalPrice: z.number().positive(),
        addShuttle: z.number().default(0),
        seasonPass: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const bookingRef = generateBookingRef();

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

      return {
        id: Number(result[0].insertId),
        bookingRef,
        ...input,
        status: "pending",
      };
    }),

  // List bookings for a user
  listByUser: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, input.userId))
        .orderBy(desc(bookings.createdAt));
    }),

  // List bookings for properties owned by a host
  listByHost: publicQuery
    .input(z.object({ ownerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      // Get all property IDs owned by this host
      const hostProperties = await db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.ownerId, input.ownerId));

      if (hostProperties.length === 0) {
        return [];
      }

      // Get all bookings for those properties
      const propertyIds = hostProperties.map((p) => p.id);

      const hostBookings = await db
        .select()
        .from(bookings)
        .where(
          sql`${bookings.propertyId} IN (${propertyIds.join(", ")})`,
        )
        .orderBy(desc(bookings.createdAt));

      return hostBookings;
    }),

  // Cancel a booking
  cancel: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, input.id));
      return { success: true };
    }),

  // Confirm a pending booking
  confirm: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(bookings)
        .set({ status: "confirmed" })
        .where(eq(bookings.id, input.id));
      return { success: true };
    }),
});

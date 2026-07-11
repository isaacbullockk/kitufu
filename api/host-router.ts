import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { hostProfiles, properties, bookings } from "@db/schema";
import { eq, sql } from "drizzle-orm";

export const hostRouter = createRouter({
  // Register or update host profile
  register: publicQuery
    .input(
      z.object({
        userId: z.number().positive(),
        companyName: z.string().optional(),
        utbNumber: z.string().optional(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .insert(hostProfiles)
        .values({
          userId: input.userId,
          companyName: input.companyName ?? null,
          utbNumber: input.utbNumber ?? null,
          phone: input.phone ?? null,
        })
        .onDuplicateKeyUpdate({
          set: {
            companyName: input.companyName ?? null,
            utbNumber: input.utbNumber ?? null,
            phone: input.phone ?? null,
          },
        });

      return { success: true };
    }),

  // Get host profile by userId
  getProfile: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(hostProfiles)
        .where(eq(hostProfiles.userId, input.userId));
      return result[0] ?? null;
    }),

  // List properties owned by a host
  listMyProperties: publicQuery
    .input(z.object({ ownerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(properties)
        .where(eq(properties.ownerId, input.ownerId));
    }),

  // Get host earnings/occupancy stats
  getStats: publicQuery
    .input(z.object({ ownerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      // Get host's properties
      const myProperties = await db
        .select()
        .from(properties)
        .where(eq(properties.ownerId, input.ownerId));

      const propertyIds = myProperties.map((p) => p.id);

      if (propertyIds.length === 0) {
        return {
          totalProperties: 0,
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          occupancyRate: 0,
        };
      }

      // Get all bookings for these properties
      const myBookings = await db
        .select()
        .from(bookings)
        .where(
          sql`${bookings.propertyId} IN (${propertyIds.join(", ")})`,
        );

      const totalBookings = myBookings.length;
      const confirmedBookings = myBookings.filter(
        (b) => b.status === "confirmed",
      ).length;
      const pendingBookings = myBookings.filter(
        (b) => b.status === "pending",
      ).length;
      const cancelledBookings = myBookings.filter(
        (b) => b.status === "cancelled",
      ).length;
      const totalRevenue = myBookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + b.totalPrice, 0);

      // Occupancy rate = confirmed bookings / (total properties * 30 days) as a rough estimate
      const occupancyRate =
        totalBookings > 0
          ? Math.round((confirmedBookings / totalBookings) * 100)
          : 0;

      return {
        totalProperties: myProperties.length,
        totalBookings,
        totalRevenue,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        occupancyRate,
      };
    }),
});

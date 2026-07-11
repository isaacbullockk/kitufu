import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties, bookings } from "@db/schema";
import { eq, sql, desc } from "drizzle-orm";

export const adminRouter = createRouter({
  // List all pending properties (for admin approval)
  listPendingProperties: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(properties)
      .where(eq(properties.status, "pending"));
  }),

  // Approve a property
  approveProperty: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(properties)
        .set({ status: "approved" })
        .where(eq(properties.id, input.id));
      return { success: true, status: "approved" };
    }),

  // Reject a property
  rejectProperty: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(properties)
        .set({ status: "rejected" })
        .where(eq(properties.id, input.id));
      return { success: true, status: "rejected" };
    }),

  // List all bookings with pagination
  listAllBookings: publicQuery
    .input(
      z
        .object({
          page: z.number().positive().default(1),
          limit: z.number().positive().default(20),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const allBookings = await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(bookings);
      const totalCount = Number(countResult[0]?.count ?? 0);

      return {
        bookings: allBookings,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Get platform-wide stats
  getStats: publicQuery.query(async () => {
    const db = getDb();

    // Total properties
    const propertyCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(properties);
    const totalProperties = Number(propertyCount[0]?.count ?? 0);

    // Total bookings
    const bookingCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings);
    const totalBookings = Number(bookingCount[0]?.count ?? 0);

    // Total revenue (confirmed + completed bookings)
    const revenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
      })
      .from(bookings)
      .where(
        sql`${bookings.status} IN ('confirmed', 'completed')`,
      );
    const totalRevenue = Number(revenueResult[0]?.total ?? 0);

    // Pending properties count
    const pendingCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(properties)
      .where(eq(properties.status, "pending"));
    const pendingProperties = Number(pendingCount[0]?.count ?? 0);

    // Booking status breakdown
    const confirmedCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"));
    const confirmedBookings = Number(confirmedCount[0]?.count ?? 0);

    const cancelledCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(eq(bookings.status, "cancelled"));
    const cancelledBookings = Number(cancelledCount[0]?.count ?? 0);

    const completedCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(eq(bookings.status, "completed"));
    const completedBookings = Number(completedCount[0]?.count ?? 0);

    const pendingBookingCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(eq(bookings.status, "pending"));
    const pendingBookings = Number(pendingBookingCount[0]?.count ?? 0);

    return {
      totalProperties,
      totalBookings,
      totalRevenue,
      pendingProperties,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      pendingBookings,
      approvedProperties: totalProperties - pendingProperties,
    };
  }),
});

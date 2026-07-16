import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties, bookings } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const adminRouter = createRouter({
  // List pending properties for approval
  listPendingProperties: publicQuery
    .query(async () => {
      try {
        const db = getDb();
        return db
          .select()
          .from(properties)
          .where(eq(properties.status, "pending"))
          .orderBy(desc(properties.createdAt));
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch pending properties",
        });
      }
    }),

  // Approve a property
  approveProperty: publicQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        const existing = await db
          .select()
          .from(properties)
          .where(eq(properties.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Property " + input.id + " not found" });
        }

        await db
          .update(properties)
          .set({ status: "approved" })
          .where(eq(properties.id, input.id));

        return { success: true, id: input.id, status: "approved" };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to approve property" });
      }
    }),

  // Reject a property
  rejectProperty: publicQuery
    .input(z.object({ id: z.number().positive(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        const existing = await db
          .select()
          .from(properties)
          .where(eq(properties.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Property " + input.id + " not found" });
        }

        await db
          .update(properties)
          .set({ status: "rejected" })
          .where(eq(properties.id, input.id));

        return { success: true, id: input.id, status: "rejected", reason: input.reason };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reject property" });
      }
    }),

  // List all bookings (paginated)
  listAllBookings: publicQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const limit = input?.limit || 20;
        const offset = input?.offset || 0;

        let query = db.select().from(bookings);
        if (input?.status) {
          query = query.where(eq(bookings.status, input.status as any));
        }

        const items = await query.limit(limit).offset(offset).orderBy(desc(bookings.createdAt));
        const total = await db.select({ count: sql<number>"count(*)" }).from(bookings);

        return {
          items,
          total: total[0]?.count || 0,
          limit,
          offset,
        };
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch bookings" });
      }
    }),

  // Get platform stats
  getStats: publicQuery
    .query(async () => {
      try {
        const db = getDb();

        const totalProperties = await db.select({ count: sql<number>"count(*)" }).from(properties);
        const totalBookings = await db.select({ count: sql<number>"count(*)" }).from(bookings);
        const pendingProperties = await db.select({ count: sql<number>"count(*)" }).from(properties).where(eq(properties.status, "pending"));
        const approvedProperties = await db.select({ count: sql<number>"count(*)" }).from(properties).where(eq(properties.status, "approved"));

        const revenue = await db
          .select({ total: sql<number>"COALESCE(SUM(totalPrice), 0)" })
          .from(bookings)
          .where(eq(bookings.status, "confirmed"));

        return {
          totalProperties: totalProperties[0]?.count || 0,
          totalBookings: totalBookings[0]?.count || 0,
          pendingProperties: pendingProperties[0]?.count || 0,
          approvedProperties: approvedProperties[0]?.count || 0,
          totalRevenue: revenue[0]?.total || 0,
        };
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch stats" });
      }
    }),
});

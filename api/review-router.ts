import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const reviewRouter = createRouter({
  create: publicQuery
    .input(z.object({
      propertyId: z.number().positive(),
      userId: z.number().positive(),
      userName: z.string().min(1, "Name required"),
      userType: z.enum(["guest", "host"]),
      rating: z.number().min(1).max(5),
      comment: z.string().min(5, "Comment must be at least 5 characters").max(1000, "Max 1000 characters"),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        const result = await db.insert(reviews).values({
          propertyId: input.propertyId,
          userId: input.userId,
          userName: input.userName,
          userType: input.userType,
          rating: input.rating,
          comment: input.comment,
        });
        return { id: Number(result[0].insertId), success: true };
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to submit review: " + err.message });
      }
    }),

  list: publicQuery
    .input(z.object({ propertyId: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        return db.select().from(reviews).where(eq(reviews.propertyId, input.propertyId)).orderBy(desc(reviews.createdAt));
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch reviews" });
      }
    }),

  stats: publicQuery
    .input(z.object({ propertyId: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const all = await db.select().from(reviews).where(eq(reviews.propertyId, input.propertyId));
        if (all.length === 0) return { average: 0, count: 0, guestCount: 0, hostCount: 0 };
        const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
        return {
          average: Math.round(avg * 10) / 10,
          count: all.length,
          guestCount: all.filter(r => r.userType === "guest").length,
          hostCount: all.filter(r => r.userType === "host").length,
        };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch review stats" });
      }
    }),

  delete: publicQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        await db.delete(reviews).where(eq(reviews.id, input.id));
        return { success: true };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete review" });
      }
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { hostProfiles, properties } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const hostRouter = createRouter({
  // Register as a host
  register: publicQuery
    .input(
      z.object({
        userId: z.number().positive(),
        companyName: z.string().min(2, "Company name required").max(255),
        utbNumber: z.string().min(3, "UTB number required").max(50),
        phone: z.string().min(5, "Phone required").max(20),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        // Check if already registered
        const existing = await db
          .select()
          .from(hostProfiles)
          .where(eq(hostProfiles.userId, input.userId))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Host profile already exists for this user",
          });
        }

        const result = await db.insert(hostProfiles).values({
          userId: input.userId,
          companyName: input.companyName,
          utbNumber: input.utbNumber,
          phone: input.phone,
          verified: false,
        });

        return {
          id: Number(result[0].insertId),
          userId: input.userId,
          companyName: input.companyName,
          verified: false,
        };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Host registration failed: " + err.message,
        });
      }
    }),

  // Get host profile
  getProfile: publicQuery
    .input(z.object({ userId: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const result = await db
          .select()
          .from(hostProfiles)
          .where(eq(hostProfiles.userId, input.userId))
          .limit(1);

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Host profile not found",
          });
        }

        return result[0];
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch host profile",
        });
      }
    }),

  // List host's properties
  listMyProperties: publicQuery
    .input(z.object({ ownerId: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        return db
          .select()
          .from(properties)
          .where(eq(properties.ownerId, input.ownerId))
          .orderBy(desc(properties.createdAt));
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch properties",
        });
      }
    }),

  // Get host stats
  getStats: publicQuery
    .input(z.object({ hostId: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const myProperties = await db
          .select()
          .from(properties)
          .where(eq(properties.ownerId, input.hostId));

        const propertyIds = myProperties.map((p) => p.id);

        return {
          totalProperties: myProperties.length,
          approvedProperties: myProperties.filter((p) => p.status === "approved").length,
          pendingProperties: myProperties.filter((p) => p.status === "pending").length,
          propertyIds,
        };
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch host stats",
        });
      }
    }),
});

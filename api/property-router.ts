import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties, bookings } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const propertyRouter = createRouter({
  // List properties with filters
  list: publicQuery
    .input(
      z.object({
        city: z.string().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        roomType: z.enum(["multi_share", "twin", "private"]).optional(),
        hasShuttle: z.boolean().optional(),
        isGroupFriendly: z.boolean().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const db = getDb();
        let query = db.select().from(properties);

        const conditions = [];
        if (input?.city) conditions.push(eq(properties.location, input.city));
        if (input?.minPrice !== undefined) conditions.push(sql`${properties.pricePerNight} >= ${input.minPrice}`);
        if (input?.maxPrice !== undefined) conditions.push(sql`${properties.pricePerNight} <= ${input.maxPrice}`);
        if (input?.roomType) conditions.push(sql`${properties.amenities} LIKE ${`%${input.roomType}%`}`);
        if (input?.hasShuttle !== undefined) conditions.push(eq(properties.hasShuttle, input.hasShuttle ? 1 : 0));
        if (input?.isGroupFriendly !== undefined) conditions.push(eq(properties.isGroupFriendly, input.isGroupFriendly ? 1 : 0));
        if (input?.status) conditions.push(eq(properties.status, input.status));

        // Default: only show approved properties
        if (!input?.status) {
          conditions.push(eq(properties.status, "approved"));
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as typeof query;
        }

        return query.orderBy(desc(properties.createdAt));
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch properties",
        });
      }
    }),

  // Get single property by ID
  byId: publicQuery
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const result = await db
          .select()
          .from(properties)
          .where(eq(properties.id, input.id))
          .limit(1);

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Property " + input.id + " not found",
          });
        }

        return result[0];
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch property",
        });
      }
    }),

  // Create a new property listing
  create: publicQuery
    .input(
      z.object({
        title: z.string().min(3, "Title must be at least 3 characters").max(255),
        description: z.string().min(10, "Description must be at least 10 characters"),
        location: z.string().min(1, "Location is required"),
        pricePerNight: z.number().positive("Price must be positive"),
        capacity: z.number().positive("Capacity must be positive"),
        bedrooms: z.number().min(0).default(0),
        bathrooms: z.number().min(0).default(0),
        amenities: z.string().optional(), // JSON string
        images: z.string().optional(), // JSON string of URLs
        isKitufu: z.boolean().default(false),
        hasShuttle: z.boolean().default(false),
        isGroupFriendly: z.boolean().default(false),
        distanceToStadium: z.string().optional(),
        ownerId: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        // Validate owner exists
        const owner = await db
          .select({ id: sql<number>"1" })
          .from(sql`users`)
          .where(sql`id = ${input.ownerId}`)
          .limit(1);

        const result = await db.insert(properties).values({
          ...input,
          status: "pending",
          amenities: input.amenities || "[]",
          images: input.images || "[]",
          isKitufu: input.isKitufu ? 1 : 0,
          hasShuttle: input.hasShuttle ? 1 : 0,
          isGroupFriendly: input.isGroupFriendly ? 1 : 0,
        });

        return {
          id: Number(result[0].insertId),
          ...input,
          status: "pending",
        };
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create property: " + err.message,
        });
      }
    }),

  // Get availability for a property
  getAvailability: publicQuery
    .input(z.object({ propertyId: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        return db
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.propertyId, input.propertyId),
              sql`${bookings.status} IN ('pending', 'confirmed')`
            )
          )
          .orderBy(bookings.checkIn);
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch availability",
        });
      }
    }),
});

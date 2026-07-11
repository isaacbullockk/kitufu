import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties } from "@db/schema";
import { eq, and, like, sql } from "drizzle-orm";

export const propertyRouter = createRouter({
  // List all properties (with optional filters)
  list: publicQuery
    .input(
      z
        .object({
          location: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          kitufuOnly: z.boolean().optional(),
          hasShuttle: z.boolean().optional(),
          groupFriendly: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();

      const conditions = [];
      if (input?.location)
        conditions.push(eq(properties.location, input.location));
      if (input?.kitufuOnly) conditions.push(eq(properties.isKitufu, 1));
      if (input?.hasShuttle) conditions.push(eq(properties.hasShuttle, 1));
      if (input?.groupFriendly)
        conditions.push(eq(properties.isGroupFriendly, 1));
      if (input?.minPrice)
        conditions.push(
          sql`${properties.pricePerNight} >= ${input.minPrice}`,
        );
      if (input?.maxPrice)
        conditions.push(
          sql`${properties.pricePerNight} <= ${input.maxPrice}`,
        );
      if (input?.search)
        conditions.push(like(properties.title, `%${input.search}%`));

      // Only show approved properties publicly
      conditions.push(eq(properties.status, "approved"));

      if (conditions.length > 0) {
        return db
          .select()
          .from(properties)
          .where(and(...conditions));
      }
      return db.select().from(properties);
    }),

  // Get single property by ID
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(properties)
        .where(eq(properties.id, input.id));
      return result[0] ?? null;
    }),

  // Create property (for hosts)
  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        location: z.string(),
        address: z.string().optional(),
        pricePerNight: z.number().positive(),
        capacity: z.number().positive().default(2),
        bedrooms: z.number().default(1),
        bathrooms: z.number().default(1),
        amenities: z.string().optional(),
        images: z.string().optional(),
        isKitufu: z.number().default(0),
        hasShuttle: z.number().default(0),
        isGroupFriendly: z.number().default(0),
        distanceToStadium: z.string().optional(),
        ownerId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(properties).values(input);
      return { id: Number(result[0].insertId), ...input };
    }),
});

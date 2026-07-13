import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { groupEnquiries } from "@db/schema";
import { desc } from "drizzle-orm";

export const groupBookingRouter = createRouter({
  submit: publicQuery
    .input(z.object({
      groupName: z.string().min(1),
      contactName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      groupSize: z.number().positive(),
      preferredCity: z.string().optional(),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
      budgetPerPerson: z.number().optional(),
      requirements: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(groupEnquiries).values({
        ...input,
        checkIn: input.checkIn || null,
        checkOut: input.checkOut || null,
      });
      return { id: Number(result[0].insertId), status: "new" };
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(groupEnquiries).orderBy(desc(groupEnquiries.createdAt));
  }),
});

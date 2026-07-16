import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { groupEnquiries } from "@db/schema";
import { desc } from "drizzle-orm";

export const groupBookingRouter = createRouter({
  submit: publicQuery
    .input(z.object({
      groupName: z.string().min(1, "Group name is required"),
      contactName: z.string().min(1, "Contact name is required"),
      email: z.string().email("Valid email required"),
      phone: z.string().optional(),
      groupSize: z.number().positive("Group size must be positive"),
      preferredCity: z.string().optional(),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
      budgetPerPerson: z.number().min(0).optional(),
      requirements: z.string().max(2000, "Requirements max 2000 characters").optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        const result = await db.insert(groupEnquiries).values({
          ...input,
          checkIn: input.checkIn || null,
          checkOut: input.checkOut || null,
        });
        return { id: Number(result[0].insertId), status: "new" };
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Enquiry submission failed: " + err.message,
        });
      }
    }),

  list: publicQuery.query(async () => {
    try {
      const db = getDb();
      return db.select().from(groupEnquiries).orderBy(desc(groupEnquiries.createdAt));
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch enquiries",
      });
    }
  }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, properties } from "@db/schema";
import { eq } from "drizzle-orm";

// Flutterwave config
const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY || "";
const FLW_PUBLIC = process.env.FLUTTERWAVE_PUBLIC_KEY || "";

interface FlutterwavePayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: { email: string; name: string; phone_number?: string };
  customizations: { title: string; description: string; logo: string };
  meta?: { bookingRef: string; propertyId: number };
}

async function flutterwaveRequest(endpoint: string, body: any): Promise<any> {
  const resp = await fetch("https://api.flutterwave.com/v3/" + endpoint, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + FLW_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return resp.json();
}

export const paymentRouter = createRouter({
  // Initialize a payment — returns Flutterwave checkout link
  initialize: publicQuery
    .input(z.object({
      bookingRef: z.string().min(1),
      propertyId: z.number().positive(),
      amount: z.number().positive(),
      currency: z.string().default("UGX"),
      email: z.string().email(),
      name: z.string().min(1),
      phone: z.string().optional(),
      redirectUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      if (!FLW_SECRET) {
        // Demo mode: return a mock payment link
        return {
          paymentLink: input.redirectUrl + "?status=successful&tx_ref=" + input.bookingRef + "&transaction_id=demo-" + Date.now(),
          txRef: input.bookingRef,
          demo: true,
        };
      }

      try {
        // Get property name for display
        const db = getDb();
        const prop = await db.select().from(properties).where(eq(properties.id, input.propertyId)).limit(1);
        const propertyTitle = prop[0]?.title || "Kitufu Booking";

        const payload: FlutterwavePayload = {
          tx_ref: input.bookingRef,
          amount: input.amount,
          currency: input.currency,
          redirect_url: input.redirectUrl,
          customer: {
            email: input.email,
            name: input.name,
            phone_number: input.phone,
          },
          customizations: {
            title: "Kitufu Residences",
            description: "Booking payment for " + propertyTitle,
            logo: "https://kitufu.com/logo.png",
          },
          meta: {
            bookingRef: input.bookingRef,
            propertyId: input.propertyId,
          },
        };

        const result = await flutterwaveRequest("payments", payload);

        if (result.status === "success" && result.data?.link) {
          return {
            paymentLink: result.data.link,
            txRef: input.bookingRef,
            demo: false,
          };
        } else {
          throw new Error(result.message || "Payment initialization failed");
        }
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Payment failed: " + err.message });
      }
    }),

  // Verify a payment (called after redirect from Flutterwave)
  verify: publicQuery
    .input(z.object({
      transactionId: z.string().min(1),
      bookingRef: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        // Find booking
        const booking = await db.select().from(bookings).where(eq(bookings.bookingRef, input.bookingRef)).limit(1);
        if (booking.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }

        if (!FLW_SECRET || input.transactionId.startsWith("demo-")) {
          // Demo mode: auto-confirm
          await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking[0].id));
          return { success: true, status: "confirmed", demo: true };
        }

        // Verify with Flutterwave
        const resp = await fetch("https://api.flutterwave.com/v3/transactions/" + input.transactionId + "/verify", {
          headers: { "Authorization": "Bearer " + FLW_SECRET },
        });
        const result = await resp.json();

        if (result.status === "success" && result.data?.status === "successful") {
          await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking[0].id));
          return { success: true, status: "confirmed", amount: result.data.amount, currency: result.data.currency };
        } else {
          return { success: false, status: "failed", message: result.message || "Payment not successful" };
        }
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Verification failed: " + err.message });
      }
    }),

  // Get Flutterwave public key (for frontend inline payment)
  publicKey: publicQuery.query(() => {
    return { key: FLW_PUBLIC, demo: !FLW_SECRET };
  }),
});

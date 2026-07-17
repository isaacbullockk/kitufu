import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings } from "@db/schema";
import { eq } from "drizzle-orm";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";

export const stripeRouter = createRouter({
  // Create a Stripe Checkout session
  createSession: publicQuery
    .input(z.object({
      bookingRef: z.string().min(1),
      amount: z.number().positive(), // in cents/smallest currency unit
      currency: z.string().default("usd"),
      propertyName: z.string(),
      customerEmail: z.string().email(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      if (!STRIPE_SECRET) {
        // Demo mode
        return {
          sessionUrl: input.successUrl + "?session_id=demo-stripe-" + Date.now() + "&booking_ref=" + input.bookingRef,
          sessionId: "demo-stripe-" + Date.now(),
          demo: true,
        };
      }

      try {
        const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + STRIPE_SECRET,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            payment_method_types: "card",
            line_items: JSON.stringify([{
              price_data: {
                currency: input.currency.toLowerCase(),
                product_data: { name: "Booking: " + input.propertyName, description: "Kitufu Residences - " + input.bookingRef },
                unit_amount: Math.round(input.amount),
              },
              quantity: 1,
            }]),
            mode: "payment",
            success_url: input.successUrl + "?session_id={CHECKOUT_SESSION_ID}&booking_ref=" + input.bookingRef,
            cancel_url: input.cancelUrl,
            customer_email: input.customerEmail,
            metadata: JSON.stringify({ bookingRef: input.bookingRef }),
          }),
        });

        const result = await resp.json();
        if (result.url) {
          return { sessionUrl: result.url, sessionId: result.id, demo: false };
        } else {
          throw new Error(result.error?.message || "Stripe session creation failed");
        }
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe error: " + err.message });
      }
    }),

  // Verify Stripe payment
  verify: publicQuery
    .input(z.object({
      sessionId: z.string().min(1),
      bookingRef: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        const booking = await db.select().from(bookings).where(eq(bookings.bookingRef, input.bookingRef)).limit(1);
        if (booking.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });

        if (!STRIPE_SECRET || input.sessionId.startsWith("demo-")) {
          await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking[0].id));
          return { success: true, status: "confirmed", demo: true };
        }

        const resp = await fetch("https://api.stripe.com/v1/checkout/sessions/" + input.sessionId, {
          headers: { "Authorization": "Bearer " + STRIPE_SECRET },
        });
        const result = await resp.json();

        if (result.payment_status === "paid") {
          await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking[0].id));
          return { success: true, status: "confirmed", amount: result.amount_total, currency: result.currency };
        } else {
          return { success: false, status: result.payment_status };
        }
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe verify failed: " + err.message });
      }
    }),

  // Get Stripe publishable key
  publicKey: publicQuery.query(() => {
    return { key: process.env.STRIPE_PUBLISHABLE_KEY || "", demo: !STRIPE_SECRET };
  }),
});

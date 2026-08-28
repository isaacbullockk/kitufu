import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings } from "@db/schema";
import { eq } from "drizzle-orm";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";


const ALLOWED_REDIRECT_HOSTS = new Set([
  "kitufu.com", "www.kitufu.com", "localhost", "127.0.0.1",
]);
function assertAllowedRedirect(url: string) {
  try {
    const h = new URL(url).hostname;
    if (!ALLOWED_REDIRECT_HOSTS.has(h) && !h.endsWith(".kitufu.com")) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Redirect URL host not allowed" });
    }
  } catch (e) {
    if (e instanceof TRPCError) throw e;
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid redirect URL" });
  }
}

export const stripeRouter = createRouter({
  // Create a Stripe Checkout session
  createSession: publicQuery
    .input(z.object({
      bookingRef: z.string().min(1),
      amount: z.number().positive().optional(), // IGNORED — amount is server-authoritative
      currency: z.string().default("ugx"),
      propertyName: z.string().optional(),
      customerEmail: z.string().email(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      assertAllowedRedirect(input.successUrl);
      assertAllowedRedirect(input.cancelUrl);
      if (!STRIPE_SECRET) {
        // Demo mode
        return {
          sessionUrl: input.successUrl + "?session_id=demo-stripe-" + Date.now() + "&booking_ref=" + input.bookingRef,
          sessionId: "demo-stripe-" + Date.now(),
          demo: true,
        };
      }

      try {
        // Server-authoritative amount: look up the booking, never trust the client.
        // UGX is a zero-decimal currency in Stripe — unit_amount is the shilling amount directly.
        const db = getDb();
        const bk = await db.select().from(bookings).where(eq(bookings.bookingRef, input.bookingRef)).limit(1);
        if (bk.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        if (bk[0].status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Booking is not awaiting payment (status: " + bk[0].status + ")" });
        const serverAmount = bk[0].totalPrice;

        const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + STRIPE_SECRET,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "payment_method_types[0]": "card",
            "line_items[0][price_data][currency]": "ugx",
            "line_items[0][price_data][product_data][name]": "Kitufu Booking " + input.bookingRef,
            "line_items[0][price_data][product_data][description]": "Kitufu Residences — AFCON 2027 Uganda",
            "line_items[0][price_data][unit_amount]": String(serverAmount),
            "line_items[0][quantity]": "1",
            "mode": "payment",
            "success_url": input.successUrl + (input.successUrl.includes("?") ? "&" : "?") + "session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": input.cancelUrl,
            "customer_email": input.customerEmail,
            "metadata[bookingRef]": input.bookingRef,
          }),
        });

        const result = (await resp.json()) as any;
        if (result.url) {
          return { sessionUrl: result.url, sessionId: result.id, demo: false };
        } else {
          throw new Error(result.error?.message || "Stripe session creation failed");
        }
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
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

        if (!STRIPE_SECRET) {
          // Demo mode ONLY when no Stripe key is configured at all
          await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking[0].id));
          return { success: true, status: "confirmed", demo: true };
        }

        const resp = await fetch("https://api.stripe.com/v1/checkout/sessions/" + input.sessionId, {
          headers: { "Authorization": "Bearer " + STRIPE_SECRET },
        });
        const result = (await resp.json()) as any;

        if (result.payment_status === "paid") {
          // Bind the session to THIS booking — blocks replaying one paid session across many bookings
          if (result.metadata?.bookingRef !== input.bookingRef) {
            return { success: false, status: "reference_mismatch", message: "Session does not belong to this booking" };
          }
          // Only a pending booking can be confirmed — blocks session re-use
          if (booking[0].status !== "pending") {
            return { success: false, status: "already_" + booking[0].status, message: "Booking is not awaiting payment" };
          }
          // Amount check (UGX zero-decimal — amount_total is shillings)
          const paid = Number(result.amount_total);
          const expected = Number(booking[0].totalPrice);
          if (!Number.isFinite(paid) || paid < expected) {
            return { success: false, status: "amount_mismatch", message: "Paid amount " + paid + " does not cover booking total " + expected };
          }
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

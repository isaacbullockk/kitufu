import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, properties } from "@db/schema";
import { and, eq } from "drizzle-orm";
import { getBookingCurrency } from "../contracts/booking-pricing";

// Flutterwave config
const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY || "";
const FLW_PUBLIC = process.env.FLUTTERWAVE_PUBLIC_KEY || "";

interface FlutterwavePayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_options: string;
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


// Redirect targets must stay on our own origin — blocks open-redirect / phishing via payment callbacks
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

export const paymentRouter = createRouter({
  // Initialize a payment — returns Flutterwave checkout link
  initialize: publicQuery
    .input(z.object({
      bookingRef: z.string().min(1),
      email: z.string().email(),
      name: z.string().min(1),
      phone: z.string().optional(),
      redirectUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      assertAllowedRedirect(input.redirectUrl);
      const db = getDb();
      const bk = await db.select().from(bookings).where(eq(bookings.bookingRef, input.bookingRef)).limit(1);
      if (bk.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      if (bk[0].status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Booking is not awaiting payment" });
      }

      const [property] = await db.select().from(properties).where(
        and(eq(properties.id, bk[0].propertyId), eq(properties.status, "approved"))
      ).limit(1);
      if (!property) throw new TRPCError({ code: "NOT_FOUND", message: "Property is not available for payment" });

      const currencyCode = getBookingCurrency(property.countryCode);
      if (!currencyCode || currencyCode !== (bk[0].currencyCode || "UGX") || property.currencyCode !== currencyCode) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Booking and property currencies do not match" });
      }

      if (!FLW_SECRET) {
        if (currencyCode !== "UGX") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Flutterwave credentials are required for live KES and TZS payments" });
        }
        // Demo mode: return a mock payment link
        return {
          paymentLink: input.redirectUrl + "?status=successful&tx_ref=" + input.bookingRef + "&transaction_id=demo-" + Date.now(),
          txRef: input.bookingRef,
          demo: true,
        };
      }

      try {
        const serverAmount = bk[0].totalPrice;
        const paymentOptions = {
          UGX: "card, mobilemoneyuganda",
          KES: "card, mpesa",
          TZS: "card, mobilemoneytanzania",
        }[currencyCode];

        const payload: FlutterwavePayload = {
          tx_ref: input.bookingRef,
          amount: serverAmount,
          currency: currencyCode,
          redirect_url: input.redirectUrl,
          payment_options: paymentOptions,
          customer: {
            email: input.email,
            name: input.name,
            phone_number: input.phone,
          },
          customizations: {
            title: "Kitufu Residences",
            description: "Booking payment for " + property.title,
            logo: "https://kitufu.com/logo.png",
          },
          meta: {
            bookingRef: input.bookingRef,
            propertyId: property.id,
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

        const currencyCode = booking[0].currencyCode || "UGX";
        if (!FLW_SECRET) {
          if (currencyCode !== "UGX") {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Flutterwave credentials are required to verify this payment" });
          }
          // Demo mode ONLY when no Flutterwave key is configured at all
          await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking[0].id));
          return { success: true, status: "confirmed", demo: true };
        }

        // Verify with Flutterwave
        const resp = await fetch("https://api.flutterwave.com/v3/transactions/" + input.transactionId + "/verify", {
          headers: { "Authorization": "Bearer " + FLW_SECRET },
        });
        const result = (await resp.json()) as any;

        if (result.status === "success" && result.data?.status === "successful") {
          // Bind the transaction to THIS booking — blocks replaying one payment across many bookings
          if (result.data.tx_ref !== input.bookingRef) {
            return { success: false, status: "reference_mismatch", message: "Transaction does not belong to this booking" };
          }
          if (result.data.currency !== currencyCode) {
            return { success: false, status: "currency_mismatch", message: "Transaction currency does not match the booking" };
          }
          // Only a pending booking can be confirmed — blocks re-using the same transaction
          if (booking[0].status !== "pending") {
            return { success: false, status: "already_" + booking[0].status, message: "Booking is not awaiting payment" };
          }
          // Amount check: never confirm a booking whose payment is short
          const paid = Number(result.data.amount);
          const expected = Number(booking[0].totalPrice);
          if (!Number.isFinite(paid) || paid < expected) {
            return {
              success: false,
              status: "amount_mismatch",
              message: "Paid amount " + paid + " does not cover booking total " + expected,
            };
          }
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

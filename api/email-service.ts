// Email service that simulates sending emails
// In production, this would call Resend/SendGrid API

import { getDb } from "./queries/connection";
import { emailLogs } from "@db/schema";

type EmailType = "booking_confirmation" | "host_alert" | "booking_reminder";

export async function sendEmail({
  to,
  type,
  data,
  bookingId,
}: {
  to: string;
  type: EmailType;
  data: Record<string, any>;
  bookingId?: number;
}): Promise<{ success: boolean; messageId: string }> {
  console.log("[EMAIL] " + type + " to " + to, data);

  const messageId = "kitufu-email-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

  try {
    const db = getDb();
    await db.insert(emailLogs).values({
      to,
      type,
      bookingId: bookingId ?? null,
      status: "sent",
      messageId,
    });
  } catch (err) {
    console.error("[EMAIL] Failed to log email:", err);
  }

  return { success: true, messageId };
}

export function bookingConfirmationTemplate(data: {
  bookingRef: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  total: number;
  guestName: string;
}): string {
  return "<h1>Your Kitufu Booking is Confirmed!</h1>" +
    "<p>Hi " + data.guestName + ",</p>" +
    "<p>Your booking at <strong>" + data.propertyTitle + "</strong> is confirmed.</p>" +
    "<p>Reference: <strong>" + data.bookingRef + "</strong></p>" +
    "<p>Dates: " + data.checkIn + " to " + data.checkOut + "</p>" +
    "<p>Total: UGX " + data.total.toLocaleString() + "</p>" +
    "<p>Show this reference at check-in.</p>";
}

export function hostAlertTemplate(data: {
  propertyTitle: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  total: number;
  bookingRef: string;
}): string {
  return "<h1>New Booking Alert</h1>" +
    "<p>Your property <strong>" + data.propertyTitle + "</strong> has a new booking.</p>" +
    "<p>Guest: " + data.guestName + "</p>" +
    "<p>Dates: " + data.checkIn + " to " + data.checkOut + "</p>" +
    "<p>Total: UGX " + data.total.toLocaleString() + "</p>" +
    "<p>Reference: " + data.bookingRef + "</p>";
}

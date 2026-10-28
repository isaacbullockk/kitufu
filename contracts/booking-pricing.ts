export type BookingRoomType = "multi_share" | "twin" | "private";

export const ROOM_PRICE_FACTORS: Record<BookingRoomType, number> = {
  multi_share: 0.5,
  twin: 0.78,
  private: 1.44,
};

export const SERVICE_FEE_UGX = 28;
export const TAX_RATE = 0.18;
export type BookingCurrency = "UGX" | "KES" | "TZS";
export function getBookingCurrency(countryCode: string): BookingCurrency | null {
  switch (countryCode) {
    case "UG": return "UGX";
    case "KE": return "KES";
    case "TZ": return "TZS";
    default: return null;
  }
}
export const MAX_STAY_NIGHTS = 365;
const MAX_BOOKING_TOTAL_UGX = 2_147_483_647;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000) return null;

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

export function getStayNights(checkIn: string, checkOut: string): number {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  if (start === null || end === null || end <= start) return 0;
  return (end - start) / MS_PER_DAY;
}

export function calculateBookingQuote(
  basePricePerNight: number,
  nights: number,
  roomType: BookingRoomType,
  currency: BookingCurrency = "UGX",
): { perNight: number; subtotal: number; serviceFee: number; tax: number; total: number } | null {
  if (
    !Number.isSafeInteger(basePricePerNight) ||
    basePricePerNight <= 0 ||
    !Number.isInteger(nights) ||
    nights < 1 ||
    nights > MAX_STAY_NIGHTS
  ) {
    return null;
  }

  const perNight = Math.round(basePricePerNight * ROOM_PRICE_FACTORS[roomType]);
  const subtotal = perNight * nights;
  const serviceFee = currency === "UGX" ? SERVICE_FEE_UGX : 0;
  const tax = currency === "UGX" ? Math.round(subtotal * TAX_RATE) : 0;
  const total = subtotal + serviceFee + tax;

  if (!Number.isSafeInteger(total) || total > MAX_BOOKING_TOTAL_UGX) {
    return null;
  }

  return { perNight, subtotal, serviceFee, tax, total };
}

import { describe, expect, it } from "vitest";
import {
  calculateBookingQuote,
  getStayNights,
  MAX_STAY_NIGHTS,
} from "../contracts/booking-pricing";

describe("booking date and price calculations", () => {
  it("counts nights using calendar dates without timezone drift", () => {
    expect(getStayNights("2027-06-10", "2027-06-13")).toBe(3);
    expect(getStayNights("2027-06-13", "2027-06-13")).toBe(0);
  });

  it("rejects malformed or impossible calendar dates", () => {
    expect(getStayNights("2027-02-29", "2027-03-02")).toBe(0);
    expect(getStayNights("2027-06-1", "2027-06-02")).toBe(0);
  });

  it("calculates a quote with the shared room factor and fees", () => {
    expect(calculateBookingQuote(100_000, 2, "twin")).toEqual({
      perNight: 78_000,
      subtotal: 156_000,
      serviceFee: 28,
      tax: 28_080,
      total: 184_108,
    });
  });

  it("uses native KES and TZS totals without applying Uganda-only fees and tax", () => {
    expect(calculateBookingQuote(10_000, 2, "twin", "KES")).toEqual({
      perNight: 7_800,
      subtotal: 15_600,
      serviceFee: 0,
      tax: 0,
      total: 15_600,
    });
    expect(calculateBookingQuote(100_000, 1, "private", "TZS")?.total).toBe(144_000);
  });

  it("rejects stays longer than the supported booking window", () => {
    expect(calculateBookingQuote(100_000, MAX_STAY_NIGHTS + 1, "private")).toBeNull();
  });

  it("rejects totals that cannot be stored in the bookings table", () => {
    expect(calculateBookingQuote(2_000_000_000, 2, "private")).toBeNull();
  });
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteConfig, propertyTypes } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Default config — used when DB is empty
const DEFAULT_CONFIG: Record<string, string> = {
  brandName: "Kitufu Residences",
  brandTagline: "The Correct Way to Stay",
  primaryColor: "#E85D04",
  secondaryColor: "#2D6A4F",
  eventName: "AFCON 2027",
  eventYear: "2027",
  eventDates: "June – July 2027",
  currencyCode: "UGX",
  currencySymbol: "USh",
  countryName: "Uganda",
  supportEmail: "hello@kitufu.com",
  supportPhone: "+256 772 123 456",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  googleVerification: "",
  metaTitle: "Kitufu Residences — AFCON 2027 Accommodation",
  metaDescription: "Book verified fan residences for AFCON 2027 in Uganda. Converted homes, apartments, and buildings welcoming football fans.",
};

export const configRouter = createRouter({
  // Get all config as key-value object
  getAll: publicQuery.query(async () => {
    try {
      const db = getDb();
      const rows = await db.select().from(siteConfig);
      const config: Record<string, string> = { ...DEFAULT_CONFIG };
      for (const row of rows) {
        if (row.key && row.value) config[row.key] = row.value;
      }
      return config;
    } catch {
      return DEFAULT_CONFIG;
    }
  }),

  // Get single value
  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const rows = await db.select().from(siteConfig).where(eq(siteConfig.key, input.key)).limit(1);
        return rows[0]?.value || DEFAULT_CONFIG[input.key] || "";
      } catch {
        return DEFAULT_CONFIG[input.key] || "";
      }
    }),

  // Update config values (admin only)
  update: publicQuery
    .input(z.record(z.string(), z.string().nullable()))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        for (const [key, value] of Object.entries(input)) {
          if (value === null) continue;
          const existing = await db.select().from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
          if (existing.length > 0) {
            await db.update(siteConfig).set({ value }).where(eq(siteConfig.key, key));
          } else {
            await db.insert(siteConfig).values({ key, value });
          }
        }
        return { success: true };
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update config: " + err.message });
      }
    }),

  // Reset to defaults
  reset: publicQuery.mutation(async () => {
    try {
      const db = getDb();
      await db.delete(siteConfig);
      for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
        await db.insert(siteConfig).values({ key, value });
      }
      return { success: true };
    } catch (err: any) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reset config: " + err.message });
    }
  }),

  // Property types CRUD
  listPropertyTypes: publicQuery.query(async () => {
    try {
      const db = getDb();
      return db.select().from(propertyTypes).orderBy(propertyTypes.sortOrder);
    } catch {
      // Return defaults if table empty
      return [
        { id: 1, name: "residence", label: "Residence", description: "Private homes converted for short stays", icon: "home", isActive: 1, sortOrder: 1 },
        { id: 2, name: "apartment", label: "Apartment", description: "Serviced apartments with hotel-like amenities", icon: "building", isActive: 1, sortOrder: 2 },
        { id: 3, name: "villa", label: "Villa", description: "Spacious standalone houses for groups", icon: "castle", isActive: 1, sortOrder: 3 },
        { id: 4, name: "hostel", label: "Fan Lodge", description: "Budget-friendly shared accommodations", icon: "users", isActive: 1, sortOrder: 4 },
        { id: 5, name: "hotel", label: "Hotel", description: "Full-service hotels and guesthouses", icon: "hotel", isActive: 1, sortOrder: 5 },
      ];
    }
  }),
});

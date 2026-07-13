import { authRouter } from "./auth-router";
import { propertyRouter } from "./property-router";
import { bookingRouter } from "./booking-router";
import { hostRouter } from "./host-router";
import { adminRouter } from "./admin-router";
import { uploadRouter } from "./upload-router";
import { groupBookingRouter } from "./group-booking-router";
import { countryRouter } from "./country-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  // Health check for Railway
  health: publicQuery.query(() => ({ 
    status: "ok", 
    service: "kitufu",
    version: "1.0.0",
    ts: Date.now() 
  })),

  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  auth: authRouter,
  property: propertyRouter,
  booking: bookingRouter,
  host: hostRouter,
  admin: adminRouter,
  upload: uploadRouter,
  groupBooking: groupBookingRouter,
  country: countryRouter,
});

export type AppRouter = typeof appRouter;

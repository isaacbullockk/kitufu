import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { COUNTRY_LIST, getCountry } from "../src/config/countries";

export const countryRouter = createRouter({
  list: publicQuery.query(() => {
    try {
      return COUNTRY_LIST.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        nameLocal: c.nameLocal,
        currency: c.currency,
        language: c.language,
        event: c.event,
        cities: c.cities.map((city) => ({ id: city.id, name: city.name })),
      }));
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load country list",
      });
    }
  }),

  getById: publicQuery
    .input(z.object({ id: z.string().min(1, "Country ID required") }))
    .query(({ input }) => {
      try {
        const country = getCountry(input.id);
        return {
          id: country.id,
          code: country.code,
          name: country.name,
          nameLocal: country.nameLocal,
          domain: country.domain,
          currency: country.currency,
          language: country.language,
          branding: country.branding,
          event: country.event,
          cities: country.cities,
          venues: country.venues,
          tourism: country.tourism,
          contact: country.contact,
          regulatory: country.regulatory,
          payment: country.payment,
        };
      } catch (err: any) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Country '" + input.id + "' not found",
        });
      }
    }),
});

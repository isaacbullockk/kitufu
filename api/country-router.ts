import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { COUNTRY_LIST, getCountry } from "../src/config/countries";

export const countryRouter = createRouter({
  list: publicQuery.query(() => {
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
  }),

  getById: publicQuery
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
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
    }),
});

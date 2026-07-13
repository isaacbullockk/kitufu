import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

export const uploadRouter = createRouter({
  upload: publicQuery
    .input(
      z.object({
        file: z.string(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return {
        url: input.file,
        publicId: `kitufu-${Date.now()}`,
      };
    }),
});

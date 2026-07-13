import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";

export const uploadRouter = createRouter({
  upload: publicQuery
    .input(
      z.object({
        file: z.string().min(1, "File data is required"),
        filename: z.string().min(1, "Filename is required"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Validate base64
        if (!input.file.startsWith("data:")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file format. Expected base64 data URL.",
          });
        }
        // Size check (max 5MB)
        const sizeInBytes = Buffer.from(input.file.split(",")[1] || "", "base64").length;
        if (sizeInBytes > 5 * 1024 * 1024) {
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: "File exceeds 5MB limit",
          });
        }
        return {
          url: input.file,
          publicId: `kitufu-${Date.now()}`,
        };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Upload failed",
        });
      }
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";

// Cloudinary config — user provides their own cloud_name and upload_preset via env vars
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || "";

async function uploadToCloudinary(fileBase64: string, filename: string, resourceType: "image" | "video" = "image"): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    // Fallback: return a data URL (works for demo, not for production)
    return fileBase64;
  }

  const formData = new FormData();
  // Convert base64 to blob
  const base64Data = fileBase64.split(",")[1] || fileBase64;
  const byteChars = atob(base64Data);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: resourceType === "video" ? "video/mp4" : "image/jpeg" });

  formData.append("file", blob, filename);
  formData.append("upload_preset", UPLOAD_PRESET);

  const resp = await fetch("https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/" + resourceType + "/upload", {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) {
    throw new Error("Cloudinary upload failed: " + resp.status);
  }

  const data = await resp.json();
  return data.secure_url;
}

export const uploadRouter = createRouter({
  image: publicQuery
    .input(z.object({
      file: z.string().min(1, "File data required"),
      filename: z.string().min(1, "Filename required"),
    }))
    .mutation(async ({ input }) => {
      try {
        // Check file size (max 5MB)
        const base64Data = input.file.split(",")[1] || input.file;
        const sizeInBytes = Buffer.from(base64Data, "base64").length;
        if (sizeInBytes > 5 * 1024 * 1024) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image exceeds 5MB limit" });
        }

        let url: string;
        if (CLOUD_NAME && UPLOAD_PRESET) {
          url = await uploadToCloudinary(input.file, input.filename, "image");
        } else {
          // Store as data URL for now (works for small images in demo)
          url = input.file.startsWith("data:") ? input.file : "data:image/jpeg;base64," + base64Data;
        }

        return { url, publicId: "kitufu-img-" + Date.now(), success: true };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Image upload failed: " + err.message });
      }
    }),

  video: publicQuery
    .input(z.object({
      file: z.string().min(1, "Video data required"),
      filename: z.string().min(1, "Filename required"),
    }))
    .mutation(async ({ input }) => {
      try {
        const base64Data = input.file.split(",")[1] || input.file;
        const sizeInBytes = Buffer.from(base64Data, "base64").length;
        if (sizeInBytes > 50 * 1024 * 1024) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Video exceeds 50MB limit" });
        }

        let url: string;
        if (CLOUD_NAME && UPLOAD_PRESET) {
          url = await uploadToCloudinary(input.file, input.filename, "video");
        } else {
          url = input.file.startsWith("data:") ? input.file : "data:video/mp4;base64," + base64Data;
        }

        return { url, publicId: "kitufu-vid-" + Date.now(), success: true };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Video upload failed: " + err.message });
      }
    }),
});

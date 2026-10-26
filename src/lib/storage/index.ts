import { createHash } from "crypto";
import { getEnv } from "@/lib/env";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadedImage = {
  url: string;
  publicId: string;
};

export type UploadFolder =
  | "products"
  | "homepage"
  | "categories"
  | "collections"
  | "branding"
  | "misc";

function assertImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }
  if (file.size === 0) {
    throw new Error("Image file is empty");
  }
}

function cloudinaryFolder(folder: UploadFolder): string {
  return `wunmzyco/${folder}`;
}

function requireCloudinaryConfig() {
  const env = getEnv();
  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not fully configured. Set STORAGE_PROVIDER=cloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  return { cloudName, apiKey, apiSecret };
}

/**
 * Every image uploaded anywhere on the site goes to Cloudinary.
 * There is intentionally no local-disk fallback: if Cloudinary is not
 * configured the upload fails loudly instead of silently writing to
 * `public/uploads/` (which is lost on redeploy and invisible to the CDN).
 */
async function uploadCloudinary(file: File, folder: UploadFolder): Promise<UploadedImage> {
  assertImage(file);
  const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const cFolder = cloudinaryFolder(folder);
  const toSign = `folder=${cFolder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", cFolder);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    let detail = "";
    try {
      const errJson = (await res.json()) as { error?: { message?: string } };
      detail = errJson.error?.message ?? "";
    } catch {
      detail = "";
    }
    throw new Error(
      detail ? `Cloudinary upload failed: ${detail}` : `Cloudinary upload failed (${res.status})`,
    );
  }

  const data = (await res.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url || !data.public_id) {
    throw new Error("Cloudinary upload failed: unexpected response");
  }
  return { url: data.secure_url, publicId: data.public_id };
}

export async function uploadImage(
  file: File,
  folder: UploadFolder = "products",
): Promise<UploadedImage> {
  return uploadCloudinary(file, folder);
}

/** @deprecated Prefer uploadImage(file, folder) */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  return uploadImage(file, "products");
}

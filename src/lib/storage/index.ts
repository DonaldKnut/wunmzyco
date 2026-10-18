import { createHash, randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getEnv } from "@/lib/env";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadedImage = {
  url: string;
  publicId: string;
};

export type UploadFolder = "products" | "homepage" | "misc";

function assertImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }
}

function cloudinaryFolder(folder: UploadFolder): string {
  return `wunmzyco/${folder}`;
}

async function uploadLocal(file: File, folder: UploadFolder): Promise<UploadedImage> {
  assertImage(file);
  const ext = file.type.split("/")[1] ?? "jpg";
  const id = `${Date.now()}_${randomBytes(6).toString("hex")}`;
  const filename = `${id}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${folder}/${filename}`,
    publicId: id,
  };
}

async function uploadCloudinary(file: File, folder: UploadFolder): Promise<UploadedImage> {
  assertImage(file);
  const env = getEnv();
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const cFolder = cloudinaryFolder(folder);
  const toSign = `folder=${cFolder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", env.CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", cFolder);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = (await res.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

export async function uploadImage(
  file: File,
  folder: UploadFolder = "products",
): Promise<UploadedImage> {
  const env = getEnv();
  if (env.STORAGE_PROVIDER === "cloudinary") {
    return uploadCloudinary(file, folder);
  }
  return uploadLocal(file, folder);
}

/** @deprecated Prefer uploadImage(file, folder) */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  return uploadImage(file, "products");
}

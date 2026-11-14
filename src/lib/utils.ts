import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BRAND } from "@/lib/brand";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Absolute URL for emails, WhatsApp, sitemaps, and payment callbacks.
 * Never returns localhost — falls back to the live site when env is missing or local.
 */
export function absoluteUrl(path = "/"): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  const base =
    fromEnv && !/localhost|127\.0\.0\.1/i.test(fromEnv) ? fromEnv : BRAND.siteUrl;
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

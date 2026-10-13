import { createHash, randomBytes } from "crypto";

export function generateOrderNumber(date = new Date()): string {
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `WZ${y}${m}${d}-${rand}`;
}

export function generateTrackingToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashTrackingToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePaymentReference(orderNumber: string): string {
  const suffix = randomBytes(4).toString("hex");
  return `pay_${orderNumber.replace(/[^A-Za-z0-9]/g, "").toLowerCase()}_${suffix}`;
}

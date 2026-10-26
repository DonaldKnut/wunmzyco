import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  ADMIN_SETUP_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  // Unset → mock in development, paystack in production (never silently mock in prod).
  PAYMENT_PROVIDER: z.enum(["paystack", "mock"]).optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
  PAYSTACK_MODE: z.enum(["test", "live"]).default("test"),
  EMAIL_PROVIDER: z.enum(["resend", "console"]).default("console"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Wunmzy Co <orders@wunmzyco.com>"),
  // All site image uploads go to Cloudinary — there is no local-disk storage.
  STORAGE_PROVIDER: z.literal("cloudinary").default("cloudinary"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ADMIN_SETUP_TOKEN: process.env.ADMIN_SETUP_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
    PAYSTACK_MODE: process.env.PAYSTACK_MODE,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  const data = parsed.data;
  const isProd = data.NODE_ENV === "production";

  // Production never uses mock — even if PAYMENT_PROVIDER=mock was left on the host.
  let paymentProvider: "paystack" | "mock" =
    data.PAYMENT_PROVIDER ?? (isProd ? "paystack" : "mock");
  if (isProd) {
    paymentProvider = "paystack";
  }

  if (paymentProvider === "paystack") {
    if (!data.PAYSTACK_SECRET_KEY?.trim()) {
      throw new Error(
        "Paystack is required in production. In Vercel → Settings → Environment Variables (Production) set PAYMENT_PROVIDER=paystack, PAYSTACK_SECRET_KEY (sk_…), NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY (pk_…), then Redeploy.",
      );
    }
    if (data.PAYSTACK_SECRET_KEY.startsWith("pk_")) {
      throw new Error("PAYSTACK_SECRET_KEY must be a secret key (sk_), never a public key");
    }
  }

  const resolved = { ...data, PAYMENT_PROVIDER: paymentProvider };

  if (
    !data.CLOUDINARY_CLOUD_NAME?.trim() ||
    !data.CLOUDINARY_API_KEY?.trim() ||
    !data.CLOUDINARY_API_SECRET?.trim()
  ) {
    throw new Error(
      "Cloudinary is not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (all image uploads go to Cloudinary).",
    );
  }

  cached = resolved;
  return resolved;
}

export function getPublicEnv() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    // Client never sees mock in production builds.
    paymentProvider: isProd
      ? "paystack"
      : (process.env.PAYMENT_PROVIDER ?? "mock"),
    paystackMode: process.env.PAYSTACK_MODE ?? "test",
  };
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

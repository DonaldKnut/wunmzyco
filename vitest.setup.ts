if (!process.env.NODE_ENV) {
  Object.defineProperty(process.env, "NODE_ENV", { value: "test", writable: true });
}
process.env.DATABASE_URL ??= "postgresql://localhost:5432/wunmzy_test";
process.env.AUTH_SECRET ??= "test-auth-secret-minimum-32-chars!!";
process.env.PAYMENT_PROVIDER ??= "mock";
process.env.PAYSTACK_WEBHOOK_SECRET ??= "whsec_test_secret";
process.env.STORAGE_PROVIDER ??= "cloudinary";
process.env.CLOUDINARY_CLOUD_NAME ??= "test-cloud";
process.env.CLOUDINARY_API_KEY ??= "test-api-key";
process.env.CLOUDINARY_API_SECRET ??= "test-api-secret";

import { z } from "zod";

export const checkoutAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z
    .string()
    .trim()
    .min(10)
    .max(20)
    .regex(/^[+0-9\s-]+$/, "Enter a valid phone number"),
  street: z.string().trim().min(5).max(200),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  deliveryZoneId: z.string().cuid(),
  deliveryNotes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional().nullable(),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  address: checkoutAddressSchema,
  couponCode: z.string().trim().max(40).optional().nullable(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(10).max(20).optional(),
  password: z.string().min(10).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const trackOrderSchema = z.object({
  token: z.string().min(20).max(200),
});

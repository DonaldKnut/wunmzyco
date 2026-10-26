import { z } from "zod";

export const checkoutAddressSchema = z.object({
  fullName: z
    .string({ error: "Please enter your full name." })
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "That name is too long."),
  email: z
    .string({ error: "Please enter your email." })
    .trim()
    .email("Please enter a valid email address (like name@example.com).")
    .max(200, "That email looks too long — please check it."),
  phone: z
    .string({ error: "Please enter your phone number." })
    .trim()
    .min(10, "Please enter a complete phone number.")
    .max(20, "That phone number is too long.")
    .regex(/^[+0-9\s-]+$/, "Please enter a valid phone number (digits only)."),
  street: z
    .string({ error: "Please enter your street address." })
    .trim()
    .min(5, "Please enter a fuller street address.")
    .max(200, "That address is too long."),
  landmark: z
    .string()
    .trim()
    .max(200, "That landmark note is too long.")
    .optional()
    .or(z.literal("")),
  city: z
    .string({ error: "Please enter your city." })
    .trim()
    .min(2, "Please enter your city.")
    .max(100, "That city name is too long."),
  state: z
    .string({ error: "Please enter your state." })
    .trim()
    .min(2, "Please enter your state.")
    .max(100, "That state name is too long."),
  deliveryZoneId: z
    .string({ error: "Please choose a delivery area." })
    .trim()
    .min(1, "Please choose a delivery area."),
  deliveryNotes: z
    .string()
    .trim()
    .max(500, "Those delivery notes are too long — please shorten them.")
    .optional()
    .or(z.literal("")),
});

export const cartItemSchema = z.object({
  productId: z
    .string({ error: "Please choose a product." })
    .min(1, "Please choose a product."),
  variantId: z.string().optional().nullable(),
  quantity: z
    .number({ error: "Please enter a valid quantity." })
    .int("Quantity must be a whole number.")
    .min(1, "Please add at least 1 item.")
    .max(20, "You can add up to 20 of this item at a time."),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Your bag is empty — add something before checking out."),
  address: checkoutAddressSchema,
  couponCode: z
    .string()
    .trim()
    .max(40, "That coupon code is too long.")
    .optional()
    .nullable(),
});

export { registerFormSchema as registerSchema, loginFormSchema as loginSchema } from "@/lib/schemas/auth";

export const trackOrderSchema = z.object({
  orderNumber: z
    .string({ error: "Please enter your order number." })
    .trim()
    .min(3, "Please enter your order number.")
    .max(40, "That order number looks too long — please check it."),
  token: z
    .string({ error: "Please enter your tracking code." })
    .trim()
    .min(20, "That tracking code looks incomplete — check your email for the full code.")
    .max(200, "That tracking code looks too long — please check it."),
});

export const checkoutFormSchema = checkoutAddressSchema.extend({
  couponCode: z
    .string()
    .trim()
    .max(40, "That coupon code is too long.")
    .optional()
    .or(z.literal("")),
  paymentMethod: z
    .enum(["paystack", "whatsapp"], {
      error: "Please choose how you’d like to pay.",
    })
    .default("paystack"),
});

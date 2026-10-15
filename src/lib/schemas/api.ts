import { z } from "zod";
import { cartItemSchema } from "@/lib/schemas/checkout";

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(200),
  source: z.string().trim().max(80).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});

export const cartAddSchema = cartItemSchema;
export const cartUpdateSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.number().int().min(0).max(20),
});

export const cartRemoveSchema = z.object({
  itemId: z.string().cuid(),
});

export {
  forgotPasswordFormSchema as forgotPasswordSchema,
  resetPasswordFormSchema as resetPasswordSchema,
} from "@/lib/schemas/auth";

export const deliveryQuoteQuerySchema = z.object({
  deliveryZoneId: z.string().cuid(),
  items: z.array(cartItemSchema).min(1),
  couponCode: z.string().trim().max(40).optional(),
});

export const paymentInitializeSchema = z.object({
  items: z.array(cartItemSchema).min(1).optional(),
  useCart: z.boolean().optional(),
  address: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: z
      .string()
      .trim()
      .min(10)
      .max(20)
      .regex(/^[+0-9\s-]+$/),
    street: z.string().trim().min(5).max(200),
    landmark: z.string().trim().max(200).optional().or(z.literal("")),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    deliveryZoneId: z.string().cuid(),
    deliveryNotes: z.string().trim().max(500).optional().or(z.literal("")),
  }),
  couponCode: z.string().trim().max(40).optional().nullable(),
});

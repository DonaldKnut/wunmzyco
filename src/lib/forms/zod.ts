import type { ZodType } from "zod";

type IssueLike = {
  code: string;
  path: PropertyKey[];
  message: string;
  expected?: unknown;
  received?: unknown;
  origin?: string;
  type?: string;
  minimum?: number | bigint;
  maximum?: number | bigint;
  format?: string;
  validation?: string;
};

/** Friendly names for form fields shown in error toasts / under inputs. */
const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm password",
  name: "Name",
  fullName: "Full name",
  phone: "Phone number",
  street: "Street address",
  landmark: "Landmark",
  city: "City",
  state: "State",
  deliveryZoneId: "Delivery area",
  deliveryNotes: "Delivery notes",
  couponCode: "Coupon code",
  paymentMethod: "Payment method",
  orderNumber: "Order number",
  token: "Tracking code",
  subject: "Subject",
  message: "Message",
  quantity: "Quantity",
  productId: "Product",
  variantId: "Option",
  itemId: "Cart item",
  title: "Title",
  subtitle: "Subtitle",
  eyebrow: "Eyebrow",
  ctaLabel: "Button label",
  ctaHref: "Button link",
  imageUrl: "Image",
  imageAlt: "Image description",
  sortOrder: "Sort order",
  source: "Source",
  next: "Redirect",
};

function fieldLabel(path: PropertyKey[]): string {
  const key = String(path[path.length - 1] ?? path[0] ?? "");
  if (!key || key === "undefined") return "this field";
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function looksTechnical(message: string): boolean {
  return /cuid|uuid|invalid_type|invalid_format|invalid_value|expected |required_|too small|too big|Invalid input|Invalid email|Invalid enum|Received |undefined|null|boolean|number\]|string\]|>=\d|<=\d/i.test(
    message,
  );
}

/**
 * Turn a Zod issue into plain language a shopper or staff member can act on.
 */
export function humanizeZodIssue(issue: IssueLike): string {
  const label = fieldLabel(issue.path);
  const raw = issue.message?.trim() || "";

  // Prefer custom schema messages when they already sound human
  if (raw && !looksTechnical(raw)) {
    return raw;
  }

  const origin = issue.origin ?? issue.type;
  const format = issue.format ?? issue.validation;

  switch (issue.code) {
    case "invalid_type": {
      const missing =
        issue.received === "undefined" ||
        issue.received === "null" ||
        issue.received === undefined ||
        /received undefined|received null/i.test(raw);
      if (missing) {
        return label === "this field"
          ? "Please fill in this field."
          : `Please fill in ${label.toLowerCase()}.`;
      }
      if (issue.expected === "int" || format === "safeint") {
        return "Please enter a whole number.";
      }
      return label === "this field"
        ? "Please check this field and try again."
        : `Please enter a valid ${label.toLowerCase()}.`;
    }
    case "too_small": {
      if (origin === "string") {
        if (issue.minimum === 1) return `Please fill in ${label.toLowerCase()}.`;
        return `${label} is too short — please enter a bit more.`;
      }
      if (origin === "number") {
        if (issue.minimum === 1) return "Please choose at least 1.";
        return `${label} is too small.`;
      }
      if (origin === "array") {
        return "Please add at least one item.";
      }
      return `${label} is incomplete.`;
    }
    case "too_big": {
      if (origin === "string") return `${label} is too long — please shorten it.`;
      if (origin === "number") return `${label} is too high.`;
      return `${label} is too large.`;
    }
    case "invalid_string":
    case "invalid_format": {
      if (format === "email") {
        return "Please enter a valid email address (like name@example.com).";
      }
      if (format === "url") return "Please enter a valid web link.";
      if (format === "uuid" || format === "cuid") {
        return `Something looks wrong with ${label.toLowerCase()}. Please try again.`;
      }
      return `Please check ${label.toLowerCase()} and try again.`;
    }
    case "invalid_enum_value":
    case "invalid_value":
    case "invalid_literal":
      return `Please choose a valid option for ${label.toLowerCase()}.`;
    case "custom":
      return raw || `Please check ${label.toLowerCase()}.`;
    default:
      break;
  }

  if (/invalid email/i.test(raw)) return "Please enter a valid email address.";
  if (/required/i.test(raw)) return `Please fill in ${label.toLowerCase()}.`;
  if (/cuid|uuid/i.test(raw)) {
    return `Something went wrong with ${label.toLowerCase()}. Please try again.`;
  }

  return raw || `Please check ${label.toLowerCase()}.`;
}

export function zodFieldErrors(error: {
  issues: IssueLike[];
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = humanizeZodIssue(issue);
  }
  return out;
}

export function firstZodMessage(
  error: { issues: IssueLike[] },
  fallback = "Please check the form and try again.",
) {
  const first = error.issues[0];
  if (!first) return fallback;
  return humanizeZodIssue(first) || fallback;
}

/** Payload for API 422 responses — always plain-language. */
export function zodErrorPayload(
  error: { issues: IssueLike[] },
  fallback = "Please check the form and try again.",
) {
  return {
    message: firstZodMessage(error, fallback),
    fieldErrors: zodFieldErrors(error),
    issues: error.issues.map((issue) => ({
      path: issue.path,
      message: humanizeZodIssue(issue),
    })),
  };
}

export function parseFormData<T>(
  schema: ZodType<T>,
  formData: FormData,
):
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors: Record<string, string> } {
  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") data[key] = value;
  });
  const parsed = schema.safeParse(data);
  if (parsed.success) return { ok: true, data: parsed.data };
  return {
    ok: false,
    message: firstZodMessage(parsed.error),
    fieldErrors: zodFieldErrors(parsed.error),
  };
}

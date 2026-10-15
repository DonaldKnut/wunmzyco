import type { ZodType } from "zod";
import { toast } from "sonner";

export function formDataToObject(formData: FormData): Record<string, string> {
  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") data[key] = value;
  });
  return data;
}

export function zodFieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export function firstZodMessage(error: { issues: { message: string }[] }, fallback = "Please check the form.") {
  return error.issues[0]?.message ?? fallback;
}

/** Client-side Zod gate before submitting FormData to a server action. */
export function validateFormData<T>(
  schema: ZodType<T>,
  formData: FormData,
  opts?: { toast?: boolean },
): { ok: true; data: T } | { ok: false; errors: Record<string, string>; message: string } {
  const parsed = schema.safeParse(formDataToObject(formData));
  if (parsed.success) return { ok: true, data: parsed.data };
  const message = firstZodMessage(parsed.error);
  if (opts?.toast !== false) toast.error(message);
  return { ok: false, errors: zodFieldErrors(parsed.error), message };
}

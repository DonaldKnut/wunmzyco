import type { ZodType } from "zod";

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

export function firstZodMessage(
  error: { issues: { message: string }[] },
  fallback = "Please check the form.",
) {
  return error.issues[0]?.message ?? fallback;
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

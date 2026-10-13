import { format } from "date-fns";

const TZ_HINT = "Africa/Lagos";

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${format(d, "d MMM yyyy, HH:mm")} WAT`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy");
}

export { TZ_HINT };

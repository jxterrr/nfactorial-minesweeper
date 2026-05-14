import { headers } from "next/headers";

const CITY_HEADER = "x-vercel-ip-city";

export function getCityFromHeaders(h: Headers): string {
  const raw = h.get(CITY_HEADER)?.trim();
  if (raw) return raw;
  return "Unknown";
}

/** Use inside Server Components / route handlers (Next 14). */
export function getRequestCity(): string {
  const h = headers();
  return getCityFromHeaders(h);
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names using clsx and resolves Tailwind CSS conflicts
 * using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a monetary number into standard localized currency string.
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(numericAmount || 0);
}

export const DEFAULT_VEHICLE_IMAGE =
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80";

/**
 * Validates and sanitizes image URLs for Next.js <Image /> components.
 * Prevents "Failed to construct 'URL': Invalid URL" runtime exceptions.
 */
export function getSafeImageUrl(
  url: unknown,
  fallback: string = DEFAULT_VEHICLE_IMAGE
): string {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // If path is a local backend media upload, resolve to the backend host
  if (trimmed.startsWith("/media/")) {
    const rawApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const baseHost = rawApi.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
    return `${baseHost}${trimmed}`;
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("data:")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    return fallback;
  }
  return fallback;
}


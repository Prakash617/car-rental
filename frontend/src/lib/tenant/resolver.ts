import { TenantBranding } from "@/types";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import { apiFetch } from "@/lib/api/client";

export interface TenantResolution {
  isPlatform: boolean;
  isAdmin: boolean;
  subdomain: string | null;
  branding: TenantBranding;
  isPreview: boolean;
  previewThemeId?: string;
  hostname: string;
}

const DEFAULT_BRANDING: TenantBranding = {
  name: "Apex Rentals",
  logo_url: "/brand/logo.svg",
  primary_color: "#e11d2e",
  accent_color: "#388ddd",
  font_heading: "sans",
  support_email: "concierge@apex-fleet.com",
  support_phone: "+1 (800) 555-APEX",
  currency: "Rs.",
  timezone: "Asia/Kathmandu",
  active_theme: "sajilo",
  hero_title: "Rent A Car With Driver",
  hero_subtitle: "Experience seamless mobility across 14+ cities with verified vehicles and professional chauffeurs.",
  seo_meta_title: "Apex Rentals | Luxury & Standard Car Rental",
  seo_meta_description: "Rent cars, SUVs, Hiace, Scorpio, and EV vehicles with professional drivers at the best rates with Apex Rentals.",
};

/**
 * Checks if a hostname belongs to the Super-Admin Platform Portal (admin.localhost)
 */
export function isSuperAdminHost(hostname: string): boolean {
  const clean = hostname.split(":")[0].toLowerCase();
  return clean === "admin.localhost";
}

/**
 * Checks if a hostname belongs to the root customer portal (localhost:3000)
 */
export function isPlatformRoot(hostname: string): boolean {
  const clean = hostname.split(":")[0].toLowerCase();
  return clean === "localhost" || clean === "127.0.0.1";
}

/**
 * Extracts tenant subdomain from request host
 * (e.g. "apex.localhost:3000" -> "apex")
 */
export function extractTenantSubdomain(hostname: string): string | null {
  const clean = hostname.split(":")[0].toLowerCase();
  if (clean.endsWith(".localhost")) {
    const sub = clean.slice(0, -".localhost".length);
    if (sub !== "admin" && sub !== "www") {
      return sub;
    }
  }
  return null;
}

/**
 * Resolves the tenant host that server-side API calls should target.
 *
 * - Tenant subdomain / custom domain requests already identify the tenant.
 * - Platform root (localhost:3000) relies on the `?tenant=` param written by the
 *   dashboard middleware / auth session, falling back to the default tenant.
 * Mirrors the client-side resolution in `apiFetch`.
 */
export function resolveTenantHost(
  hostnameHeader?: string | null,
  tenantParam?: string | null
): string {
  const hostname = hostnameHeader || "localhost:3000";

  if (extractTenantSubdomain(hostname)) return hostname;

  if (isPlatformRoot(hostname) || isSuperAdminHost(hostname)) {
    if (tenantParam) {
      const base = tenantParam.replace(/:\d+$/, "");
      return `${base}:3000`;
    }
    return "apex.localhost:3000";
  }

  return hostname;
}

/**
 * Resolves the tenant context based on hostname and optional ephemeral live theme preview.
 */
export async function resolveTenant(
  hostnameHeader?: string | null,
  previewParam?: string | null
): Promise<TenantResolution> {
  const hostname = hostnameHeader || "localhost:3000";
  const isAdmin = isSuperAdminHost(hostname);
  const isPlatform = isPlatformRoot(hostname) || isAdmin;
  const subdomain = extractTenantSubdomain(hostname);

  // Check if live preview mode is triggered via ephemeral query param
  const validPreviewTheme =
    previewParam && previewParam in THEME_REGISTRY
      ? (previewParam as TenantBranding["active_theme"])
      : undefined;

  const isPreview = Boolean(validPreviewTheme);

  // Default baseline branding
  let branding: TenantBranding = { ...DEFAULT_BRANDING };

  // If resolving a tenant (subdomain or custom domain), attempt to fetch live website config
  if (!isPlatform) {
    try {
      const liveConfig = await apiFetch<TenantBranding>("/api/v1/website/config/", {
        tenantHost: hostname,
        cache: "no-store",
      });
      if (liveConfig && liveConfig.name) {
        branding = {
          ...branding,
          ...liveConfig,
        };
      }
    } catch {
      // Fallback: customize display name if non-default subdomain
      if (subdomain && subdomain !== "apex") {
        const formatted = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
        branding.name = `${formatted} Luxury Mobility`;
      }
    }
  }

  // Ephemeral theme preview overrides active theme
  if (isPreview && validPreviewTheme) {
    branding.active_theme = validPreviewTheme;
    if (THEME_REGISTRY[validPreviewTheme]) {
      branding.primary_color = THEME_REGISTRY[validPreviewTheme].accentColor;
    }
  }

  return {
    isPlatform,
    isAdmin,
    subdomain,
    branding,
    isPreview,
    previewThemeId: validPreviewTheme,
    hostname,
  };
}

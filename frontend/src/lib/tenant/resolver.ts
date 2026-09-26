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
  name: "Apex Luxury Concierge",
  logo_url: "/brand/logo.svg",
  primary_color: "#D4AF37",
  accent_color: "#B38F26",
  font_heading: "serif",
  support_email: "concierge@apex-fleet.com",
  support_phone: "+1 (800) 555-APEX",
  currency: "USD",
  timezone: "UTC",
  active_theme: "luxury",
  hero_title: "The Pinnacle of Automotive Luxury",
  hero_subtitle: "Experience peerless performance and white-glove concierge mobility.",
  seo_meta_title: "Apex Luxury Concierge | Exotic & Luxury Automobile Hire",
  seo_meta_description: "Curated exotic fleet, private tarmac delivery, and 24/7 dedicated concierge service.",
};

/**
 * Checks if a hostname belongs to the Super-Admin Platform Portal (admin.localhost)
 */
export function isSuperAdminHost(hostname: string): boolean {
  const clean = hostname.split(":")[0].toLowerCase();
  return (
    clean === "admin.localhost" ||
    clean === "admin.platform.localhost" ||
    clean === "admin.platform.local"
  );
}

/**
 * Checks if a hostname belongs to the root customer portal (localhost:3000, platform.localhost)
 */
export function isPlatformRoot(hostname: string): boolean {
  const clean = hostname.split(":")[0].toLowerCase();
  return (
    clean === "localhost" ||
    clean === "127.0.0.1" ||
    clean === "platform.localhost" ||
    clean === "platform.local"
  );
}

/**
 * Extracts tenant subdomain from request host
 * (e.g. "apex.localhost:3000" -> "apex")
 */
export function extractTenantSubdomain(hostname: string): string | null {
  const clean = hostname.split(":")[0].toLowerCase();
  if (clean.endsWith(".localhost")) {
    const sub = clean.slice(0, -".localhost".length);
    if (sub !== "platform" && sub !== "admin" && sub !== "www") {
      return sub;
    }
  }
  return null;
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

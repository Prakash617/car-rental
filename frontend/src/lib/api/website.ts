import { apiFetch } from "./client";
import { TenantBranding } from "@/types";

export interface TenantWebsiteConfig extends TenantBranding {
  id?: string;
  hero_title?: string;
  hero_subtitle?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  seo_keywords?: string;
  updated_at?: string;
}

export async function fetchWebsiteConfig(tenantHost?: string): Promise<TenantWebsiteConfig> {
  return apiFetch<TenantWebsiteConfig>("/api/v1/website/config/", {
    method: "GET",
    tenantHost,
    next: { revalidate: 3600 }, // Cached on server with 1h revalidation
  });
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TenantBranding } from "@/types";
import { THEME_REGISTRY } from "@/lib/themes/registry";

const BrandingContext = createContext<TenantBranding | null>(null);

export function BrandingProvider({
  branding,
  children,
}: {
  branding: TenantBranding;
  children: React.ReactNode;
}) {
  const [effectiveBranding, setEffectiveBranding] = useState<TenantBranding>(branding);

  useEffect(() => {
    let current = { ...branding };
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlPreview = params.get("theme_preview") || params.get("preview_theme");
      if (urlPreview && urlPreview in THEME_REGISTRY) {
        current = {
          ...current,
          active_theme: urlPreview as TenantBranding["active_theme"],
          primary_color: THEME_REGISTRY[urlPreview].accentColor,
        };
      } else {
        // Also check preview cookie
        const match = document.cookie.match(/(?:^|; )tenant_theme_preview=([^;]*)/);
        if (match && match[1] && match[1] in THEME_REGISTRY) {
          const cookieTheme = match[1];
          current = {
            ...current,
            active_theme: cookieTheme as TenantBranding["active_theme"],
            primary_color: THEME_REGISTRY[cookieTheme].accentColor,
          };
        }
      }
    }
    setEffectiveBranding(current);
  }, [branding]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Apply website title to browser tab if not customized by subpage
    const title =
      effectiveBranding.website_title ||
      effectiveBranding.seo_meta_title ||
      (effectiveBranding.name ? `${effectiveBranding.name} | Luxury & Standard Car Rental` : "");
    if (title) {
      const cur = document.title;
      if (
        !cur ||
        cur.includes("Apex Luxury Concierge | Multi-Tenant Car Rental SaaS") ||
        cur === "Apex Rentals"
      ) {
        document.title = title;
      }
    }

    // Apply or update favicon icon link
    if (effectiveBranding.favicon_url) {
      let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "shortcut icon";
        document.head.appendChild(iconLink);
      }
      iconLink.href = effectiveBranding.favicon_url;
    }
  }, [effectiveBranding]);

  return (
    <BrandingContext.Provider value={effectiveBranding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): TenantBranding {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return ctx;
}

/**
 * Hook to set a subpage tab title while preserving tenant branding and favicon
 */
export function useStorefrontTitle(pageTitle?: string) {
  const branding = useBranding();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle =
      branding.website_title ||
      branding.seo_meta_title ||
      (branding.name ? `${branding.name} | Luxury & Standard Car Rental` : "Car Rental");

    if (pageTitle) {
      document.title = `${pageTitle} | ${branding.name || baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    if (branding.favicon_url) {
      let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "shortcut icon";
        document.head.appendChild(iconLink);
      }
      iconLink.href = branding.favicon_url;
    }
  }, [pageTitle, branding]);
}

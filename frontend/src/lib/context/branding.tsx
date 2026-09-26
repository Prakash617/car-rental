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

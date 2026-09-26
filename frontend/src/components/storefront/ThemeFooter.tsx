import React from "react";
import { TenantBranding } from "@/types";
import { getThemeDefinition } from "@/lib/themes/registry";

export function ThemeFooter({ branding }: { branding: TenantBranding }) {
  const theme = getThemeDefinition(branding.active_theme);
  const Footer = theme.components.Footer;
  return <Footer branding={branding} />;
}

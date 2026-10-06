import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { resolveTenant } from "@/lib/tenant/resolver";
import { getRequestTenantHost } from "@/lib/tenant/request";
import { getThemeDefinition, getThemeHeadingFont } from "@/lib/themes/registry";
import { Navbar } from "@/components/navigation/Navbar";
import { BrandingProvider } from "@/lib/context/branding";
import { ThemePreviewBanner } from "@/components/themes/ThemePreviewBanner";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const previewCookie = cookieStore.get("tenant_theme_preview")?.value || null;

  // Tenant subdomain/custom domain, `?tenant=` param, or `tenant_ctx` cookie
  const tenantHost = await getRequestTenantHost();

  const { branding, isPreview } = await resolveTenant(tenantHost, previewCookie);

  const theme = getThemeDefinition(branding.active_theme);
  const Footer = theme.components.Footer;
  const headingFontClass = getThemeHeadingFont(branding.active_theme);

  // Sajilo, Modern, Minimal, and Classic default to light mode unless an explicitly dark theme (like Luxury) is selected
  const isLightMode =
    branding.active_theme === "sajilo" ||
    branding.active_theme === "modern" ||
    branding.active_theme === "minimal" ||
    branding.active_theme === "classic";

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isLightMode ? "bg-[#f8fafc] text-slate-900 light" : "bg-black text-slate-100 dark"
      } ${headingFontClass}`}
      style={
        {
          "--brand-primary": branding.primary_color,
          "--brand-accent": branding.accent_color,
          ...(isLightMode
            ? {
                "--background": "#f8fafc",
                "--foreground": "#0f172a",
                "--card": "#ffffff",
                "--card-foreground": "#0f172a",
                "--border": "#e2e8f0",
                "--input": "#cbd5e1",
              }
            : {}),
        } as React.CSSProperties
      }
    >
      <BrandingProvider branding={branding}>
        <Navbar branding={branding} />
        <main className="flex-1">{children}</main>
        <Footer branding={branding} />

        {/* Live Theme Preview Sandbox Banner */}
        {isPreview && (
          <Suspense fallback={null}>
            <ThemePreviewBanner
              currentThemeId={branding.active_theme}
              isPreview={isPreview}
            />
          </Suspense>
        )}
      </BrandingProvider>
    </div>
  );
}

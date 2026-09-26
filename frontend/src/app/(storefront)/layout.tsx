import React, { Suspense } from "react";
import { headers, cookies } from "next/headers";
import { resolveTenant } from "@/lib/tenant/resolver";
import { getThemeDefinition, getThemeHeadingFont } from "@/lib/themes/registry";
import { Navbar } from "@/components/navigation/Navbar";
import { BrandingProvider } from "@/lib/context/branding";
import { ThemePreviewBanner } from "@/components/themes/ThemePreviewBanner";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";

  const cookieStore = await cookies();
  const previewCookie = cookieStore.get("tenant_theme_preview")?.value || null;

  const { branding, isPreview } = await resolveTenant(host, previewCookie);

  const theme = getThemeDefinition(branding.active_theme);
  const Footer = theme.components.Footer;
  const headingFontClass = getThemeHeadingFont(branding.active_theme);

  return (
    <div
      className={`min-h-screen flex flex-col bg-black text-slate-100 ${headingFontClass}`}
      style={
        {
          "--brand-primary": branding.primary_color,
          "--brand-accent": branding.accent_color,
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

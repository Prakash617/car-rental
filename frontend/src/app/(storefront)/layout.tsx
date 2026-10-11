import React, { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { resolveTenant } from "@/lib/tenant/resolver";
import { getRequestTenantHost } from "@/lib/tenant/request";
import { getThemeDefinition, getThemeHeadingFont } from "@/lib/themes/registry";
import { Navbar } from "@/components/navigation/Navbar";
import { BrandingProvider } from "@/lib/context/branding";
import { ThemePreviewBanner } from "@/components/themes/ThemePreviewBanner";

export async function generateMetadata(): Promise<Metadata> {
  const tenantHost = await getRequestTenantHost();
  const { branding } = await resolveTenant(tenantHost);

  const title =
    branding.website_title ||
    branding.seo_meta_title ||
    (branding.name ? `${branding.name} | Luxury & Standard Car Rental` : "Apex Rentals");
  const description =
    branding.seo_meta_description ||
    branding.hero_subtitle ||
    "Enterprise multi-tenant automotive hire platform with dynamic theme engine and real-time fleet availability.";

  const icons: Metadata["icons"] = [];
  if (branding.favicon_url) {
    icons.push({ rel: "icon", url: branding.favicon_url });
    icons.push({ rel: "shortcut icon", url: branding.favicon_url });
    icons.push({ rel: "apple-touch-icon", url: branding.favicon_url });
  }

  return {
    title: {
      default: title,
      template: `%s | ${branding.name || title}`,
    },
    description,
    keywords: branding.seo_keywords
      ? branding.seo_keywords.split(",").map((k) => k.trim())
      : undefined,
    ...(icons.length > 0 ? { icons } : {}),
    openGraph: {
      title,
      description,
      images: branding.og_image_url ? [{ url: branding.og_image_url }] : undefined,
    },
  };
}

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

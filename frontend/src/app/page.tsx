import React, { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Car, Sparkles, ArrowRight, ShieldCheck, DollarSign } from "lucide-react";
import { resolveTenant } from "@/lib/tenant/resolver";
import { getThemeDefinition } from "@/lib/themes/registry";
import { fetchVehicles } from "@/lib/api/vehicles";
import { Vehicle } from "@/types";
import { Navbar } from "@/components/navigation/Navbar";
import { SessionRedirect } from "@/components/auth/SessionRedirect";
import { ThemePreviewBanner } from "@/components/themes/ThemePreviewBanner";
import { FAQSection } from "@/components/storefront/FAQSection";
import { PlatformLanding } from "@/components/platform/PlatformLanding";
import PlatformSuperAdminPage from "@/app/(platform)/platform/page";
import { getPublicFAQs } from "@/lib/api/dashboard";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";

  const rawPreview =
    resolvedSearchParams.theme_preview || resolvedSearchParams.preview_theme;
  const previewThemeId = typeof rawPreview === "string" ? rawPreview : null;

  // Resolve tenant configuration vs Platform Root vs Super-Admin Host
  const resolution = await resolveTenant(host, previewThemeId);

  // 1. If accessing Superuser Host (admin.localhost), render Super-Admin Portal directly
  if (resolution.isAdmin) {
    return <PlatformSuperAdminPage />;
  }

  // 2. If explicitly requesting Platform management launchpad
  if (resolvedSearchParams.view === "platform") {
    return (
      <>
        <SessionRedirect />
        <PlatformLanding />
      </>
    );
  }

  // 2. If accessing a Tenant Subdomain (e.g. apex.localhost:3000) or Custom Domain
  // render that specific tenant's branded customer storefront
  const { branding, isPreview } = resolution;

  // Dynamically resolve the theme definition (sajilo, luxury, modern, adventure, urban, classic, minimal)
  const theme = getThemeDefinition(branding.active_theme);
  const { HeroSection, FleetGrid, FeaturesSection, Footer } = theme.components;

  const isLightMode =
    branding.active_theme === "sajilo" ||
    branding.active_theme === "modern" ||
    branding.active_theme === "minimal" ||
    branding.active_theme === "classic";

  // Fetch live FAQ items for this tenant
  let faqs: import("@/lib/api/dashboard").FAQItem[] = [];
  try {
    faqs = await getPublicFAQs(host);
  } catch {
    // FAQs are optional
  }

  // Fetch live vehicles for this tenant schema
  let vehicles: Vehicle[] = [];
  try {
    vehicles = await fetchVehicles(undefined, host);
  } catch {
    vehicles = [];
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isLightMode ? "bg-[#f8fafc] text-slate-900 light" : "bg-black text-slate-100 dark"
      }`}
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
      {/* Logged-in staff → skip the marketing homepage, land on the dashboard */}
      <SessionRedirect />

      {/* Universal Navigation */}
      <Navbar branding={branding} />

      {/* Dynamic Theme Hero Section */}
      <HeroSection branding={branding} />

      {/* Dynamic Theme Features / Service Standards */}
      <div id="features">
        <FeaturesSection branding={branding} />
      </div>

      {/* Two-Sided Platform Gateway: Renter & Host Callouts */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pathway 1: Renters */}
          <div
            className={`relative rounded-2xl p-8 space-y-4 overflow-hidden flex flex-col justify-between transition-all ${
              isLightMode
                ? "bg-white border border-slate-200/90 shadow-sm hover:border-[#e11d2e] hover:shadow-md"
                : "bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] hover:border-[#D4AF37]/50 shadow-xl"
            }`}
          >
            <div className="space-y-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isLightMode
                    ? "bg-red-50 text-[#e11d2e]"
                    : "bg-white/[0.05] border border-white/[0.1] text-[#D4AF37]"
                }`}
              >
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-xs uppercase tracking-wider block ${
                    isLightMode ? "text-[#e11d2e] font-bold" : "text-[#D4AF37] font-mono"
                  }`}
                >
                  For Travelers &amp; Renters
                </span>
                <h3
                  className={`text-2xl font-bold mt-1 ${
                    isLightMode ? "text-slate-900" : "text-white font-serif"
                  }`}
                >
                  Verified Fleet with Professional Chauffeur
                </h3>
                <p
                  className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                    isLightMode ? "text-slate-600" : "text-zinc-400 font-light"
                  }`}
                >
                  Book sedans, 4WD Scorpios, luxury marriage cars, or electric Hiace vans across Kathmandu, Pokhara, Chitwan, and 14+ Nepal cities. Fixed transparent NPR rates with zero hidden charges.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/search"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm ${
                  isLightMode
                    ? "bg-[#e11d2e] hover:bg-[#b01524] text-white"
                    : "bg-[#D4AF37] hover:bg-[#e2bd46] text-black"
                }`}
              >
                <span>Search Available Vehicles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pathway 2: Car Owners (Hosts) */}
          <div
            className={`relative rounded-2xl p-8 space-y-4 overflow-hidden flex flex-col justify-between transition-all ${
              isLightMode
                ? "bg-white border border-slate-200/90 shadow-sm hover:border-[#388ddd] hover:shadow-md"
                : "bg-gradient-to-br from-amber-500/[0.08] via-zinc-900 to-black border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xl"
            }`}
          >
            <div className="space-y-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isLightMode
                    ? "bg-blue-50 text-[#388ddd]"
                    : "bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]"
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    isLightMode ? "text-[#388ddd]" : "text-emerald-400 font-mono"
                  }`}
                >
                  For Vehicle Owners &amp; Hosts
                </span>
                <h3
                  className={`text-2xl font-bold mt-1 ${
                    isLightMode ? "text-slate-900" : "text-white font-serif"
                  }`}
                >
                  List Your Vehicle &amp; Earn in Nepal
                </h3>
                <p
                  className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                    isLightMode ? "text-slate-600" : "text-zinc-400 font-light"
                  }`}
                >
                  Reach thousands of verified travelers across Nepal, set your own availability, and earn steady monthly revenue with zero self-drive liability and guaranteed 10% advance deposits.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/list-your-car"
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm ${
                  isLightMode
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-white/[0.08] hover:bg-[#D4AF37] hover:text-black text-white border border-white/[0.15]"
                }`}
              >
                <span>Host Your Vehicle Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Theme Fleet Catalog */}
      <div id="fleet">
        <FleetGrid vehicles={vehicles} branding={branding} />
      </div>

      {/* FAQ Section — live from CMS */}
      {faqs.length > 0 && (
        <div id="faq">
          <FAQSection
            faqs={faqs}
            primaryColor={branding.primary_color}
            isLightMode={isLightMode}
            supportPhone={branding.support_phone}
          />
        </div>
      )}

      {/* Dynamic Theme Footer */}
      <Footer branding={branding} />

      {/* Floating Theme Live Preview & Switcher Dock (only rendered during admin preview) */}
      {isPreview && (
        <Suspense fallback={null}>
          <ThemePreviewBanner
            currentThemeId={branding.active_theme}
            isPreview={isPreview}
          />
        </Suspense>
      )}
    </div>
  );
}

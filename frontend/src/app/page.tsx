import React, { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Car, Sparkles, ArrowRight, ShieldCheck, DollarSign } from "lucide-react";
import { resolveTenant } from "@/lib/tenant/resolver";
import { getThemeDefinition } from "@/lib/themes/registry";
import { SAMPLE_FLEET } from "@/lib/mock-data";
import { Navbar } from "@/components/navigation/Navbar";
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

  // 2. If accessing Root SaaS Platform Domain (localhost:3000 / platform.localhost),
  // render the Customer Portal Launchpad & Platform Website
  if (resolution.isPlatform) {
    return <PlatformLanding />;
  }

  // 2. If accessing a Tenant Subdomain (e.g. apex.localhost:3000) or Custom Domain
  // render that specific tenant's branded customer storefront
  const { branding, isPreview } = resolution;

  // Dynamically resolve the theme definition (luxury, modern, adventure, urban, classic, minimal)
  const theme = getThemeDefinition(branding.active_theme);
  const { HeroSection, FleetGrid, FeaturesSection, Footer } = theme.components;

  // Fetch live FAQ items for this tenant
  let faqs: import("@/lib/api/dashboard").FAQItem[] = [];
  try {
    faqs = await getPublicFAQs(host);
  } catch {
    // FAQs are optional
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-black text-slate-100"
      style={
        {
          "--brand-primary": branding.primary_color,
          "--brand-accent": branding.accent_color,
        } as React.CSSProperties
      }
    >
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
          <div className="relative rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] p-8 space-y-4 overflow-hidden group hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white">
                <Car className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] block">
                  For Discerning Renters
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">
                  Charter an Exotic or Luxury Flagship
                </h3>
                <p className="text-xs text-zinc-400 mt-2 font-light leading-relaxed">
                  Explore our private fleet of Ferraris, Porsches, Range Rovers, and chauffeured executive sedans with plane-side FBO delivery.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black bg-[#D4AF37] hover:bg-[#e2bd46] px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10"
              >
                <span>Browse Fleet Showroom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pathway 2: Car Owners (Hosts) */}
          <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-zinc-900 to-black border border-[#D4AF37]/30 p-8 space-y-4 overflow-hidden group hover:border-[#D4AF37] transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                  For Luxury Vehicle Owners
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">
                  Consign Your Automobile & Earn 70%
                </h3>
                <p className="text-xs text-zinc-400 mt-2 font-light leading-relaxed">
                  Monetize your idle supercar or luxury SUV with $2,000,000 comprehensive commercial insurance, biometric storage, and direct monthly ACH payouts.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/list-your-car"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white bg-white/[0.08] hover:bg-[#D4AF37] hover:text-black border border-white/[0.15] px-5 py-2.5 rounded-xl transition-all"
              >
                <span>Calculate Host Earnings & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Theme Fleet Catalog */}
      <div id="fleet">
        <FleetGrid vehicles={SAMPLE_FLEET} branding={branding} />
      </div>

      {/* FAQ Section — live from CMS */}
      {faqs.length > 0 && (
        <div id="faq">
          <FAQSection faqs={faqs} primaryColor={branding.primary_color} />
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

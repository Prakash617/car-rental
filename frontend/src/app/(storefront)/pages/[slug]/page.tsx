import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolver";
import { getRequestTenantHost } from "@/lib/tenant/request";
import { getCustomPageBySlug } from "@/lib/api/dashboard";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tenant?: string | string[] | undefined }>;
}

const DEFAULT_CMS_PAGES: Record<string, { title: string; content: string; seo_title?: string; seo_description?: string }> = {
  "privacy-policy": {
    title: "Privacy Charter & Client Confidentiality",
    seo_title: "Privacy Charter | Apex Luxury Concierge",
    seo_description: "Our commitment to executive privacy, cryptographic data protection, and discreet VIP service.",
    content: `# Privacy Charter & Client Confidentiality

At Apex Luxury Concierge, discretion and confidentiality are foundational to our enterprise automotive service. This Privacy Charter delineates how we safeguard personal identification, telematics, and payment transactions.

## 1. Information We Collect
We collect identity credentials strictly necessary to fulfill luxury charter agreements and verify eligibility:
- Legal full name, residential address, telephone, and email
- Verified driver license credentials and Motor Vehicle Record (MVR) screening reports
- Encrypted payment tokenization data
- Real-time GPS telemetry and vehicle diagnostics strictly for safety, collision response, and speed boundary adherence

## 2. Telemetry and Geo-Fencing Data
All vehicles in the Apex fleet are equipped with discreet satellite telematics to monitor vehicle operational health and safety. Telematics data is encrypted and retained strictly for the duration of the active charter plus 30 days for billing dispute resolution.

## 3. Zero Third-Party Monetization
We do not sell, rent, or monetize client personal data to third parties. Information is only disclosed to insurance underwriters in the event of an authorized claim or as compelled by lawful court order.

## 4. Host Consignor Confidentiality
Vehicle hosts and consignors are protected by mutual non-disclosure covenants. Guest identity is kept confidential from vehicle owners, and vehicle owner personal identity is never disclosed to renters.

---
For inquiries regarding our privacy standards, contact the Data Protection Officer at privacy@apex-fleet.com.`,
  },
  "terms-of-service": {
    title: "Master Rental & Consignment Agreement Terms",
    seo_title: "Rental & Consignment Terms | Apex Luxury Concierge",
    seo_description: "Terms and conditions governing vehicle charter reservations and partner vehicle consignment.",
    content: `# Master Rental & Consignment Terms of Service

## 1. Charter Eligibility & Vetting
All operators of Apex vehicles must be at least 28 years of age with a valid government-issued driver license and a minimum of three consecutive years of driving experience. Operators must submit to automated MVR background checks and identity verification.

## 2. Security Deposit & Authorization Hold
A pre-authorization hold between $2,000 and $5,000 is placed on the guest payment card prior to key handover. The hold is fully released upon return of the vehicle following our post-rental 120-point digital inspection.

## 3. Vehicle Operation Standards
- Prohibited Activities: Track racing, commercial rideshare, drifting, towing, and smoking are strictly prohibited.
- Geographic Boundaries: Vehicles must remain within designated operational territories unless written cross-border authorization is granted.
- Speed Limits: Excessive speed exceeding 100 mph triggers automated telemetry warnings and may terminate the charter with forfeiture of security deposit.

## 4. Vehicle Consignment & Host Terms
- Revenue Share: Qualified vehicle hosts receive 70% of gross charter revenue disbursed via direct deposit on the 1st of every calendar month.
- Primary Insurance: Consigned assets are covered under Apex's $2,000,000 commercial policy during active charter periods.
- Personal Host Driving: Hosts retain unlimited personal driving privileges with 48 hours advance notice via the Host Portal.

---
For assistance with terms and agreements, contact concierge@apex-fleet.com.`,
  },
  "rental-requirements": {
    title: "VIP Charter & Driver Requirements",
    seo_title: "Driver Requirements | Apex Luxury Concierge",
    seo_description: "Required documentation, age limits, and insurance standards for renting exotic and luxury vehicles.",
    content: `# VIP Charter Requirements & Driver Standards

To maintain our fleet's impeccable standard of safety and performance, all guests must satisfy the following criteria prior to vehicle departure:

## 1. Age and Licensing
- Minimum Age: 28 years old for exotic supercars (Ferrari, Lamborghini, McLaren, Porsche GT models) and 25 years old for executive sedans and SUVs.
- Driver License: Valid US driver license or International Driving Permit (IDP) with passport.
- Experience: Minimum 3 years clean driving history without major moving violations or suspensions within 36 months.

## 2. Insurance Verification
- Transferable Full Coverage: Renters must demonstrate active personal collision and comprehensive insurance with property damage limits of at least $100,000 (or purchase the Apex Loss Damage Waiver).
- Credit Card Coverage: Secondary credit card car rental protection does not substitute for primary liability requirements on exotic assets.

## 3. Security Deposit
- Exotic Supercars: $3,500 – $5,000 authorization hold
- Track Sports & SUVs: $2,000 – $2,500 authorization hold
- Executive Sedans & EVs: $1,500 – $2,000 authorization hold

---
Questions? Contact our 24/7 concierge desk at concierge@apex-fleet.com.`,
  },
};

async function fetchPage(
  slug: string,
  tenantHost?: string
): Promise<import("@/lib/api/dashboard").CustomPage | null> {
  try {
    const fromApi = await getCustomPageBySlug(slug, tenantHost);
    if (fromApi) return fromApi;
  } catch {
    // fallback below
  }

  if (DEFAULT_CMS_PAGES[slug]) {
    const def = DEFAULT_CMS_PAGES[slug];
    return {
      id: `default-${slug}`,
      slug,
      title: def.title,
      content: def.content,
      is_published: true,
      show_in_navbar: false,
      show_in_footer: false,
      seo_title: def.seo_title || def.title,
      seo_description: def.seo_description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return null;
}

/** Render Markdown-like content as HTML */
function renderMarkdown(content: string): string {
  if (!content) return "";
  return content
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline">$1</a>')
    // Unordered list items
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr />")
    // Paragraphs (double newlines)
    .replace(/\n\n/g, "</p><p>")
    // Single newlines within paragraphs
    .replace(/\n/g, "<br />");
}

export default async function CustomPageRoute({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const tenantHost = await getRequestTenantHost(
    typeof sp.tenant === "string" ? sp.tenant : null
  );

  const [page, { branding }] = await Promise.all([
    fetchPage(slug, tenantHost),
    resolveTenant(tenantHost, null),
  ]);

  if (!page) {
    notFound();
  }

  const seoTitle = page.seo_title || page.title;
  const seoDesc = page.seo_description;

  const renderedHtml = renderMarkdown(page.content);

  const isLightMode =
    branding.active_theme === "sajilo" ||
    branding.active_theme === "modern" ||
    branding.active_theme === "minimal" ||
    branding.active_theme === "classic";

  return (
    <div className={`py-12 pb-20 px-4 ${isLightMode ? "bg-[#f8fafc] text-slate-900" : ""}`}>
      <div className="max-w-3xl mx-auto">
        {/* Page breadcrumb */}
        <nav className={`mb-8 text-xs ${isLightMode ? "text-slate-500" : "text-zinc-500 font-mono"}`}>
          <Link href="/" className={`transition-colors ${isLightMode ? "hover:text-slate-900" : "hover:text-zinc-300"}`}>
            Home
          </Link>
          <span className={`mx-2 ${isLightMode ? "text-slate-400" : "text-zinc-700"}`}>/</span>
          <span className={isLightMode ? "text-slate-800 font-medium" : "text-zinc-400"}>{page.title}</span>
        </nav>

        {/* Page content */}
        <article
          className={`max-w-none ${
            isLightMode ? "prose prose-slate prose-sm sm:prose-base" : "prose prose-invert prose-sm sm:prose-base"
          }`}
          style={
            {
              "--tw-prose-headings": isLightMode ? "#0f172a" : "#ffffff",
              "--tw-prose-body": isLightMode ? "#334155" : "#a1a1aa",
              "--tw-prose-bold": isLightMode ? "#0f172a" : "#ffffff",
              "--tw-prose-links": branding.primary_color || (isLightMode ? "#e11d2e" : "#D4AF37"),
              "--tw-prose-hr": isLightMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
              "--tw-prose-bullets": branding.primary_color || (isLightMode ? "#e11d2e" : "#D4AF37"),
            } as React.CSSProperties
          }
        >
          <h1 className={`text-3xl font-bold tracking-tight mb-8 ${isLightMode ? "text-slate-900" : "text-white"}`}>
            {seoTitle}
          </h1>
          <div
            className={`leading-relaxed space-y-4 ${
              isLightMode
                ? "text-slate-700 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-4 [&_strong]:text-slate-900 [&_li]:ml-4 [&_li]:list-disc [&_a]:text-[#e11d2e] [&_a]:no-underline [&_a:hover]:underline [&_hr]:border-slate-200 [&_hr]:my-8"
                : "text-zinc-400 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mt-4 [&_strong]:text-white [&_li]:ml-4 [&_li]:list-disc [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_hr]:border-white/[0.08] [&_hr]:my-8"
            }`}
            dangerouslySetInnerHTML={{ __html: `<p>${renderedHtml}</p>` }}
          />
        </article>

        {/* Metadata footer */}
        <div className={`mt-16 pt-8 border-t text-xs ${isLightMode ? "border-slate-200 text-slate-500" : "border-white/[0.06] text-zinc-600"}`}>
          <p>
            {seoDesc && <span className={`block mb-2 italic ${isLightMode ? "text-slate-500" : "text-zinc-500"}`}>{seoDesc}</span>}
            <span className={isLightMode ? "font-sans" : "font-mono"}>
              {branding.name || "Apex Rentals"} &bull; {new Date().getFullYear()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const tenantHost = await getRequestTenantHost(
    typeof sp.tenant === "string" ? sp.tenant : null
  );
  const page = await fetchPage(slug, tenantHost);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.seo_title || page.title,
    description: page.seo_description || "",
  };
}

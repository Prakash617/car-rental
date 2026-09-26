import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolver";
import { getCustomPageBySlug } from "@/lib/api/dashboard";
import { TenantBranding } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
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

async function fetchPage(slug: string): Promise<import("@/lib/api/dashboard").CustomPage | null> {
  try {
    const fromApi = await getCustomPageBySlug(slug);
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
      seo_title: def.seo_title || def.title,
      seo_description: def.seo_description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return null;
}

/** Render simple Markdown-like content as HTML */
function renderMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
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

export default async function CustomPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";

  const [page, { branding }] = await Promise.all([
    fetchPage(slug),
    resolveTenant(host, null),
  ]);

  if (!page) {
    notFound();
  }

  const seoTitle = page.seo_title || page.title;
  const seoDesc = page.seo_description;

  const renderedHtml = renderMarkdown(page.content);

  return (
    <div className="py-12 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Page breadcrumb */}
        <nav className="mb-8 text-xs text-zinc-500 font-mono">
          <Link href="/" className="hover:text-zinc-300 transition-colors">
            Home
          </Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{page.title}</span>
        </nav>

        {/* Page content */}
        <article
          className="prose prose-invert prose-sm sm:prose-base max-w-none"
          style={
            {
              "--tw-prose-headings": "#ffffff",
              "--tw-prose-body": "#a1a1aa",
              "--tw-prose-bold": "#ffffff",
              "--tw-prose-links": branding.primary_color || "#D4AF37",
              "--tw-prose-hr": "rgba(255,255,255,0.06)",
              "--tw-prose-bullets": branding.primary_color || "#D4AF37",
            } as React.CSSProperties
          }
        >
          <h1 className="text-3xl font-bold tracking-tight text-white mb-8">{seoTitle}</h1>
          <div
            className="text-zinc-400 leading-relaxed space-y-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mt-4 [&_strong]:text-white [&_li]:ml-4 [&_li]:list-disc [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_hr]:border-white/[0.08] [&_hr]:my-8"
            dangerouslySetInnerHTML={{ __html: `<p>${renderedHtml}</p>` }}
          />
        </article>

        {/* Metadata footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-xs text-zinc-600">
          <p>
            {seoDesc && <span className="block mb-2 text-zinc-500 italic">{seoDesc}</span>}
            <span className="font-mono">
              {branding.name || "Apex Luxury Concierge"} · {new Date().getFullYear()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.seo_title || page.title,
    description: page.seo_description || "",
  };
}

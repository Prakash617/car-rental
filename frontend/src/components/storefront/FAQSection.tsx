import React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { FAQItem } from "@/lib/api/dashboard";

interface FAQSectionProps {
  faqs: FAQItem[];
  primaryColor?: string;
}

export function FAQSection({ faqs, primaryColor = "#D4AF37" }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-zinc-950 border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest mb-4 px-3 py-1 rounded-full border"
            style={{
              color: primaryColor,
              borderColor: `${primaryColor}30`,
              backgroundColor: `${primaryColor}10`,
            }}
          >
            <HelpCircle className="h-3 w-3" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
            Our concierge team is also available around the clock to assist with any enquiry.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={faq.id}
              className="group rounded-xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-sm overflow-hidden"
              open={idx === 0}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 hover:bg-white/[0.02] transition-colors">
                <span className="text-sm font-semibold text-white leading-snug pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  style={{ color: primaryColor }}
                />
              </summary>
              <div className="px-6 pb-5">
                <div className="pt-1 border-t border-white/[0.06]" />
                <p className="text-sm text-zinc-400 leading-relaxed mt-4">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-500">
            Still have questions?{" "}
            <a
              href="mailto:concierge@apex-fleet.com"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: primaryColor }}
            >
              Contact our concierge team →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

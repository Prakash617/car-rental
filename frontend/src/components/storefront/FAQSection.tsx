import React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { FAQItem } from "@/lib/api/dashboard";

interface FAQSectionProps {
  faqs: FAQItem[];
  primaryColor?: string;
  isLightMode?: boolean;
  supportPhone?: string;
}

export function FAQSection({
  faqs,
  primaryColor = "#e11d2e",
  isLightMode = true,
  supportPhone = "+1 (800) 555-APEX",
}: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      className={`py-16 px-4 border-t transition-colors ${
        isLightMode
          ? "bg-slate-50 border-slate-200/80 text-slate-900"
          : "bg-zinc-950 border-white/[0.06] text-white"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 space-y-2">
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
              isLightMode
                ? "bg-red-50 border-red-200 text-[#e11d2e]"
                : "border-white/10 text-white"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#e11d2e]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLightMode ? "text-slate-900" : "text-white"
            }`}
          >
            Everything You Need to Know
          </h2>
          <p
            className={`text-xs sm:text-sm max-w-xl mx-auto ${
              isLightMode ? "text-slate-600" : "text-zinc-400"
            }`}
          >
            Got questions about chauffeur bookings, trip rates, or wedding cars? We&apos;ve got answers.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={faq.id}
              className={`group rounded-2xl border overflow-hidden transition-all ${
                isLightMode
                  ? "border-slate-200 bg-white shadow-2xs hover:border-slate-300"
                  : "border-white/[0.08] bg-zinc-900/40 backdrop-blur-sm"
              }`}
              open={idx === 0}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-4.5 hover:bg-slate-50/50 transition-colors">
                <span
                  className={`text-sm font-bold leading-snug pr-4 ${
                    isLightMode ? "text-slate-900" : "text-white"
                  }`}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-180 ${
                    isLightMode ? "text-slate-500" : "text-zinc-400"
                  }`}
                />
              </summary>
              <div className="px-6 pb-5 pt-1">
                <div
                  className={`border-t mb-3 ${
                    isLightMode ? "border-slate-100" : "border-white/[0.06]"
                  }`}
                />
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isLightMode ? "text-slate-600 font-normal" : "text-zinc-400"
                  }`}
                >
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p
            className={`text-xs ${
              isLightMode ? "text-slate-500" : "text-zinc-500"
            }`}
          >
            Still have questions?{" "}
            <a
              href={`tel:${supportPhone}`}
              className="font-bold text-[#e11d2e] hover:underline"
            >
              Call our concierge ({supportPhone}) &rarr;
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

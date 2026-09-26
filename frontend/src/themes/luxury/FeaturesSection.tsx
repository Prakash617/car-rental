"use client";

import React from "react";
import { FeaturesProps } from "@/lib/themes/types";
import { Crown, KeyRound, ShieldCheck, Clock } from "lucide-react";

export function LuxuryFeaturesSection({ branding }: FeaturesProps) {
  const features = [
    {
      icon: Crown,
      title: "White-Glove VIP Handover",
      description: "Direct tarmac, hotel, or estate delivery by a private concierge specialist with full vehicle orientation.",
    },
    {
      icon: ShieldCheck,
      title: "Comprehensive Protection",
      description: "Uncompromised peace of mind with tailored CDW coverage, zero excess options, and 24/7 dedicated roadside response.",
    },
    {
      icon: KeyRound,
      title: "Guaranteed Exact Models",
      description: "Drive the precise make, specification, and interior package reserved—never an ambiguous 'or similar' substitute.",
    },
    {
      icon: Clock,
      title: "24/7 Bespoke Logistics",
      description: "Round-the-clock availability for flight delays, itinerary extensions, and last-minute chauffeured transfers.",
    },
  ];

  return (
    <section className="bg-[#0B0D14] py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">The Standard of Distinction</div>
          <h2 className="text-3xl sm:text-5xl font-serif text-slate-100 font-normal tracking-wide">
            Designed for the Exceptional
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light">
            Every journey with {branding.name} is curated to eliminate friction and exceed expectation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#12141F] border border-white/[0.05] hover:border-[#D4AF37]/30 transition-all duration-300 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 stroke-1.5" />
                </div>
                <h3 className="text-lg font-serif text-slate-100 font-normal">{item.title}</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

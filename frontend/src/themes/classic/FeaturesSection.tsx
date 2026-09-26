"use client";

import React from "react";
import { FeaturesProps } from "@/lib/themes/types";
import { Award, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";

export function ClassicFeaturesSection({ branding }: FeaturesProps) {
  const values = [
    {
      icon: Award,
      title: "Authenticated Pedigree",
      description: "Every motorcar features full matching chassis documentation, preservation history, and concourse preparation.",
    },
    {
      icon: ShieldCheck,
      title: "Agreed-Value Cover",
      description: "Comprehensive classic vehicle insurance tailored for rare collector cars with nationwide specialist transport.",
    },
    {
      icon: HeartHandshake,
      title: "Personal Chauffeur or Self-Drive",
      description: "Option for tailored chauffeur service in period uniform, or comprehensive self-drive orientation for purists.",
    },
    {
      icon: Sparkles,
      title: "Estate & Wedding Concierge",
      description: "Direct coordination with wedding planners, film production teams, and country estate itineraries.",
    },
  ];

  return (
    <section className="bg-[#1c1813] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#2e261e]">
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs uppercase tracking-widest text-[#c9955e] font-serif">The Heritage Tradition</div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#f5f1eb] tracking-wide">
            Automotive Artistry Preserved
          </h2>
          <p className="text-[#a89f91] text-sm font-light">
            At {branding.name}, we preserve the golden age of touring with dedicated mechanical stewardship and discreet service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#13110e]/90 border border-[#2e261e] hover:border-[#8B5A2B]/40 transition-all duration-300 space-y-3 group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#8B5A2B]/10 border border-[#8B5A2B]/30 flex items-center justify-center text-[#c9955e] group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif text-[#f5f1eb]">{v.title}</h3>
                <p className="text-xs text-[#a89f91] leading-relaxed font-light">{v.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

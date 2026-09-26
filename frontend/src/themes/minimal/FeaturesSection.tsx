"use client";

import React from "react";
import { FeaturesProps } from "@/lib/themes/types";

export function MinimalFeaturesSection({ branding }: FeaturesProps) {
  const points = [
    {
      index: "01",
      title: "Direct Digital Booking",
      description: "Immediate confirmation without intermediary fees or delayed approval loops.",
    },
    {
      index: "02",
      title: "Fixed All-In Pricing",
      description: "Zero hidden surcharges, exact insurance breakdown, and clear deposits.",
    },
    {
      index: "03",
      title: "Maintained by Technicians",
      description: "Rigorous factory telemetry and mechanical checklists before every departure.",
    },
    {
      index: "04",
      title: "Self-Service Handover",
      description: "Mobile key access or automated private lockbox collection at all depots.",
    },
  ];

  return (
    <section className="bg-black py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="border-b border-zinc-900 pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Principles</span>
          <h2 className="text-2xl font-light text-white tracking-tight mt-1">{branding.name} Operating Parameters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((p, idx) => (
            <div key={idx} className="space-y-3 border-t border-zinc-900 pt-4">
              <span className="font-mono text-xs text-zinc-600 block">{p.index}</span>
              <h3 className="text-sm font-medium text-white">{p.title}</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

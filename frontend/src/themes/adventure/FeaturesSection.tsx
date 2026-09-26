"use client";

import React from "react";
import { FeaturesProps } from "@/lib/themes/types";
import { Compass, ShieldCheck, Wrench, Radio } from "lucide-react";

export function AdventureFeaturesSection({ branding }: FeaturesProps) {
  const highlights = [
    {
      icon: Radio,
      title: "Garmin InReach Satellite SOS",
      description: "Dual-mode two-way satellite communicator and emergency dispatch equipped in every backcountry vehicle.",
    },
    {
      icon: ShieldCheck,
      title: "Full Trail Damage Shield",
      description: "Zero deductible rock-chip, underbody skid plate, and off-road brush pinstripe coverage included as standard.",
    },
    {
      icon: Wrench,
      title: "Self-Recovery Kit Included",
      description: "Heavy-duty electric winch, Maxtrax traction boards, ARB tire deflator, and high-output compressor on board.",
    },
    {
      icon: Compass,
      title: "Custom Topo Nav Preloaded",
      description: "Offline USGS topographic maps, BLM public land boundaries, and dispersed campsite guides ready on dashboard.",
    },
  ];

  return (
    <section className="bg-stone-900 py-20 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Uncompromising Overlanding</div>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-stone-100 tracking-tight">
            Built For The Remote Wild
          </h2>
          <p className="text-stone-400 text-sm font-normal">
            At {branding.name}, every vehicle is vetted for extreme elevation and technical trails with zero compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-emerald-500/40 transition-all duration-300 space-y-3 group"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-sans font-bold text-stone-100">{item.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed font-normal">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { FeaturesProps } from "@/lib/themes/types";
import { Smartphone, Zap, MapPin, CreditCard } from "lucide-react";

export function UrbanFeaturesSection({ branding }: FeaturesProps) {
  const points = [
    {
      icon: Smartphone,
      title: "Tap-to-Unlock Mobile Key",
      description: "No physical key exchange or counter check-in. Bluetooth NFC entry directly via your web browser or wallet pass.",
    },
    {
      icon: Zap,
      title: "100% Zero Emission City Fleet",
      description: "Drive ultra-efficient electric and hybrid vehicles that bypass congestion tolls and clean air emissions zones.",
    },
    {
      icon: MapPin,
      title: "Reserved City Hub Parking",
      description: "Never circle for parking. Leave and pick up vehicles in dedicated high-priority parking spaces across the downtown core.",
    },
    {
      icon: CreditCard,
      title: "All-Inclusive Hourly Rates",
      description: "Charging, liability insurance, municipal parking, and municipal city access fees rolled into one clear rate.",
    },
  ];

  return (
    <section className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Urban Micro-Mobility</div>
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-white tracking-tight">
            City Transit, Upgraded
          </h2>
          <p className="text-slate-400 text-sm font-normal">
            Powered by {branding.name}, designed specifically for quick daily errands, airport connections, and agile urban navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 space-y-3 group"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-sans font-bold text-white">{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

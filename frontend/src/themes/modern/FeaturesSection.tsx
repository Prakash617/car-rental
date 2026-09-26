"use client";

import React from "react";
import { FeaturesProps } from "@/lib/themes/types";
import { Smartphone, Zap, Activity, Clock } from "lucide-react";

export function ModernFeaturesSection({ branding }: FeaturesProps) {
  const pillars = [
    {
      icon: Smartphone,
      title: "Keyless App Access",
      description: "Walk up, authenticate with your smartphone, and drive off in under 60 seconds with zero paperwork queues.",
    },
    {
      icon: Zap,
      title: "Unlimited Supercharging",
      description: "Complimentary access to rapid DC supercharger networks across the country included with every EV rental.",
    },
    {
      icon: Activity,
      title: "Live Fleet Telemetry",
      description: "Real-time state of charge, tire pressure, and predictive range analytics synced directly with your itinerary.",
    },
    {
      icon: Clock,
      title: "Flexible Hours & Extensions",
      description: "Extend your trip, switch drop-off hubs, or add secondary drivers with one tap from the mobile portal.",
    },
  ];

  return (
    <section className="bg-zinc-900/60 py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Engineered For Agility</div>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight">
            Next-Generation Rental Standards
          </h2>
          <p className="text-zinc-400 text-sm font-normal">
            At {branding.name}, we eliminate dealership counter friction with direct digital access and telemetry-backed fleet confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 transition-all duration-300 space-y-3 group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-sans font-bold text-white">{pillar.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

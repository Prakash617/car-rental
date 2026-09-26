"use client";

import React, { useState } from "react";
import { FleetGridProps } from "@/lib/themes/types";
import { LuxuryVehicleCard } from "./VehicleCard";
import { Sparkles, SlidersHorizontal } from "lucide-react";

const CATEGORIES = ["all", "luxury", "sports", "suv", "sedan", "electric"];

export function LuxuryFleetGrid({
  vehicles,
  branding,
  isLoading,
  selectedCategory,
  onCategoryChange,
  onSelectVehicle,
}: FleetGridProps) {
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "all");

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    onCategoryChange?.(cat);
  };

  const filteredVehicles =
    activeCategory === "all"
      ? vehicles
      : vehicles.filter((v) => v.category.toLowerCase() === activeCategory);

  return (
    <section id="fleet" className="bg-[#090A0F] py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available Fleet</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 font-normal tracking-wide">
              The Prestige Collection
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 ${
                    isActive
                      ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                      : "bg-[#161822] text-slate-400 hover:text-slate-200 border border-white/[0.05]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-[#12141F] border border-white/[0.06] p-6 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-white/[0.03] rounded-xl" />
                <div className="h-4 bg-white/[0.05] rounded w-1/3" />
                <div className="h-6 bg-white/[0.05] rounded w-2/3" />
                <div className="h-10 bg-white/[0.03] rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredVehicles.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl bg-[#12141F]/40 border border-white/[0.04] space-y-4">
            <SlidersHorizontal className="w-10 h-10 text-[#D4AF37] mx-auto stroke-1" />
            <h3 className="text-xl font-serif text-slate-200">No Vehicles Match Your Selection</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Our bespoke concierge team can source custom luxury models upon private request.
            </p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="mt-2 px-6 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider hover:bg-[#D4AF37]/10 transition-colors"
            >
              Reset Category Filter
            </button>
          </div>
        )}

        {/* Content State: Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <LuxuryVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                branding={branding}
                onSelect={onSelectVehicle}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

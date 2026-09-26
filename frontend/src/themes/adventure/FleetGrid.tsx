"use client";

import React, { useState } from "react";
import { FleetGridProps } from "@/lib/themes/types";
import { AdventureVehicleCard } from "./VehicleCard";
import { Mountain, Compass, RotateCcw } from "lucide-react";

const ADVENTURE_CATEGORIES = ["all", "suv", "sports", "luxury", "compact"];

export function AdventureFleetGrid({
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
    <section id="fleet" className="bg-[#0c120d] py-20 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Mountain className="w-3.5 h-3.5" />
              <span>Trail-Rated Rigs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-stone-100 tracking-tight">
              Expedition Rigs & 4x4 Fleet
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-900 border border-stone-800">
            {ADVENTURE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-stone-950 shadow-sm"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {cat === "all" ? "All Rigs" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading state skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-stone-900 border border-stone-800 p-6 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-stone-800 rounded-xl" />
                <div className="h-4 bg-stone-800 rounded w-1/4" />
                <div className="h-6 bg-stone-800 rounded w-1/2" />
                <div className="h-10 bg-stone-800 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredVehicles.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <Compass className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-sans font-bold text-stone-100">No Rigs Currently Stationed Here</h3>
            <p className="text-sm text-stone-400 max-w-sm mx-auto">
              All rigs in this category are deployed on active backcountry expeditions.
            </p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-stone-950 text-xs font-bold uppercase hover:bg-emerald-500 transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Rig Filters</span>
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <AdventureVehicleCard
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

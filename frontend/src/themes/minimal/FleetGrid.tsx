"use client";

import React, { useState } from "react";
import { FleetGridProps } from "@/lib/themes/types";
import { MinimalVehicleCard } from "./VehicleCard";

const MINIMAL_CATEGORIES = ["all", "electric", "sedan", "suv", "sports"];

export function MinimalFleetGrid({
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
    <section id="fleet" className="bg-black py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-zinc-900 pb-4">
          <h2 className="text-xl font-light text-white tracking-tight">Fleet Index</h2>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-widest">
            {MINIMAL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`pb-1 transition-colors ${
                    isActive ? "text-white border-b border-white" : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-zinc-900 p-6 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-zinc-900" />
                <div className="h-4 bg-zinc-900 w-1/4" />
                <div className="h-6 bg-zinc-900 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredVehicles.length === 0 && (
          <div className="py-20 text-center space-y-2 border border-zinc-900">
            <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">No units found</p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="text-xs font-mono text-white underline underline-offset-4"
            >
              Reset filter
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <MinimalVehicleCard
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

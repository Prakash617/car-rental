"use client";

import React, { useState } from "react";
import { FleetGridProps } from "@/lib/themes/types";
import { ClassicVehicleCard } from "./VehicleCard";
import { Award, Compass, RotateCcw } from "lucide-react";

const CLASSIC_CATEGORIES = ["all", "luxury", "sports", "sedan", "suv"];

export function ClassicFleetGrid({
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
    <section id="fleet" className="bg-[#13110e] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#2e261e]">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2e261e]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-serif uppercase tracking-widest text-[#c9955e] mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Distinguished Lineage</span>
            </div>
            <h2 className="text-3xl font-serif text-[#f5f1eb] tracking-wide">
              The Heritage Registry
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#1c1813] border border-[#2e261e]">
            {CLASSIC_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "bg-[#8B5A2B] text-stone-100 shadow-sm"
                      : "text-[#8f8475] hover:text-[#f5f1eb]"
                  }`}
                >
                  {cat === "all" ? "Full Stable" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skeleton loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-[#1c1813] border border-[#2e261e] p-6 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-[#2e261e] rounded-xl" />
                <div className="h-4 bg-[#2e261e] rounded w-1/4" />
                <div className="h-6 bg-[#2e261e] rounded w-1/2" />
                <div className="h-10 bg-[#2e261e] rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredVehicles.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl bg-[#1c1813]/60 border border-[#2e261e] space-y-4">
            <Compass className="w-10 h-10 text-[#c9955e] mx-auto" />
            <h3 className="text-xl font-serif text-[#f5f1eb]">
              {vehicles.length === 0 ? "No Vehicles in Stable" : "No Vehicles in this Category Currently"}
            </h3>
            <p className="text-sm text-[#8f8475] max-w-sm mx-auto font-light">
              {vehicles.length === 0
                ? "This stable currently has no vehicles listed. Check back soon for newly acquired classic automobiles."
                : "Our curators frequently acquire and rotate iconic classic automobiles."}
            </p>
            {vehicles.length > 0 && (
              <button
                onClick={() => handleCategoryClick("all")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#8B5A2B] text-stone-100 text-xs font-serif uppercase tracking-wider hover:bg-[#a06933] transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show Full Stable</span>
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <ClassicVehicleCard
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

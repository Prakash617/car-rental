"use client";

import React, { useState } from "react";
import { FleetGridProps } from "@/lib/themes/types";
import { UrbanVehicleCard } from "./VehicleCard";
import { Navigation, Zap, RotateCcw } from "lucide-react";

const URBAN_CATEGORIES = ["all", "electric", "compact", "sedan", "suv"];

export function UrbanFleetGrid({
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
    <section id="fleet" className="bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Available Near You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-black text-white tracking-tight">
              Metropolitan Fleet
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {URBAN_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-800 rounded w-1/4" />
                <div className="h-6 bg-slate-800 rounded w-1/2" />
                <div className="h-10 bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredVehicles.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <Navigation className="w-10 h-10 text-cyan-400 mx-auto" />
            <h3 className="text-xl font-sans font-bold text-white">No cars currently parked in this category</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              New shared vehicles are released into the city fleet around the clock.
            </p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase hover:bg-cyan-400 transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All City Cars</span>
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <UrbanVehicleCard
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

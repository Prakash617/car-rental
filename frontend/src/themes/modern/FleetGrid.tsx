"use client";

import React, { useState } from "react";
import { FleetGridProps } from "@/lib/themes/types";
import { ModernVehicleCard } from "./VehicleCard";
import { Filter, Layers, RefreshCw } from "lucide-react";

const MODERN_CATEGORIES = ["all", "electric", "sports", "suv", "sedan", "compact"];

export function ModernFleetGrid({
  vehicles,
  branding,
  isLoading,
  selectedCategory,
  onCategoryChange,
  onSelectVehicle,
}: FleetGridProps) {
  const [activeCategory, setActiveCategory] = useState(selectedCategory || "all");
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc">("recommended");

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    onCategoryChange?.(cat);
  };

  const filteredVehicles =
    activeCategory === "all"
      ? [...vehicles]
      : vehicles.filter((v) => v.category.toLowerCase() === activeCategory);

  if (sortBy === "price_asc") {
    filteredVehicles.sort((a, b) => parseFloat(a.daily_rate) - parseFloat(b.daily_rate));
  } else if (sortBy === "price_desc") {
    filteredVehicles.sort((a, b) => parseFloat(b.daily_rate) - parseFloat(a.daily_rate));
  }

  return (
    <section id="fleet" className="bg-zinc-950 py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Smart Fleet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight">
              Select Your Machine
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              {MODERN_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide capitalize transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                aria-label="Sort vehicles"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recommended" | "price_asc" | "price_desc")}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="recommended" className="bg-zinc-900 text-white">Recommended</option>
                <option value="price_asc" className="bg-zinc-900 text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-zinc-900 text-white">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-zinc-800 rounded-xl" />
                <div className="h-4 bg-zinc-800 rounded w-1/4" />
                <div className="h-6 bg-zinc-800 rounded w-1/2" />
                <div className="h-10 bg-zinc-800 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredVehicles.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <RefreshCw className="w-10 h-10 text-blue-400 mx-auto" />
            <h3 className="text-xl font-sans font-bold text-white">No models available in this category</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Try switching filters to view other available high-performance or electric vehicles.
            </p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="mt-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Grid of Vehicles */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <ModernVehicleCard
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

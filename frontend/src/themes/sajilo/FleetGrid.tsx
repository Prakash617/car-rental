"use client";

import React, { useState, useMemo } from "react";
import { FleetGridProps } from "@/lib/themes/types";
import { SajiloVehicleCard } from "./VehicleCard";
import { Search, Car, SlidersHorizontal, Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Vehicles" },
  { id: "sedan", label: "Sedan Car" },
  { id: "suv", label: "SUV & Scorpio" },
  { id: "van", label: "Toyota & EV Hiace" },
  { id: "compact", label: "Hatchback" },
  { id: "luxury", label: "Wedding & VIP" },
];

export function SajiloFleetGrid({
  vehicles,
  branding,
  isLoading,
  selectedCategory: controlledCategory,
  onCategoryChange,
  onSelectVehicle,
}: FleetGridProps) {
  const [internalCategory, setInternalCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCategory = controlledCategory ?? internalCategory;

  const handleCategorySelect = (catId: string) => {
    if (onCategoryChange) {
      onCategoryChange(catId);
    } else {
      setInternalCategory(catId);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesCategory =
        activeCategory === "all" ||
        v.category.toLowerCase() === activeCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [vehicles, activeCategory, searchQuery]);

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e11d2e] mb-1">
            <Sparkles className="w-3.5 h-3.5" /> {branding?.name || "Apex Rentals"} Fleet Showcase
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Verified Vehicles &amp; Chauffeurs
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Browse well-maintained cars, jeeps, and vans with experienced drivers ready for your journey.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search model, brand..."
            className="w-full h-11 pl-9 pr-4 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] focus:border-[#388ddd] outline-none text-slate-900 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {CATEGORIES.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCategorySelect(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#e11d2e] text-white shadow-md shadow-red-500/20"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <SajiloVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              branding={branding}
              onSelect={onSelectVehicle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No vehicles found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn&apos;t find any vehicles matching your filter criteria. Try selecting another category or clearing your search query.
          </p>
          <button
            onClick={() => {
              setInternalCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}

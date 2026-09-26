"use client";

import React, { useState } from "react";
import { HeroProps } from "@/lib/themes/types";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

export function MinimalHeroSection({ branding, onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [branch, setBranch] = useState("Central Depot");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ pickupDate, branchId: branch });
  };

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center bg-black text-white px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-4xl mx-auto text-left w-full space-y-8">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
            {branding.name} — Fleet Direct
          </div>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-white leading-tight">
            Selected automobiles. <br />
            <span className="font-normal text-zinc-400">Direct booking.</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg font-light leading-relaxed">
            No friction, no superfluous tiers. Select a vehicle, choose your dates, and drive.
          </p>
        </div>

        {/* Minimal Search Line */}
        <form
          onSubmit={handleSubmit}
          className="pt-4 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Location
            </label>
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <select
                aria-label="Location"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="Central Depot" className="bg-black text-white">Central Depot</option>
                <option value="Airport Station" className="bg-black text-white">Airport Station</option>
                <option value="North Station" className="bg-black text-white">North Station</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Pickup Date
            </label>
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="date"
                aria-label="Pickup Date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-3 px-5 rounded-none border border-white text-white hover:bg-white hover:text-black font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-between"
            >
              <span>View Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { HeroProps } from "@/lib/themes/types";
import { Compass, Mountain, MapPin, Calendar, ArrowRight, Shield } from "lucide-react";

export function AdventureHeroSection({ branding, onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [terrain, setTerrain] = useState("Highland Trail Basecamp");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ pickupDate, branchId: terrain });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-[#0d140e] text-stone-100 overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
      {/* Topographic and forest atmospheric gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,197,94,0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,#0d140e_100%)]" />

      {/* Subtle topographic contour effect */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>{branding.name} Expedition Fleet</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-100 max-w-4xl mx-auto leading-tight">
          Explore Beyond <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-lime-400">
            The Paved Horizon
          </span>
        </h1>

        <p className="text-base sm:text-lg text-stone-400 max-w-2xl mx-auto font-normal">
          Fully outfitted 4x4 expedition rigs, rooftop campers, and heavy-duty overlanders equipped for backcountry freedom.
        </p>

        {/* Trail Search Console */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 p-3 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-2xl backdrop-blur-md max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="text-left px-4 py-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center gap-2.5">
            <Mountain className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="w-full">
              <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Outpost / Basecamp</span>
              <select
                aria-label="Outpost / Basecamp"
                value={terrain}
                onChange={(e) => setTerrain(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-stone-100 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="Highland Trail Basecamp" className="bg-stone-900 text-stone-100">Highland Trail Basecamp</option>
                <option value="Alpine Pass Outpost" className="bg-stone-900 text-stone-100">Alpine Pass Outpost</option>
                <option value="Canyon Ridge Station" className="bg-stone-900 text-stone-100">Canyon Ridge Station</option>
              </select>
            </div>
          </div>

          <div className="text-left px-4 py-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="w-full">
              <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Expedition Dates</span>
              <input
                type="date"
                aria-label="Expedition Dates"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs text-stone-100 focus:outline-none [color-scheme:dark] mt-0.5"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Find Expedition Rigs</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" /> All-Terrain Recovery & Winch Certified
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" /> National Park Trailhead Drop-off Available
          </span>
        </div>
      </div>
    </section>
  );
}

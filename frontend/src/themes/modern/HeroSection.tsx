"use client";

import React, { useState } from "react";
import { HeroProps } from "@/lib/themes/types";
import { Zap, Calendar, Search, ArrowRight, ShieldCheck } from "lucide-react";

export function ModernHeroSection({ branding, onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [branch, setBranch] = useState("Airport Express Depot");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ pickupDate, branchId: branch });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-zinc-950 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-16">
      {/* High-tech ambient blue radial grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-6">
        {/* EV / Modern Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wide">
          <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>{branding.name} Mobility & Fleet Tech</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-sans font-extrabold tracking-tight text-white max-w-3xl mx-auto">
          Rent on Demand. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
            Drive the Future.
          </span>
        </h1>

        <p className="text-base text-zinc-400 max-w-xl mx-auto font-normal">
          Instant digital verification, keyless smartphone unlock, and the latest electric and hybrid performance models.
        </p>

        {/* Unified Search Deck */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="text-left px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Pickup Branch</span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer mt-1"
            >
              <option value="Airport Express Depot" className="bg-zinc-900 text-white">Airport Express Depot</option>
              <option value="Central Metro Hub" className="bg-zinc-900 text-white">Central Metro Hub</option>
              <option value="Tech District Hub" className="bg-zinc-900 text-white">Tech District Hub</option>
            </select>
          </div>

          <div className="text-left px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="w-full">
              <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Pickup Date</span>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none [color-scheme:dark] mt-0.5"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm tracking-wide transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>Find Fleet</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Transparent Pricing, Zero Hidden Fees
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-400" /> Free Supercharging Credits Included
          </span>
        </div>
      </div>
    </section>
  );
}

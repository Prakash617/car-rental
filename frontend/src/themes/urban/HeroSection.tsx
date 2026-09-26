"use client";

import React, { useState } from "react";
import { HeroProps } from "@/lib/themes/types";
import { Navigation, Zap, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

export function UrbanHeroSection({ branding, onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [zone, setZone] = useState("Downtown Metro Terminal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ pickupDate, branchId: zone });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
      {/* Dynamic cyan neon grid glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(6,182,212,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,#020617_100%)]" />

      {/* Cyber/Metropolis grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/50 text-cyan-400 text-xs font-semibold tracking-wide">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{branding.name} Transit & Carsharing</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-sans font-black tracking-tight text-white max-w-3xl mx-auto">
          Move Through The City <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
            Without Friction
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-xl mx-auto font-normal">
          Compact EVs, agile city hatchbacks, and executive commuters parked at every transit hub. Unlock with your phone.
        </p>

        {/* Urban Rapid Station Search */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="text-left px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="w-full">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Station / Hub</span>
              <select
                aria-label="Station / Hub"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="Downtown Metro Terminal" className="bg-slate-900 text-white">Downtown Metro Terminal</option>
                <option value="Financial District Garage" className="bg-slate-900 text-white">Financial District Garage</option>
                <option value="Arts Quarter Pod" className="bg-slate-900 text-white">Arts Quarter Pod</option>
              </select>
            </div>
          </div>

          <div className="text-left px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="w-full">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start Time</span>
              <input
                type="date"
                aria-label="Start Time"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none [color-scheme:dark] mt-0.5"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Reserve Vehicle</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Free Municipal Parking Included
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Congestion Charge Exempt
          </span>
        </div>
      </div>
    </section>
  );
}

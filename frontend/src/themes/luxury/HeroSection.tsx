"use client";

import React, { useState } from "react";
import { HeroProps } from "@/lib/themes/types";
import { Calendar, MapPin, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";

export function LuxuryHeroSection({ branding, onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [location, setLocation] = useState("Downtown Concierge Hub");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ pickupDate, branchId: location });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-[#090A0F] text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
      {/* Subtle ambient luxury backdrop illumination */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#090A0F_100%)]" />

      {/* Decorative hairline border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-8">
        {/* Editorial Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#161822]/80 backdrop-blur-md text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{branding.name} Concierge Collection</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.1]">
          The Pinnacle of <span className="italic text-[#D4AF37] font-serif">Automotive</span> Luxury
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Experience peerless performance and white-glove concierge mobility. Every vehicle in our 
          handcrafted fleet is maintained to uncompromising standards.
        </p>

        {/* Search & Reservation Bar */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 p-2 sm:p-3 rounded-2xl bg-[#12141F]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-left">
            <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div className="w-full">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">Pickup Location</label>
              <select
                aria-label="Pickup Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Downtown Concierge Hub" className="bg-[#12141F] text-white">Downtown Concierge Hub</option>
                <option value="Airport VIP Terminal" className="bg-[#12141F] text-white">Airport VIP Terminal</option>
                <option value="Private Helipad Delivery" className="bg-[#12141F] text-white">Private Helipad Delivery</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-left">
            <Calendar className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div className="w-full">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">Dates</label>
              <input
                type="date"
                aria-label="Pickup Date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="submit"
              className="w-full h-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-black font-semibold text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
            >
              <span>Explore Collection</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Reassurance Metrics */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 font-light">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Fully Insured & Guaranteed Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>24/7 Dedicated Concierge Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

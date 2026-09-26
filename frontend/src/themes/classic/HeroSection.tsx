"use client";

import React, { useState } from "react";
import { HeroProps } from "@/lib/themes/types";
import { Award, Calendar, MapPin, ChevronRight, ShieldCheck } from "lucide-react";

export function ClassicHeroSection({ branding, onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [branch, setBranch] = useState("Heritage Club Headquarters");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ pickupDate, branchId: branch });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-[#13110e] text-[#f5f1eb] overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
      {/* Warm leather and cognac ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(139,90,43,0.18),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,#13110e_100%)]" />

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-7">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#8B5A2B]/40 bg-[#1c1813] text-[#c9955e] text-xs font-serif tracking-widest uppercase">
          <Award className="w-3.5 h-3.5 text-[#c9955e]" />
          <span>{branding.name} Heritage Fleet</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-[#f5f1eb] max-w-3xl mx-auto leading-tight">
          Timeless Elegance. <br />
          <span className="italic text-[#c9955e]">Exceptional Heritage.</span>
        </h1>

        <p className="text-base text-[#a89f91] max-w-xl mx-auto font-light leading-relaxed">
          Distinguished grand tourers, timeless roadsters, and hand-selected executive sedans with bespoke personal delivery.
        </p>

        {/* Heritage Search Deck */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 p-3 rounded-2xl bg-[#1c1813]/90 border border-[#2e261e] shadow-2xl backdrop-blur-md max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="text-left px-4 py-3 rounded-xl bg-[#13110e]/70 border border-[#2e261e] flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#c9955e] shrink-0" />
            <div className="w-full">
              <span className="block text-[10px] uppercase font-bold text-[#8f8475] tracking-wider">Heritage Branch</span>
              <select
                aria-label="Heritage Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-transparent text-sm font-serif text-[#f5f1eb] focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="Heritage Club Headquarters" className="bg-[#1c1813] text-[#f5f1eb]">Heritage Club Headquarters</option>
                <option value="Estate & Country House Depot" className="bg-[#1c1813] text-[#f5f1eb]">Estate & Country House Depot</option>
                <option value="Mayfair Executive Concierge" className="bg-[#1c1813] text-[#f5f1eb]">Mayfair Executive Concierge</option>
              </select>
            </div>
          </div>

          <div className="text-left px-4 py-3 rounded-xl bg-[#13110e]/70 border border-[#2e261e] flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#c9955e] shrink-0" />
            <div className="w-full">
              <span className="block text-[10px] uppercase font-bold text-[#8f8475] tracking-wider">Hire Period</span>
              <input
                type="date"
                aria-label="Hire Period"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs text-[#f5f1eb] focus:outline-none [color-scheme:dark] mt-0.5"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-[#8B5A2B] hover:bg-[#a06933] text-stone-100 font-serif font-semibold text-sm tracking-wide transition-all shadow-lg shadow-[#8B5A2B]/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>View Heritage Fleet</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8f8475]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#c9955e]" /> Tailored Agreed-Value Classic Coverage
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#c9955e]" /> Authentic Period Specifications
          </span>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { FooterProps } from "@/lib/themes/types";
import { PageLinks } from "@/components/storefront/PageLinks";
import { Compass, Mail, Phone, Mountain, Radio } from "lucide-react";

export function AdventureFooter({ branding }: FooterProps) {
  return (
    <footer className="bg-[#0a0f0b] text-stone-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-stone-950 font-black">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-sans font-bold text-lg text-stone-100 tracking-tight uppercase">{branding.name}</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Specialized backcountry vehicle logistics, expedition rentals, and rooftop overland outfitting.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
            <Radio className="w-3 h-3 animate-pulse" />
            Satellite Dispatch Active
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-stone-200 font-bold">Expedition Types</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">4x4 Overland Campers</a></li>
            <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">Heavy-Duty Trail Pickups</a></li>
            <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">Expedition Luxury Rigs</a></li>
            <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">Desert Dune Pre-Runners</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-stone-200 font-bold">Trail Resources</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><span className="hover:text-emerald-400 cursor-pointer">Live Trailhead Weather</span></li>
            <li><span className="hover:text-emerald-400 cursor-pointer">BLM Dispersed Camping Permits</span></li>
            <li><span className="hover:text-emerald-400 cursor-pointer">Winch & Recovery Guidelines</span></li>
            <li><span className="hover:text-emerald-400 cursor-pointer">Leave No Trace Principles</span></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-stone-200 font-bold">Basecamp Operations</h4>
          <div className="space-y-2 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <a href={`mailto:${branding.support_email}`} className="hover:text-stone-200 transition-colors">
                {branding.support_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <a href={`tel:${branding.support_phone}`} className="hover:text-stone-200 transition-colors">
                {branding.support_phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trailhead & National Park Staging Areas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <div>© {new Date().getFullYear()} {branding.name}. All trails respected.</div>
        <div className="flex gap-6">
          <span className="hover:text-stone-300 cursor-pointer">Backcountry Insurance Policy</span>
          <span className="hover:text-stone-300 cursor-pointer">Emergency SOS Protocol</span>
          <span className="hover:text-stone-300 cursor-pointer">Waiver & Liability</span>
          <PageLinks variant="footer" className="hover:text-stone-300 transition-colors" />
        </div>
      </div>
    </footer>
  );
}

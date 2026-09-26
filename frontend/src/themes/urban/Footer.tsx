"use client";

import React from "react";
import { FooterProps } from "@/lib/themes/types";
import { Zap, Mail, Phone, MapPin, Radio } from "lucide-react";

export function UrbanFooter({ branding }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-black">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
            <span className="font-sans font-black text-lg text-white tracking-tight uppercase">{branding.name}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Metropolitan on-demand carsharing. Instant Bluetooth access, downtown parking included, zero emissions.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            City Fleet Online
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-200 font-bold">Urban Fleet</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#fleet" className="hover:text-cyan-400 transition-colors">Micro Electric Runabouts</a></li>
            <li><a href="#fleet" className="hover:text-cyan-400 transition-colors">City Hatchbacks</a></li>
            <li><a href="#fleet" className="hover:text-cyan-400 transition-colors">Executive Commuter Sedans</a></li>
            <li><a href="#fleet" className="hover:text-cyan-400 transition-colors">Compact Electric Crossovers</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-200 font-bold">Station Network</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><span className="hover:text-cyan-400 cursor-pointer">Transit Interchange Pods</span></li>
            <li><span className="hover:text-cyan-400 cursor-pointer">Airport Express Hub</span></li>
            <li><span className="hover:text-cyan-400 cursor-pointer">Commercial District Garages</span></li>
            <li><span className="hover:text-cyan-400 cursor-pointer">Charging Partner Locations</span></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-200 font-bold">City Dispatch</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <a href={`mailto:${branding.support_email}`} className="hover:text-white transition-colors">
                {branding.support_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <a href={`tel:${branding.support_phone}`} className="hover:text-white transition-colors">
                {branding.support_phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Downtown Rapid Transit Stations</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
        <div>© {new Date().getFullYear()} {branding.name}. Clean mobility for modern cities.</div>
        <div className="flex gap-6">
          <span className="hover:text-slate-400 cursor-pointer">Urban Parking Rules</span>
          <span className="hover:text-slate-400 cursor-pointer">Fair Use Mobility</span>
          <span className="hover:text-slate-400 cursor-pointer">Toll Exemption Guide</span>
        </div>
      </div>
    </footer>
  );
}

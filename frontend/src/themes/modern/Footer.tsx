"use client";

import React from "react";
import { FooterProps } from "@/lib/themes/types";
import { PageLinks } from "@/components/storefront/PageLinks";
import { Zap, Mail, Phone, ShieldCheck } from "lucide-react";

export function ModernFooter({ branding }: FooterProps) {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-800">
        {/* Brand info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-sans font-bold text-lg text-white tracking-tight">{branding.name}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Autonomous mobility & on-demand premium car sharing. Instant digital keys, zero paperwork, 100% verified fleet.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            All Hubs Operational
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Fleet Models</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li><a href="#fleet" className="hover:text-blue-400 transition-colors">Electric Performance</a></li>
            <li><a href="#fleet" className="hover:text-blue-400 transition-colors">Long-Range SUVs</a></li>
            <li><a href="#fleet" className="hover:text-blue-400 transition-colors">Urban Compacts</a></li>
            <li><a href="#fleet" className="hover:text-blue-400 transition-colors">Sports Sedans</a></li>
          </ul>
        </div>

        {/* Mobility Tech */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Mobility Tech</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li><span className="hover:text-blue-400 cursor-pointer">Mobile App Digital Key</span></li>
            <li><span className="hover:text-blue-400 cursor-pointer">Supercharger Map</span></li>
            <li><span className="hover:text-blue-400 cursor-pointer">Corporate Subscriptions</span></li>
            <li><span className="hover:text-blue-400 cursor-pointer">API & Telemetry</span></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Hub Support</h4>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <a href={`mailto:${branding.support_email}`} className="hover:text-white transition-colors">
                {branding.support_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <a href={`tel:${branding.support_phone}`} className="hover:text-white transition-colors">
                {branding.support_phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Full Collision & Roadside Assist</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div>© {new Date().getFullYear()} {branding.name}. Powered by Car Rental SaaS Engine.</div>
        <div className="flex gap-6">
          <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-zinc-300 cursor-pointer">Privacy Notice</span>
          <span className="hover:text-zinc-300 cursor-pointer">Fleet Telemetry Privacy</span>
          <PageLinks variant="footer" className="hover:text-zinc-300 transition-colors" />
        </div>
      </div>
    </footer>
  );
}

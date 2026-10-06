"use client";

import React from "react";
import Link from "next/link";
import { FooterProps } from "@/lib/themes/types";
import { Sparkles, Mail, Phone, MapPin, TrendingUp, ShieldCheck } from "lucide-react";
import { PageLinks } from "@/components/storefront/PageLinks";

export function LuxuryFooter({ branding }: FooterProps) {
  return (
    <footer className="bg-[#07080B] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
        {/* Brand identity */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-serif text-lg tracking-wider text-slate-100 uppercase">
              {branding.name}
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            Exclusive automotive concierge platform providing unparalleled access to the world&apos;s
            finest vehicles, paired with high-yield vehicle consignment programs for luxury asset owners.
          </p>
          <div className="pt-1">
            <Link
              href="/list-your-car"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D4AF37] hover:underline"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Host Program: Consign & Earn 70%</span>
            </Link>
          </div>
        </div>

        {/* Fleet Categories */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium font-mono">
            Collections
          </h4>
          <ul className="space-y-2 text-xs font-light text-slate-400">
            <li>
              <Link href="/fleet" className="hover:text-slate-100 transition-colors">
                Exotic Sports & Supercars
              </Link>
            </li>
            <li>
              <Link href="/fleet" className="hover:text-slate-100 transition-colors">
                Executive Flagship Sedans
              </Link>
            </li>
            <li>
              <Link href="/fleet" className="hover:text-slate-100 transition-colors">
                Prestige All-Terrain SUVs
              </Link>
            </li>
            <li>
              <Link href="/fleet" className="hover:text-slate-100 transition-colors">
                High-Performance EVs
              </Link>
            </li>
          </ul>
        </div>

        {/* Vehicle Owners & Concierge */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium font-mono">
            Host & Concierge
          </h4>
          <ul className="space-y-2 text-xs font-light text-slate-400">
            <li>
              <Link
                href="/list-your-car"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1"
              >
                <span>List Your Car (70% Payout)</span>
              </Link>
            </li>
            <li>
              <Link href="/locations" className="hover:text-slate-100 transition-colors">
                Private Aviation & Depot Hubs
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-slate-100 transition-colors">
                Heritage & Vehicle Standards
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-slate-100 transition-colors">
                Private Client Office
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium font-mono">
            Private Office
          </h4>
          <div className="space-y-2 text-xs font-light text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <a
                href={`mailto:${branding.support_email}`}
                className="hover:text-slate-100 transition-colors"
              >
                {branding.support_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <a
                href={`tel:${branding.support_phone}`}
                className="hover:text-slate-100 transition-colors font-mono"
              >
                {branding.support_phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Beverly Hills & Private Aviation Gateways</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 font-light gap-4">
        <div>
          © {new Date().getFullYear()} {branding.name}. All rights reserved.
        </div>
        <div className="flex gap-6 text-zinc-500">
          <Link href="/pages/privacy-policy" className="hover:text-slate-400 transition-colors">
            Privacy Charter
          </Link>
          <Link href="/pages/terms-of-service" className="hover:text-slate-400 transition-colors">
            Rental Agreements
          </Link>
          <Link href="/pages/rental-requirements" className="hover:text-slate-400 transition-colors">
            Insurance &amp; Vetting Standards
          </Link>
          <PageLinks variant="footer" className="hover:text-slate-400 transition-colors" />
        </div>
      </div>
    </footer>
  );
}

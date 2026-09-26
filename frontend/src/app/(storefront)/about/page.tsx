"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Globe,
  Clock,
  Car,
} from "lucide-react";
import { useBranding } from "@/lib/context/branding";
import { getThemeHeadingFont } from "@/lib/themes/registry";

export default function AboutPage() {
  const branding = useBranding();
  const headingFont = getThemeHeadingFont(branding.active_theme);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase border"
            style={{
              backgroundColor: `${branding.primary_color}18`,
              borderColor: `${branding.primary_color}33`,
              color: branding.primary_color,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>The {branding.name} Standards &amp; Heritage</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-bold text-white tracking-tight ${headingFont}`}>
            Redefining Ultra-Luxury Automotive Access
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            {branding.name} was established to bridge the gap between private vehicle ownership
            and effortless on-demand charter for discerning executives and automotive aficionados.
          </p>
        </div>
      </section>

      {/* Philosophy & Dual-Ecosystem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
              style={{ color: branding.primary_color }}
            >
              <span>Our Two-Sided Platform</span>
            </div>
            <h2 className={`text-3xl font-bold text-white tracking-tight ${headingFont}`}>
              A Symbiotic Luxury Ecosystem
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              We cater simultaneously to two distinct automotive communities:
            </p>
            <ul className="space-y-4 text-xs text-zinc-300">
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-white/[0.08]">
                <Car className="w-5 h-5 shrink-0 mt-0.5" style={{ color: branding.primary_color }} />
                <div>
                  <strong className="text-white block text-sm">Discerning Renters</strong>
                  Corporate executives, traveling VIPs, and collectors who require pristine,
                  delivery-ready exotic and flagship automobiles on flexible terms.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-white/[0.08]">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm">Vehicle Consignors (Hosts)</strong>
                  Luxury vehicle owners who monetize their idle assets with full $2M insurance,
                  white-glove maintenance, and guaranteed 70% revenue share.
                </div>
              </li>
            </ul>

            <div className="pt-2 flex gap-4">
              <Link
                href="/fleet"
                className="px-5 py-2.5 rounded-xl text-black font-semibold text-xs uppercase tracking-wider transition-opacity hover:opacity-90 shadow-md"
                style={{ backgroundColor: branding.primary_color }}
              >
                Browse Fleet
              </Link>
              <Link
                href="/list-your-car"
                className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-white font-semibold text-xs uppercase tracking-wider"
              >
                Consign a Car
              </Link>
            </div>
          </div>

          <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.1] bg-zinc-900 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80"
              alt={`${branding.name} Staging`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 4 Pillars of Standard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/[0.08] space-y-3">
            <Award className="w-6 h-6" style={{ color: branding.primary_color }} />
            <h3 className={`text-base font-bold text-white ${headingFont}`}>Pristine Fleet Curation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Every vehicle undergoes a 120-point digital inspection and rigorous mechanical testing
              prior to entering the catalog.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/[0.08] space-y-3">
            <Clock className="w-6 h-6" style={{ color: branding.primary_color }} />
            <h3 className={`text-base font-bold text-white ${headingFont}`}>Tarmac Jet Delivery</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Direct delivery to private FBO ramps (Signature Flight Support, Atlantic Aviation)
              with vehicles positioned plane-side.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/[0.08] space-y-3">
            <ShieldCheck className="w-6 h-6" style={{ color: branding.primary_color }} />
            <h3 className={`text-base font-bold text-white ${headingFont}`}>Comprehensive Insurance</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Underwritten by Lloyd’s of London, providing $2,000,000 in primary commercial
              coverage for both renters and hosts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/[0.08] space-y-3">
            <Globe className="w-6 h-6" style={{ color: branding.primary_color }} />
            <h3 className={`text-base font-bold text-white ${headingFont}`}>Multi-City Network</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Seamless cross-city vehicle relocations between Los Angeles, Miami, New York, and Las Vegas
              depot hubs.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

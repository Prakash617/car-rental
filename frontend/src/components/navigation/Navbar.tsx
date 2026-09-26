"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TenantBranding } from "@/types";
import { Phone, Menu, X, Car, Sparkles, TrendingUp } from "lucide-react";
import { getThemeHeadingFont } from "@/lib/themes/registry";

interface NavbarProps {
  branding: TenantBranding;
}

export function Navbar({ branding }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headingFont = getThemeHeadingFont(branding.active_theme);

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl transition-all duration-300"
      style={{
        backgroundColor: "rgba(8, 9, 14, 0.88)",
        borderBottom: `1px solid ${branding.primary_color}33`,
        boxShadow: `0 8px 30px -8px ${branding.primary_color}20`,
      }}
    >
      {/* Dynamic Theme Color Accent Ribbon */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${branding.primary_color} 30%, ${branding.accent_color || branding.primary_color} 70%, transparent 100%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-md"
            style={{
              backgroundColor: branding.primary_color,
              boxShadow: `0 0 16px ${branding.primary_color}45`,
            }}
          >
            <Car className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className={`font-bold text-lg text-white tracking-wide block leading-none ${headingFont}`}>
              {branding.name}
            </span>
            <span
              className="text-[10px] font-mono uppercase tracking-widest block mt-0.5"
              style={{ color: branding.primary_color }}
            >
              {branding.active_theme} concierge
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-wider font-medium text-zinc-300">
          <Link href="/fleet" className="hover:text-white transition-colors">
            Fleet Showroom
          </Link>

          {/* Prominent Link for Second User Persona (Vehicle Consignor / Host) */}
          <Link
            href="/list-your-car"
            className="group relative flex items-center gap-1.5 text-zinc-200 hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: branding.primary_color }} />
            <span>List Your Car</span>
            <span
              className="px-1.5 py-0.2 rounded-full text-[9px] font-mono lowercase border"
              style={{
                backgroundColor: `${branding.primary_color}18`,
                borderColor: `${branding.primary_color}40`,
                color: branding.primary_color,
              }}
            >
              earn 70%
            </span>
          </Link>

          <Link href="/locations" className="hover:text-white transition-colors">
            Locations
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            Standards &amp; About
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/list-your-car"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: branding.primary_color }} />
            <span>Host Consignment</span>
          </Link>

          <Link
            href="/fleet"
            className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-black transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm"
            style={{ backgroundColor: branding.primary_color }}
          >
            Explore Fleet
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-zinc-950/98 border-b border-zinc-800 space-y-4">
          <div className="flex flex-col space-y-3 text-sm text-zinc-300 font-medium pt-2">
            <Link
              href="/fleet"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Fleet Showroom
            </Link>
            <Link
              href="/list-your-car"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 font-semibold flex items-center gap-2"
              style={{ color: branding.primary_color }}
            >
              <Sparkles className="w-4 h-4" />
              <span>List Your Car (Host &amp; Earn 70%)</span>
            </Link>
            <Link
              href="/locations"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Depot Locations &amp; Terminals
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Standards &amp; Heritage
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Private Client Desk
            </Link>
            <a
              href={`tel:${branding.support_phone}`}
              className="py-1 text-zinc-400 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" style={{ color: branding.primary_color }} /> {branding.support_phone}
            </a>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              href="/list-your-car"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-center rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-white/[0.05] border border-white/[0.12]"
            >
              Host a Vehicle
            </Link>
            <Link
              href="/fleet"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-center rounded-xl text-xs font-bold uppercase tracking-wider text-black shadow-md"
              style={{ backgroundColor: branding.primary_color }}
            >
              Rent a Car
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

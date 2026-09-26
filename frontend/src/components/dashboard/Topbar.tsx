"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ExternalLink, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useBranding } from "@/lib/context/branding";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, tenantDomain } = useAuth();

  let brandingName = "FLEETCORE";
  try {
    const branding = useBranding();
    if (branding?.name) {
      brandingName = branding.name;
    }
  } catch {
    if (tenantDomain) {
      const clean = tenantDomain.split(".")[0];
      brandingName = clean.toUpperCase() + " FLEET";
    }
  }

  const rawDomain = tenantDomain || (typeof window !== "undefined" && window.location.host.includes(".localhost") ? window.location.host : "apex.localhost");
  const cleanDomain = rawDomain.replace(/:\d+$/, "");
  const storefrontUrl = `http://${cleanDomain}:3000`;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.08] bg-zinc-950/80 px-4 backdrop-blur-xl md:px-8">
      {/* Mobile Drawer Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-white/[0.08] p-2 text-zinc-400 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-bold text-white text-sm truncate max-w-[180px]">{brandingName}</span>
      </div>

      {/* Tenancy Badge (Desktop) */}
      <div className="hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 font-medium font-mono">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{tenantDomain ? `${tenantDomain}` : "PostgreSQL Schema-Isolated Tenant"}</span>
        </div>
      </div>

      {/* Topbar Actions */}
      <div className="flex items-center gap-3">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors border border-white/[0.08] rounded-md px-2.5 py-1.5 bg-white/[0.03]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Open Storefront</span>
        </a>

        <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold font-mono">
            {user?.first_name?.[0] || "J"}
          </div>
          <div className="hidden sm:block text-left mr-2">
            <span className="block text-xs font-semibold text-white leading-tight">
              {user ? `${user.first_name} ${user.last_name}` : "Julian Vane"}
            </span>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Staff Concierge
            </span>
          </div>

          <button
            onClick={() => logout()}
            title="Sign Out of Concierge OS"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors border border-white/[0.08] hover:border-rose-500/30 rounded-md px-2.5 py-1.5 bg-white/[0.03]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-white/[0.08] bg-zinc-950 p-4 md:hidden flex flex-col gap-2 shadow-2xl">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-md hover:bg-white/[0.05]"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/fleet"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-md hover:bg-white/[0.05]"
          >
            Fleet Inventory
          </Link>
          <Link
            href="/dashboard/bookings"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-md hover:bg-white/[0.05]"
          >
            Reservations
          </Link>
          <Link
            href="/dashboard/customers"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-md hover:bg-white/[0.05]"
          >
            Customer Directory
          </Link>
          <Link
            href="/dashboard/theme"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-md hover:bg-white/[0.05]"
          >
            Theme & Branding
          </Link>
          <div className="pt-2 border-t border-white/[0.08] flex justify-between items-center">
            <a
              href={`http://${(tenantDomain || "apex.localhost").replace(/:\d+$/, "")}:3000`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Storefront
            </a>
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="text-xs text-rose-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

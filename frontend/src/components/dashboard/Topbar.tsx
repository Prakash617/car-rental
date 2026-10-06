"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  LogOut,
  User,
  Calendar,
  Users,
  HelpCircle,
  Car,
  Key,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useBranding } from "@/lib/context/branding";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, tenantDomain } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const rawDomain =
    tenantDomain ||
    (typeof window !== "undefined" &&
    window.location.host.includes(".localhost")
      ? window.location.host
      : "apex.localhost");
  const cleanDomain = rawDomain.replace(/:\d+$/, "");
  const storefrontUrl = `http://${cleanDomain}:3000`;

  const clientDropdownItems = [
    { label: "Profile", href: "/client", icon: User },
    { label: "My Bookings", href: "/client", icon: Calendar },
    { label: "Carpool", href: "/search?trip_type=tour", icon: Users },
    { label: "My Inquiries", href: "/contact", icon: HelpCircle },
    { label: "My Vehicles", href: "/list-your-car", icon: Car },
    { label: "Change Password", href: "/client", icon: Key },
  ];

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
        <span className="font-bold text-white text-sm truncate max-w-[180px]">
          {brandingName}
        </span>
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

        {/* User Profile Pill with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-lg border border-white/[0.08] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e11d2e]/20 border border-[#e11d2e]/40 text-[#ff4d5e] text-xs font-bold font-mono">
              {user?.first_name?.[0] || "J"}
            </div>
            <div className="hidden sm:block text-left mr-1">
              <span className="block text-xs font-semibold text-white leading-tight">
                {user ? `${user.first_name} ${user.last_name}` : "Julian Vane"}
              </span>
              <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                Staff Concierge
              </span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-400 transition-transform hidden sm:block ${
                userDropdownOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* User Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2.5 border-b border-white/[0.08]">
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {user ? `${user.first_name} ${user.last_name}` : "Julian Vane"}
                </p>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                  {user?.email || "concierge@apex-fleet.com"}
                </p>
              </div>

              <div className="py-1">
                {clientDropdownItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Icon className="h-4 w-4 text-zinc-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-1 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout("/");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-white/[0.08] bg-zinc-950 p-4 md:hidden flex flex-col gap-2 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 pt-1">
            Dashboard Navigation
          </div>
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
            Theme &amp; Branding
          </Link>

          <div className="border-t border-white/[0.08] my-1" />

          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 pt-1">
            Account &amp; Client Portal
          </div>
          {clientDropdownItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-md hover:bg-white/[0.05] flex items-center gap-2.5"
              >
                <Icon className="h-4 w-4 text-zinc-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}

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
                logout("/");
                setMobileOpen(false);
              }}
              className="text-xs text-rose-400 flex items-center gap-1 hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

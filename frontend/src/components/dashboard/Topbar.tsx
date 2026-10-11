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
  HelpCircle,
  Car,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  Palette,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useBranding } from "@/lib/context/branding";
import { useDashboardTheme } from "@/lib/context/dashboard-theme";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, tenantDomain, role } = useAuth();
  const { theme, toggleTheme, isLight } = useDashboardTheme();

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

  let queryTenant: string | null = null;
  if (typeof window !== "undefined") {
    queryTenant = new URLSearchParams(window.location.search).get("tenant");
  }

  const rawDomain =
    queryTenant ||
    tenantDomain ||
    (typeof window !== "undefined" &&
    window.location.host.includes(".localhost")
      ? window.location.host
      : "superbang.localhost");
  const cleanDomain = rawDomain.replace(/:\d+$/, "");
  const storefrontUrl = `http://${cleanDomain}:3000`;

  const isSuperbang = cleanDomain.includes("superbang");

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email.split("@")[0]
    : isSuperbang
    ? "SuperBang Admin"
    : "Fleet Admin";

  const displayEmail = user?.email || (isSuperbang ? "superbang617@gmail.com" : `admin@${cleanDomain}`);

  const displayRole =
    role === "owner"
      ? "Company Owner"
      : role === "admin"
      ? "Fleet Admin"
      : role === "manager"
      ? "Fleet Manager"
      : isSuperbang
      ? "Company Owner"
      : "Operations Staff";

  const displayInitials =
    user?.first_name && user?.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : isSuperbang
      ? "SB"
      : displayName.slice(0, 2).toUpperCase();

  let brandingName = isSuperbang ? "SUPERBANG" : "FLEETCORE";
  try {
    const branding = useBranding();
    if (branding?.name) {
      brandingName = branding.name;
    }
  } catch {
    const clean = cleanDomain.split(".")[0];
    brandingName = clean.toUpperCase() + " FLEET";
  }

  const dashboardDropdownItems = [
    { label: "Operations & Branches", href: `/dashboard/settings?tenant=${cleanDomain}`, icon: Settings },
    { label: "Theme & Branding", href: `/dashboard/theme?tenant=${cleanDomain}`, icon: Palette },
    { label: "SEO & Social Sharing", href: `/dashboard/seo?tenant=${cleanDomain}`, icon: Globe },
    { label: "Fleet Inventory", href: `/dashboard/fleet?tenant=${cleanDomain}`, icon: Car },
    { label: "Customer Inquiries & FAQ", href: `/dashboard/faq?tenant=${cleanDomain}`, icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/80 bg-white/80 px-4 backdrop-blur-xl md:px-8 transition-colors">
      {/* Mobile Drawer Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border dark:border-white/[0.08] border-slate-200 p-2 dark:text-zinc-400 text-slate-600 dark:hover:text-white hover:text-slate-900"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-bold dark:text-white text-slate-900 text-sm truncate max-w-[180px]">
          {brandingName}
        </span>
      </div>

      {/* Tenancy Badge (Desktop) */}
      <div className="hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-500 font-medium font-mono">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{`${cleanDomain} (tenant_${cleanDomain.split(".")[0]})`}</span>
        </div>
      </div>

      {/* Topbar Actions */}
      <div className="flex items-center gap-2.5">
        {/* Light / Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
          className="flex items-center justify-center h-8.5 w-8.5 rounded-lg border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.04] bg-slate-100/80 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-slate-700 dark:text-zinc-300 transition-all shadow-2xs"
          aria-label="Toggle theme mode"
        >
          {isLight ? (
            <Moon className="h-4 w-4 text-slate-700 transition-transform" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
          )}
        </button>

        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 transition-colors border dark:border-white/[0.08] border-slate-200 rounded-lg px-2.5 py-1.5 dark:bg-white/[0.03] bg-slate-100/60 hover:bg-slate-100 dark:hover:bg-white/[0.08]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Open Storefront</span>
        </a>

        <div className="h-4 w-px dark:bg-white/[0.08] bg-slate-200 hidden sm:block" />

        {/* User Profile Pill with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-lg border dark:border-white/[0.08] border-slate-200 dark:hover:border-white/20 hover:border-slate-300 dark:bg-white/[0.03] bg-slate-100/60 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all text-left shadow-2xs"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e11d2e]/15 border border-[#e11d2e]/30 text-[#e11d2e] text-xs font-bold font-mono">
              {displayInitials}
            </div>
            <div className="hidden sm:block text-left mr-1">
              <span className="block text-xs font-semibold dark:text-white text-slate-900 leading-tight">
                {displayName}
              </span>
              <span className="block text-[10px] dark:text-zinc-400 text-slate-500 uppercase tracking-wider font-mono">
                {displayRole}
              </span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 dark:text-zinc-400 text-slate-500 transition-transform hidden sm:block ${
                userDropdownOpen ? "rotate-180 dark:text-white text-slate-900" : ""
              }`}
            />
          </button>

          {/* User Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-zinc-900/95 bg-white p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2.5 border-b dark:border-white/[0.08] border-slate-100">
                <p className="text-xs font-bold dark:text-white text-slate-900 leading-tight truncate">
                  {displayName}
                </p>
                <p className="text-[11px] dark:text-zinc-400 text-slate-500 truncate mt-0.5 font-mono">
                  {displayEmail}
                </p>
              </div>

              <div className="py-1">
                {dashboardDropdownItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors"
                    >
                      <Icon className="h-4 w-4 dark:text-zinc-400 text-slate-500" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-1 border-t dark:border-white/[0.08] border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout("/");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 border-b dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950 bg-white p-4 md:hidden flex flex-col gap-2 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="text-[11px] font-semibold uppercase tracking-wider dark:text-zinc-500 text-slate-400 px-3 pt-1">
            Dashboard Navigation
          </div>
          <Link
            href={`/dashboard?tenant=${cleanDomain}`}
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 rounded-md dark:hover:bg-white/[0.05] hover:bg-slate-100"
          >
            Overview
          </Link>
          <Link
            href={`/dashboard/fleet?tenant=${cleanDomain}`}
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 rounded-md dark:hover:bg-white/[0.05] hover:bg-slate-100"
          >
            Fleet Inventory
          </Link>
          <Link
            href={`/dashboard/bookings?tenant=${cleanDomain}`}
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 rounded-md dark:hover:bg-white/[0.05] hover:bg-slate-100"
          >
            Reservations
          </Link>
          <Link
            href={`/dashboard/carpool?tenant=${cleanDomain}`}
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 rounded-md dark:hover:bg-white/[0.05] hover:bg-slate-100"
          >
            Carpool &amp; Rides
          </Link>
          <Link
            href={`/dashboard/customers?tenant=${cleanDomain}`}
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 rounded-md dark:hover:bg-white/[0.05] hover:bg-slate-100"
          >
            Customer Directory
          </Link>
          <Link
            href={`/dashboard/theme?tenant=${cleanDomain}`}
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 text-sm dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 rounded-md dark:hover:bg-white/[0.05] hover:bg-slate-100"
          >
            Theme &amp; Branding
          </Link>

          <div className="border-t dark:border-white/[0.08] border-slate-200 my-1" />

          <div className="text-[11px] font-semibold uppercase tracking-wider dark:text-zinc-500 text-slate-400 px-3 pt-1">
            Company Administration
          </div>
          {dashboardDropdownItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 rounded-md dark:hover:bg-white/[0.05] hover:bg-slate-100 flex items-center gap-2.5"
              >
                <Icon className="h-4 w-4 dark:text-zinc-400 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t dark:border-white/[0.08] border-slate-200 flex justify-between items-center">
            <a
              href={storefrontUrl}
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
              className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-300"
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

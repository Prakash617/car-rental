"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  Palette,
  ExternalLink,
  LogOut,
  Building2,
  ChevronRight,
  Search,
  HelpCircle,
  FileText,
  Wrench,
  Globe,
  ShieldCheck,
  User,
  Key,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { useBranding } from "@/lib/context/branding";

const mgmtNavItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Fleet Inventory",
    href: "/dashboard/fleet",
    icon: Car,
  },
  {
    label: "Host Approvals",
    href: "/dashboard/fleet?status=pending_approval",
    icon: ShieldCheck,
    badge: "Host",
  },
  {
    label: "Reservations",
    href: "/dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Carpool & Rides",
    href: "/dashboard/carpool",
    icon: Route,
  },
  {
    label: "Customer Directory",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    label: "Fleet Maintenance",
    href: "/dashboard/maintenance",
    icon: Wrench,
  },
  {
    label: "Branches & Settings",
    href: "/dashboard/settings",
    icon: Building2,
  },
];

const cmsNavItems = [
  {
    label: "Theme & Branding",
    href: "/dashboard/theme",
    icon: Palette,
  },
  {
    label: "SEO & Content",
    href: "/dashboard/seo",
    icon: Search,
  },
  {
    label: "FAQ Manager",
    href: "/dashboard/faq",
    icon: HelpCircle,
  },
  {
    label: "Content Pages",
    href: "/dashboard/pages",
    icon: FileText,
  },
  {
    label: "Custom Domains",
    href: "/dashboard/domains",
    icon: Globe,
  },
  {
    label: "Audit Trail",
    href: "/dashboard/audit",
    icon: ShieldCheck,
  },
];

function NavGroup({
  items,
  pathname,
  tenantDomain,
}: {
  items: typeof mgmtNavItems;
  pathname: string;
  tenantDomain?: string | null;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        const separator = item.href.includes("?") ? "&" : "?";
        const targetHref = tenantDomain
          ? `${item.href}${separator}tenant=${tenantDomain}`
          : item.href;

        return (
          <Link
            key={item.href}
            href={targetHref}
            className={cn(
              "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "dark:bg-white/[0.08] bg-slate-100 dark:text-white text-slate-900 shadow-2xs border dark:border-white/[0.08] border-slate-200"
                : "dark:text-zinc-400 text-slate-600 dark:hover:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:text-white hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "dark:text-zinc-400 text-slate-500 group-hover:text-primary"
                )}
              />
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {"badge" in item && (item as any).badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 font-semibold uppercase">
                  {(item as any).badge}
                </span>
              )}
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-primary opacity-80" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout, tenantDomain } = useAuth();

  let queryTenant: string | null = null;
  if (typeof window !== "undefined") {
    queryTenant = new URLSearchParams(window.location.search).get("tenant");
  }

  const rawDomain =
    queryTenant ||
    tenantDomain ||
    (typeof window !== "undefined" && window.location.host.includes(".localhost")
      ? window.location.host
      : "superbang.localhost");
  const cleanDomain = rawDomain.replace(/:\d+$/, "");
  const storefrontUrl = `http://${cleanDomain}:3000`;

  let brandingName = cleanDomain.includes("superbang") ? "SUPERBANG" : "FLEETCORE";
  try {
    const branding = useBranding();
    if (branding?.name) {
      brandingName = branding.name;
    }
  } catch {
    const clean = cleanDomain.split(".")[0];
    brandingName = clean.toUpperCase() + " FLEET";
  }

  const isSuperbang = cleanDomain.includes("superbang");
  const displayUser = user && (!isSuperbang || user.email === "superbang617@gmail.com")
    ? user
    : isSuperbang
    ? { first_name: "Super", last_name: "Bang", email: "superbang617@gmail.com" }
    : user || { first_name: "Julian", last_name: "Vane", email: "concierge@apex-fleet.com" };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/90 bg-white/95 backdrop-blur-2xl md:flex transition-colors">
      {/* Platform Branding Header */}
      <div className="flex h-16 items-center justify-between border-b dark:border-white/[0.08] border-slate-200 px-6">
        <Link href={`/dashboard?tenant=${cleanDomain}`} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/30 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <span className="text-sm font-bold tracking-tight dark:text-white text-slate-900 block leading-none truncate max-w-[155px]">
              {brandingName}
            </span>
            <span className="text-[10px] tracking-wider dark:text-zinc-400 text-slate-500 uppercase font-mono">
              Concierge OS
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Management group */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            Management
          </div>
          <NavGroup items={mgmtNavItems} pathname={pathname} tenantDomain={cleanDomain} />
        </div>

        {/* CMS group */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            Website CMS
          </div>
          <NavGroup items={cmsNavItems} pathname={pathname} tenantDomain={cleanDomain} />
        </div>

        {/* Public Storefront Link */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            Public Portal
          </div>
          <div className="space-y-1">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium dark:text-zinc-400 text-slate-600 dark:hover:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:text-white hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 dark:text-zinc-400 text-slate-500 group-hover:text-primary" />
                <span>View Storefront</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded dark:bg-white/[0.05] bg-slate-100 dark:text-zinc-400 text-slate-600 border dark:border-white/[0.08] border-slate-200">
                Live
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Tenancy & User Footer */}
      <div className="border-t dark:border-white/[0.08] border-slate-200 p-4">
        {/* Isolation Schema Tag */}
        <div className="mb-3 flex items-center justify-between rounded-md dark:bg-white/[0.03] bg-slate-100/80 px-2.5 py-1.5 border dark:border-white/[0.05] border-slate-200 text-[11px]">
          <span className="dark:text-zinc-500 text-slate-500 font-mono">Schema:</span>
          <span className="font-mono text-emerald-500 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {`tenant_${cleanDomain.split(".")[0]}`}
          </span>
        </div>

        {/* User profile row */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-semibold dark:text-white text-slate-900">
                {`${displayUser.first_name} ${displayUser.last_name}`}
              </p>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize font-medium">
                {role || "owner"}
              </span>
            </div>
            <p className="truncate text-[11px] dark:text-zinc-500 text-slate-500 font-mono mt-0.5">
              {displayUser.email}
            </p>
          </div>
          <button
            onClick={() => logout("/")}
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-md border dark:border-white/[0.08] border-slate-200 dark:text-zinc-400 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

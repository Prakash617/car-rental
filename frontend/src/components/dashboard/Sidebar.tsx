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
    label: "Reservations",
    href: "/dashboard/bookings",
    icon: CalendarCheck,
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
}: {
  items: typeof mgmtNavItems;
  pathname: string;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.08]"
                : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-zinc-400 group-hover:text-white"
                )}
              />
              <span>{item.label}</span>
            </div>
            {isActive && (
              <ChevronRight className="h-3.5 w-3.5 text-primary opacity-80" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout, tenantDomain } = useAuth();

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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.08] bg-zinc-950/90 backdrop-blur-2xl md:flex">
      {/* Platform Branding Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <span className="text-sm font-bold tracking-tight text-white block leading-none truncate max-w-[155px]">
              {brandingName}
            </span>
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-mono">
              Concierge OS
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Management group */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Management
          </div>
          <NavGroup items={mgmtNavItems} pathname={pathname} />
        </div>

        {/* CMS group */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Website CMS
          </div>
          <NavGroup items={cmsNavItems} pathname={pathname} />
        </div>

        {/* Public Storefront Link */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Public Portal
          </div>
          <div className="space-y-1">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/[0.03] hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                <span>View Storefront</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                Live
              </span>
            </a>
          </div>
        </div>

        {/* Client Portal Shortcuts */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Client Portal & Services
          </div>
          <div className="space-y-1">
            <Link
              href="/client"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/[0.03] hover:text-white transition-colors"
            >
              <User className="h-4 w-4 text-zinc-400" />
              <span>Profile & Bookings</span>
            </Link>
            <Link
              href="/search?trip_type=tour"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/[0.03] hover:text-white transition-colors"
            >
              <Users className="h-4 w-4 text-zinc-400" />
              <span>Carpool & Tours</span>
            </Link>
            <Link
              href="/list-your-car"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/[0.03] hover:text-white transition-colors"
            >
              <Car className="h-4 w-4 text-zinc-400" />
              <span>Host Your Vehicle</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/[0.03] hover:text-white transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-zinc-400" />
              <span>Inquiries & Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tenancy & User Footer */}
      <div className="border-t border-white/[0.08] p-4">
        {/* Isolation Schema Tag */}
        <div className="mb-3 flex items-center justify-between rounded-md bg-white/[0.03] px-2.5 py-1.5 border border-white/[0.05] text-[11px]">
          <span className="text-zinc-500 font-mono">Schema:</span>
          <span className="font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {tenantDomain ? `tenant_${tenantDomain.split(".")[0]}` : "tenant_apex"}
          </span>
        </div>

        {/* User profile row */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-semibold text-white">
                {user ? `${user.first_name} ${user.last_name}` : "Julian Vane"}
              </p>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize font-medium">
                {role || "owner"}
              </span>
            </div>
            <p className="truncate text-[11px] text-zinc-500 font-mono mt-0.5">
              {user?.email || "concierge@apex-fleet.com"}
            </p>
          </div>
          <button
            onClick={() => logout("/")}
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

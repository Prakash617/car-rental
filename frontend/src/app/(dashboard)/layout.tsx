"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { BrandingProvider } from "@/lib/context/branding";
import { TenantBranding } from "@/types";
import { apiFetch } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

const FALLBACK_BRANDING: TenantBranding = {
  name: "Apex Luxury Concierge",
  logo_url: "",
  primary_color: "#D4AF37",
  accent_color: "#F59E0B",
  font_heading: "serif",
  currency: "USD",
  timezone: "UTC",
  active_theme: "luxury",
  hero_title: "Automotive Mobility",
  hero_subtitle: "Concierge Fleet Operations",
  support_phone: "+1 (800) 555-0199",
  support_email: "concierge@apex.localhost",
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, tenantDomain } = useAuth();
  const [branding, setBranding] = useState<TenantBranding>(FALLBACK_BRANDING);

  // Dynamically load the current tenant's branding & website CMS configuration
  useEffect(() => {
    apiFetch<TenantBranding>("/website/config/")
      .then((data) => {
        if (data && data.name) {
          setBranding((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        if (tenantDomain) {
          const cleanSub = tenantDomain.split(".")[0];
          const name = cleanSub.charAt(0).toUpperCase() + cleanSub.slice(1) + " Fleet";
          setBranding((prev) => ({ ...prev, name }));
        }
      });
  }, [isAuthenticated, tenantDomain]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080D] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        <span className="text-xs font-mono text-zinc-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <BrandingProvider branding={branding}>
      <div
        className="min-h-screen bg-black text-zinc-100 antialiased font-sans selection:bg-primary/30"
        style={
          {
            "--brand-primary": branding.primary_color,
            "--brand-accent": branding.accent_color,
          } as React.CSSProperties
        }
      >
        <Sidebar />
        <div className="flex flex-col md:pl-64">
          <Topbar />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </BrandingProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const cleanHost = host.split(":")[0].toLowerCase();
      // Tenant subdomains (*.localhost) are reserved solely for the public customer website.
      // Dashboard operations belong exclusively on http://localhost:3000/dashboard.
      if (
        cleanHost.endsWith(".localhost") &&
        cleanHost !== "localhost" &&
        cleanHost !== "admin.localhost"
      ) {
        setIsRedirecting(true);
        try {
          const stored = localStorage.getItem("apex_saas_auth_session");
          if (stored) {
            const session = JSON.parse(stored);
            if (!session.tenant_domain) {
              session.tenant_domain = cleanHost;
              localStorage.setItem("apex_saas_auth_session", JSON.stringify(session));
            }
          }
        } catch {}

        const searchParams = new URLSearchParams(window.location.search);
        if (!searchParams.has("tenant")) {
          searchParams.set("tenant", cleanHost);
        }
        const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
        window.location.replace(`http://localhost:3000${window.location.pathname}${searchStr}`);
      }
    }
  }, []);

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#07080D] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        <span className="text-xs font-mono text-zinc-400">
          Redirecting to operations dashboard...
        </span>
      </div>
    );
  }

  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

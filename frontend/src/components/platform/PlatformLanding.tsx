"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  Sparkles,
  Server,
  Database,
  ArrowRight,
  Layers,
  ChevronRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PlatformLanding() {
  const [activeTab, setActiveTab] = useState<"architecture" | "tenants">("architecture");

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Platform Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#07090E]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                FLEETCORE
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Platform
                </span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400 block">
                Multi-Tenant Car Rental Cloud
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-300">
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#workspaces" className="hover:text-white transition-colors">
              Live Workspaces
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login?mode=create">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/25 px-4 py-2"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(147,51,234,0.18),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_70%,#07090E_100%)]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 backdrop-blur-md text-purple-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PostgreSQL Schema-Isolated SaaS Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            The Cloud Operating System for{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Luxury Automotive Fleets
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Powering independent car rental enterprises with automated schema isolation, dynamic
            bespoke storefront themes, fleet telemetry, and white-glove concierge management.
          </p>

          {/* Hero CTAs */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link href="/login?mode=create">
              <Button
                size="lg"
                className="px-8 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wider uppercase shadow-xl shadow-purple-600/30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>

          {/* Quick Workspaces Dock */}
          <div id="workspaces" className="pt-6 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
              <p className="text-xs font-mono uppercase text-zinc-400 mb-3 tracking-wider">
                Explore Live Environments Right Now:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Tenant Storefront */}
                <a
                  href="http://apex.localhost:3000/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-amber-400 mb-1.5">
                      <span className="text-xs font-bold font-mono">apex.localhost:3000</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </div>
                    <p className="text-xs font-semibold text-white">Apex Tenant Storefront</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Customer car rental booking UI</p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 mt-3 flex items-center gap-1">
                    Open Storefront <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>

                {/* 2. Operations Dashboard */}
                <Link
                  href="/dashboard"
                  className="group p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-blue-400 mb-1.5">
                      <span className="text-xs font-bold font-mono">localhost:3000/dashboard</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </div>
                    <p className="text-xs font-semibold text-white">Operations Dashboard</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Unified portal for all tenants & staff</p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 mt-3 flex items-center gap-1">
                    Open Dashboard <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>

                {/* 3. Platform Super-Admin */}
                <a
                  href="http://admin.localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3.5 rounded-xl bg-black/40 border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-purple-400 mb-1.5">
                      <span className="text-xs font-bold font-mono">admin.localhost:3000</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </div>
                    <p className="text-xs font-semibold text-white">Superuser Admin Portal</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Cross-tenant overview & master control</p>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 mt-3 flex items-center gap-1">
                    Open Superuser Console <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Multi-Tenancy Architecture Breakdown */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] bg-black/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
              True Tenant Isolation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              PostgreSQL Schema Multi-Tenancy
            </h2>
            <p className="text-sm text-zinc-400">
              Unlike weak row-level filtering, each tenant receives an isolated PostgreSQL schema,
              guaranteeing zero data leakage between competing car rental enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Public Schema */}
            <Card className="border-purple-500/20 bg-purple-950/10 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Public Schema (Global Platform)</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Host: <code className="text-purple-300 font-mono">localhost:3000</code>
                </p>
                <ul className="text-xs text-zinc-400 space-y-2 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Global tenant registry & subscriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Cross-tenant domain & SSL router
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Platform superusers & billing audit
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Card 2: Tenant Apex */}
            <Card className="border-amber-500/20 bg-amber-950/10 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Tenant Schema (tenant_apex)</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Subdomain: <code className="text-amber-300 font-mono">apex.localhost:3000</code>
                </p>
                <ul className="text-xs text-zinc-400 space-y-2 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Dedicated fleet inventory & telemetry
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Private customer ledger & reservations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Luxury Concierge theme & visual CMS
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Card 3: Dynamic Tenants */}
            <Card className="border-blue-500/20 bg-blue-950/10 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Dynamic Tenants (tenant_xyz)</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Subdomain: <code className="text-blue-300 font-mono">[company].localhost</code>
                </p>
                <ul className="text-xs text-zinc-400 space-y-2 pt-2 border-t border-white/[0.06]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    1-Click tenant provisioner
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    Independent theme: modern, urban, adventure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    Custom domain binding with auto-SSL
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
              Engineered Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Enterprise Mobility Suite
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Multi-Theme Engine",
                desc: "6 bespoke luxury themes: Luxury Concierge, Modern Mobility, Heritage Classic, All-Terrain Adventure, Urban Pulse, Pure Minimal.",
              },
              {
                title: "Visual CMS & Pages",
                desc: "Real-time branding customizer, live Google SERP preview, storefront FAQs, and custom Markdown policy pages.",
              },
              {
                title: "Fleet Telemetry",
                desc: "Odometer synchronization, fuel level tracking, automated service intervals, and check-in inspection reports.",
              },
              {
                title: "Dynamic Pricing",
                desc: "Seasonal rate multipliers, weekend surcharges, coupon redemption, and extra addons calculation.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-white/[0.06] space-y-2.5"
              >
                <div className="text-purple-400 text-xs font-mono">0{i + 1}</div>
                <h4 className="text-base font-semibold text-white">{f.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Footer */}
      <footer className="mt-auto border-t border-white/[0.08] py-12 px-4 sm:px-6 lg:px-8 bg-[#05060A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              F
            </div>
            <span className="font-semibold text-zinc-400">FleetCore SaaS Platform</span>
            <span>&middot;</span>
            <span>Schema Isolation Enabled</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/platform" className="hover:text-purple-400 transition-colors">
              Platform Super-Admin
            </Link>
            <a
              href="http://apex.localhost:3000/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              Demo Storefront (apex.localhost)
            </a>
            <Link
              href="/dashboard"
              className="hover:text-blue-400 transition-colors"
            >
              Operations Dashboard (localhost:3000/dashboard)
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

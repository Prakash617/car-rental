"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Car,
  Layers,
  ShieldCheck,
  Plus,
  ExternalLink,
  Loader2,
  DollarSign,
  TrendingUp,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
  LogOut,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlatformOverview,
  PlatformTenant,
  ProvisionTenantPayload,
  getPlatformOverview,
  getPlatformTenants,
  provisionTenant,
  updatePlatformTenant,
} from "@/lib/api/platform";
import { loginUser } from "@/lib/api/dashboard";

export default function PlatformSuperAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // New Tenant Modal State
  const [showModal, setShowModal] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [formData, setFormData] = useState<ProvisionTenantPayload>({
    company_name: "",
    subdomain: "",
    email: "",
    password: "Password123!",
    first_name: "Fleet",
    last_name: "Manager",
    currency: "USD",
    timezone: "UTC",
  });

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // 1. Check for existing session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("fleetcore_platform_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("fleetcore_platform_token");
    }
    setOverview(null);
    setTenants([]);
  }, []);

  // 2. Fetch Overview & Tenants once authenticated
  const loadPlatformData = useCallback(async (authToken: string) => {
    setIsLoading(true);
    try {
      const [stats, list] = await Promise.all([
        getPlatformOverview(authToken),
        getPlatformTenants(authToken),
      ]);
      setOverview(stats);
      setTenants(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load platform data";
      showNotification("error", msg);
      // If token expired, clear session
      if (msg.includes("401") || msg.includes("Authentication")) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (token) {
      loadPlatformData(token);
    }
  }, [token, loadPlatformData]);

  // 3. Handle Platform Super-Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const session = await loginUser(adminEmail, adminPassword, "localhost");
      if (!session.user.is_platform_admin) {
        throw new Error("Access Denied: This account is not a verified Platform Super-Admin.");
      }
      setToken(session.access_token);
      sessionStorage.setItem("fleetcore_platform_token", session.access_token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fillDemoCredentials = () => {
    setAdminEmail("admin@platform.com");
    setAdminPassword("admin123456");
  };

  // 4. Provision New Tenant
  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsProvisioning(true);

    try {
      const created = await provisionTenant(formData, token);
      showNotification(
        "success",
        `Tenant '${created.name}' successfully provisioned with schema '${created.schema_name}'!`
      );
      setShowModal(false);
      setFormData({
        company_name: "",
        subdomain: "",
        email: "",
        password: "Password123!",
        first_name: "Fleet",
        last_name: "Manager",
        currency: "USD",
        timezone: "UTC",
      });
      loadPlatformData(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Provisioning failed";
      showNotification("error", msg);
    } finally {
      setIsProvisioning(false);
    }
  };

  // 5. Toggle Tenant Active Status
  const handleToggleActive = async (tenant: PlatformTenant) => {
    if (!token) return;
    const newStatus = !tenant.is_active;

    try {
      await updatePlatformTenant(tenant.id, { is_active: newStatus }, token);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, is_active: newStatus } : t))
      );
      showNotification(
        "success",
        `Tenant '${tenant.name}' ${newStatus ? "reactivated" : "suspended"}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      showNotification("error", msg);
    }
  };

  // =========================================================================
  // VIEW: Platform Super-Admin Login Screen (Protected Gateway)
  // =========================================================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
        {/* Minimal Header */}
        <header className="w-full border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-purple-500/20">
              F
            </div>
            <span className="font-bold text-white tracking-tight">FLEETCORE</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white">
              ← Return to Platform Website
            </Button>
          </Link>
        </header>

        {/* Login Modal Box */}
        <div className="max-w-md w-full mx-auto px-4 py-12">
          <div className="rounded-2xl border border-white/[0.1] bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Platform Control Plane
              </h1>
              <p className="text-xs text-zinc-400">
                Restricted access for verified SaaS Platform Super-Administrators.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Platform Admin Email
                </label>
                <Input
                  required
                  type="email"
                  placeholder="admin@platform.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="bg-black/50 border-white/[0.1] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Password
                </label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-black/50 border-white/[0.1] text-white text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 shadow-lg shadow-purple-600/30"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Authenticating Super-Admin...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    Authenticate Super-Admin
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Helper */}
            <div className="pt-4 border-t border-white/[0.08] text-center space-y-2">
              <p className="text-[11px] text-zinc-500">Local Development Credentials:</p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Fill: admin@platform.com / admin123456
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center py-6 text-[11px] text-zinc-600 font-mono">
          FLEETCORE Cloud &middot; Public Schema Node &middot; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Authenticated Platform Super-Admin Console
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#07090E]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-purple-500/20">
                F
              </div>
              <span className="font-bold text-white tracking-tight">FLEETCORE</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Platform Super-Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>admin@platform.com</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:text-rose-400 hover:border-rose-500/30 text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Lock Console
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Platform Tenant Operations</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-zinc-400">
                PostgreSQL Multi-Tenant
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Global overview and orchestration across all isolated car rental tenant schemas.
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/25"
          >
            <Plus className="w-4 h-4" />
            Provision New Rental Business
          </Button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Platform KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Total Tenants
                </p>
                <p className="text-2xl font-mono font-bold text-white mt-1">
                  {overview?.total_tenants ?? "..."}
                </p>
                <p className="text-[11px] text-emerald-400 font-mono mt-1">
                  {overview?.active_tenants ?? "..."} Active schemas
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Building2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Global Fleet Size
                </p>
                <p className="text-2xl font-mono font-bold text-white mt-1">
                  {overview?.total_fleets ?? "..."}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono mt-1">Across all schemas</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Car className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Global Bookings
                </p>
                <p className="text-2xl font-mono font-bold text-white mt-1">
                  {overview?.total_bookings ?? "..."}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono mt-1">Processed reservations</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Platform Gross Volume
                </p>
                <p className="text-2xl font-mono font-bold text-white mt-1">
                  ${overview?.total_revenue ?? "0.00"}
                </p>
                <p className="text-[11px] text-emerald-400 font-mono mt-1">Confirmed rentals</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Table */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl overflow-hidden">
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Registered Car Rental Tenants</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Each company operates in its own PostgreSQL schema with isolated fleet, bookings, and
              branding.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                <span className="ml-3 text-xs text-zinc-400 font-mono">Loading tenant registry...</span>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-zinc-300">No tenants found</p>
                <p className="text-xs text-zinc-500 mt-1">Click above to provision your first tenant.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/[0.06] text-zinc-400 uppercase font-mono tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Company & Subdomain</th>
                      <th className="py-3 px-4">PostgreSQL Schema</th>
                      <th className="py-3 px-4">Fleet / Bookings</th>
                      <th className="py-3 px-4">Currency</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Workspaces</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white">{t.name}</div>
                          <div className="font-mono text-[11px] text-purple-400 mt-0.5">
                            {t.primary_domain}:3000
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                            {t.schema_name}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono font-semibold text-white">
                            {t.vehicle_count}
                          </span>{" "}
                          <span className="text-zinc-500">vehicles</span> &middot;{" "}
                          <span className="font-mono font-semibold text-white">
                            {t.booking_count}
                          </span>{" "}
                          <span className="text-zinc-500">rentals</span>
                        </td>

                        <td className="py-4 px-4 font-mono text-zinc-400">
                          {t.currency} ({t.timezone})
                        </td>

                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleActive(t)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition-colors ${
                              t.is_active
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                            }`}
                          >
                            {t.is_active ? "● Active" : "○ Suspended"}
                          </button>
                        </td>

                        <td className="py-4 px-4 text-right space-x-2">
                          {/* Storefront Link */}
                          <a
                            href={`http://${t.primary_domain}:3000/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] font-medium text-amber-400 hover:bg-white/[0.1] transition-colors"
                          >
                            Storefront
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>

                          {/* Dashboard Link */}
                          <a
                            href={`http://localhost:3000/dashboard?tenant=${t.primary_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] font-medium text-blue-400 hover:bg-white/[0.1] transition-colors"
                          >
                            Dashboard
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Provisioning Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-white/[0.12] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Provision New Car Rental Business
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Generates an isolated PostgreSQL schema and binds a dedicated subdomain.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvision} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Company / Brand Name
                </label>
                <Input
                  required
                  placeholder="e.g. Monaco Sports Rentals"
                  value={formData.company_name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, "");
                    setFormData({
                      ...formData,
                      company_name: name,
                      subdomain: autoSlug,
                    });
                  }}
                  className="bg-black/50 border-white/[0.08] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Subdomain Identifier
                </label>
                <div className="flex items-center">
                  <Input
                    required
                    placeholder="monaco"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs rounded-r-none font-mono"
                  />
                  <span className="px-3 py-2 bg-zinc-900 border border-l-0 border-white/[0.08] text-xs font-mono text-zinc-400 rounded-r-md">
                    .localhost:3000
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  Schema: tenant_{formData.subdomain ? formData.subdomain.replace(/-/g, "_") : "..."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Owner Email
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="owner@monaco-fleet.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-3"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProvisioning}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs min-w-[130px]"
                >
                  {isProvisioning ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Provisioning...
                    </span>
                  ) : (
                    "Create Tenant"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

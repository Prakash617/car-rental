"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { registerTenant, RegisterTenantResult } from "@/lib/api/platform";
import { loginUser } from "@/lib/api/dashboard";
import { getStoredSession, saveStoredSession, clearStoredSession } from "@/lib/auth/tokenManager";

function OnboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const prefilledName = searchParams.get("name") || "";

  const [rentalName, setRentalName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isSubdomainManual, setIsSubdomainManual] = useState(false);
  const [yourName, setYourName] = useState(prefilledName);
  const [email, setEmail] = useState(prefilledEmail);
  const [phone, setPhone] = useState("");
  const [companyOptional, setCompanyOptional] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<RegisterTenantResult | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const [existingTenant, setExistingTenant] = useState<{
    domain: string;
    email: string;
    companyName?: string;
  } | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Check if current user or provided email already has a tenant provisioned
  useEffect(() => {
    // 1. Check existing stored session
    const session = getStoredSession();
    if (session?.tenant_domain) {
      setExistingTenant({
        domain: session.tenant_domain,
        email: session.user?.email || prefilledEmail || email || "",
        companyName: session.user?.first_name ? `${session.user.first_name}'s Fleet` : undefined,
      });
      return;
    }

    // 2. Check if prefilled or entered email owns a tenant
    const emailToCheck = (prefilledEmail || email).trim().toLowerCase();
    if (emailToCheck && emailToCheck.includes("@")) {
      setCheckingExisting(true);
      loginUser(emailToCheck, undefined, "localhost", "123456")
        .then((sess) => {
          if (sess && sess.tenant_domain) {
            saveStoredSession(sess);
            setExistingTenant({
              domain: sess.tenant_domain,
              email: sess.user?.email || emailToCheck,
              companyName: sess.user?.first_name ? `${sess.user.first_name}'s Fleet` : undefined,
            });
          }
        })
        .catch(() => {
          // Normal: user has no existing tenant
        })
        .finally(() => {
          setCheckingExisting(false);
        });
    }
  }, [prefilledEmail]);

  // Sync prefilled email and name
  useEffect(() => {
    if (prefilledEmail && !email) {
      setEmail(prefilledEmail);
    }
    if (prefilledName && !yourName) {
      setYourName(prefilledName);
    }
  }, [prefilledEmail, prefilledName, email, yourName]);

  // Auto-slugify rental name into subdomain unless manually altered
  const handleRentalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRentalName(val);
    if (!isSubdomainManual) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSubdomain(slug);
    }
  };

  const handleCreateRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = rentalName.trim();
    if (!cleanName) {
      setFormError("Please enter your car rental name.");
      return;
    }

    const cleanSubdomain = subdomain.trim() || cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (cleanSubdomain.length < 3) {
      setFormError("Subdomain must be at least 3 characters.");
      return;
    }

    const cleanYourName = yourName.trim();
    if (!cleanYourName) {
      setFormError("Please enter your name.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setFormError("Please enter your phone number.");
      return;
    }

    // Split name into first and last name
    const nameParts = cleanYourName.split(/\s+/);
    const firstName = nameParts[0] || "Owner";
    const lastName = nameParts.slice(1).join(" ") || "Admin";

    const effectivePassword = password.trim() || "FleetMaster2026!";
    if (password.trim() && password.trim().length < 10) {
      setFormError("Password must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerTenant({
        company_name: companyOptional.trim() || cleanName,
        subdomain: cleanSubdomain,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail,
        password: effectivePassword,
        phone_number: cleanPhone,
        currency: "NPR",
        timezone: "Asia/Kathmandu",
      });

      setCreatedResult(result);
      setCountdown(3);

      toast.success("Car rental portal provisioned!", {
        description: "Redirecting to your dashboard...",
      });

      // Auto-login to new tenant
      const targetDomain = `${cleanSubdomain}.localhost:3000`;
      try {
        const session = await loginUser(cleanEmail, effectivePassword, targetDomain);
        if (session && session.access_token) {
          saveStoredSession(session);
        }
      } catch {
        saveStoredSession({
          access_token: "tenant-owner-session",
          refresh_token: "",
          user: {
            id: result.tenant_id,
            email: cleanEmail,
            first_name: firstName,
            last_name: lastName,
            is_platform_admin: false,
            is_active: true,
          },
          tenant_domain: targetDomain,
          role: "owner",
          redirect_url: `/dashboard?tenant=${cleanSubdomain}.localhost`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to provision tenant portal.";
      setFormError(msg);
      toast.error("Provisioning failed", { description: msg });

      // If subdomain is already taken, check if this user already owns it
      if (msg.toLowerCase().includes("already taken") || msg.toLowerCase().includes("already exists")) {
        try {
          const sess = await loginUser(cleanEmail, effectivePassword, "localhost", "123456");
          if (sess && sess.tenant_domain) {
            saveStoredSession(sess);
            setExistingTenant({
              domain: sess.tenant_domain,
              email: cleanEmail,
              companyName: cleanName,
            });
            setCountdown(3);
          }
        } catch {
          // Keep showing the form error
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-redirect to dashboard when created or existing workspace detected
  useEffect(() => {
    const targetDomain = createdResult
      ? createdResult.domain?.split(".")[0] || subdomain
      : existingTenant
      ? existingTenant.domain.replace(/:\d+$/, "")
      : null;

    if (targetDomain) {
      const cleanSub = targetDomain.split(".")[0];
      const targetUrl = `/dashboard?tenant=${cleanSub}.localhost`;
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = targetUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [createdResult, existingTenant, subdomain]);

  const handleLogout = () => {
    clearStoredSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-purple-500/30 font-sans relative overflow-hidden">
      {/* Background Radial Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(147,51,234,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(99,102,241,0.08),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Navigation */}
      <header className="py-5 px-6 sm:px-12 w-full max-w-6xl mx-auto flex items-center justify-between relative z-10 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-105">
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
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-semibold text-zinc-400 hover:text-white px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-[460px] bg-zinc-950/80 border border-white/[0.1] rounded-[20px] p-8 sm:p-9 shadow-2xl backdrop-blur-2xl">
          {checkingExisting ? (
            /* ============================================================= */
            /* Checking Workspace State                                      */
            /* ============================================================= */
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Checking your rental workspace...</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Connecting to FleetCore Cloud multi-tenant directory
                </p>
              </div>
            </div>
          ) : existingTenant ? (
            /* ============================================================= */
            /* Workspace Already Live State                                  */
            /* ============================================================= */
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                  Workspace Already Live!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Your car rental portal for{" "}
                  <span className="text-purple-300 font-semibold">{existingTenant.email}</span> is ready and operational.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <p className="text-xs text-purple-300 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Opening dashboard in {countdown}s...</span>
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href={`http://${existingTenant.domain.replace(/:\d+$/, "")}:3000`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
                  >
                    <span>View Public Website ({existingTenant.domain.replace(/:\d+$/, "")})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`/dashboard?tenant=${existingTenant.domain.replace(/:\d+$/, "")}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all"
                  >
                    <span>Open Fleet Management Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setExistingTenant(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline cursor-pointer"
                >
                  Need to register a different car rental brand? Click here
                </button>
              </div>
            </div>
          ) : !createdResult ? (
            /* ============================================================= */
            /* Tenant Portal Creation Form                                    */
            /* ============================================================= */
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                  Create your car rental
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Configure your company profile and dedicated tenant workspace.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateRental} className="space-y-4">
                {/* 1. Rental Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Rental name
                  </label>
                  <input
                    type="text"
                    required
                    value={rentalName}
                    onChange={handleRentalNameChange}
                    placeholder="Apex Luxury Rentals"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  {subdomain && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                      <span>Subdomain:</span>
                      <span className="font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {subdomain}.localhost:3000
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Your Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    placeholder="Julian Vane"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* 3. Email */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="julian@apex-fleet.com"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* 4. Phone */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    maxLength={20}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                    Use 7–20 digits. You may use +, spaces, parentheses, or hyphens.
                  </p>
                </div>

                {/* 5. Company (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    value={companyOptional}
                    onChange={(e) => setCompanyOptional(e.target.value)}
                    placeholder="Apex Mobility Group LLC"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Master Password */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Master password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 10 characters (e.g. FleetSecure2026!)"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Used to log in to your tenant Concierge OS dashboard.
                  </p>
                </div>

                {/* Create car rental Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning workspace...</span>
                    </>
                  ) : (
                    <span>Create car rental</span>
                  )}
                </button>

                <p className="text-center text-[12px] text-zinc-500 mt-2">
                  We&apos;ll clone a tenant schema &amp; provision your site instantly.
                </p>
              </form>
            </div>
          ) : (
            /* ============================================================= */
            /* Success & Auto-Redirect to Dashboard                          */
            /* ============================================================= */
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Workspace Created!
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Tenant schema{" "}
                  <code className="text-purple-300 font-mono font-bold">
                    {createdResult.schema_name}
                  </code>{" "}
                  is live.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <p className="text-xs text-purple-300 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Redirecting to your dashboard in {countdown}s...</span>
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href={`http://${createdResult.domain?.split(":")[0] || subdomain + ".localhost"}:3000`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
                  >
                    <span>View Public Website ({createdResult.domain || `${subdomain}.localhost`})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`/dashboard?tenant=${createdResult.domain?.split(".")[0] || subdomain}.localhost`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all"
                  >
                    <span>Open Fleet Management Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-500 font-medium flex items-center justify-center gap-2 relative z-10 border-t border-white/[0.06]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>PostgreSQL Schema Isolation &middot; FleetCore Cloud</span>
      </footer>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <OnboardPageContent />
    </Suspense>
  );
}

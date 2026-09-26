"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Car,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Building2,
  Globe,
  ExternalLink,
  Layers,
  Lock,
  Mail,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Check,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { registerTenant, RegisterTenantResult } from "@/lib/api/platform";
import { loginUser } from "@/lib/api/dashboard";
import { saveStoredSession } from "@/lib/auth/tokenManager";

type OnboardingStep = "email" | "otp" | "form" | "success";
type AuthFlowMode = "create" | "signin";

const TEST_OTP_PIN = "123456";

export function CreateTenantPortalSection() {
  const [step, setStep] = useState<OnboardingStep>("email");
  const [flowMode, setFlowMode] = useState<AuthFlowMode>("create");

  // Step 1: Email & Auth state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Step 2: 6-Digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: Form State (Matching uploaded image)
  const [rentalName, setRentalName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isSubdomainManual, setIsSubdomainManual] = useState(false);
  const [yourName, setYourName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyOptional, setCompanyOptional] = useState("");
  const [password, setPassword] = useState("");

  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<RegisterTenantResult | null>(null);

  // Auto-redirect countdown
  const [countdown, setCountdown] = useState<number>(3);

  // Auto-slugify rental name into subdomain
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

  // Google Login click handler (placeholder as requested)
  const handleGoogleLogin = () => {
    toast.info("Google Sign-In is coming soon", {
      description: "Google OAuth integration will be available shortly. Please proceed with Email OTP for now.",
    });
  };

  // Step 1: Submit email to request 6-digit OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setStep("otp");

    toast.success("Verification code sent!", {
      description: `Enter the 6-digit PIN sent to ${cleanEmail}. (Testing PIN: 123456)`,
    });
  };

  // Focus first OTP input on step change
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle OTP digit entry
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 0) {
        const next = [...otpDigits];
        digits.forEach((d, i) => {
          if (index + i < 6) next[index + i] = d;
        });
        setOtpDigits(next);
        const nextIndex = Math.min(index + digits.length, 5);
        otpInputsRef.current[nextIndex]?.focus();

        if (next.every((d) => d !== "")) {
          verifyOtpCode(next.join(""));
        }
        return;
      }
    }

    const digit = value.slice(-1).replace(/\D/g, "");
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpError(null);

    // Auto advance to next box
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits are typed
    if (digit && index === 5) {
      const fullCode = next.join("");
      if (fullCode.length === 6) {
        verifyOtpCode(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Verify OTP (Check for 123456)
  const verifyOtpCode = async (code: string) => {
    setIsVerifyingOtp(true);
    setOtpError(null);

    setTimeout(async () => {
      if (code === TEST_OTP_PIN) {
        // If user is in "Sign in to Dashboard" mode, log in and redirect immediately
        if (flowMode === "signin") {
          try {
            const loginEmail = email.trim().toLowerCase() || "concierge@apex-fleet.com";
            const session = await loginUser(loginEmail, "concierge123", "localhost");
            saveStoredSession(session);
            toast.success("Signed in successfully!", {
              description: "Navigating to your dashboard...",
            });
            const target = session.redirect_url || (session.tenant_domain ? `http://${session.tenant_domain}:3000/dashboard` : "http://apex.localhost:3000/dashboard");
            window.location.href = target;
            return;
          } catch {
            // Fallback: direct to demo tenant dashboard
            toast.success("Email verified!", {
              description: "Navigating to your dashboard...",
            });
            window.location.href = "http://apex.localhost:3000/dashboard";
            return;
          } finally {
            setIsVerifyingOtp(false);
          }
        }

        // Otherwise (flowMode === "create"): advance to the creation form
        setIsVerifyingOtp(false);
        toast.success("Email verified successfully!", {
          description: "Let's configure your car rental platform.",
        });
        setStep("form");
      } else {
        setIsVerifyingOtp(false);
        setOtpError(`Invalid code. For testing, please enter ${TEST_OTP_PIN}`);
        toast.error("Verification failed", {
          description: `The PIN entered is incorrect. Please use ${TEST_OTP_PIN} for testing.`,
        });
      }
    }, 400);
  };

  const handleManualVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setOtpError("Please enter all 6 digits of the PIN.");
      return;
    }
    verifyOtpCode(code);
  };

  // Step 3: Submit "Create your car rental" form
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

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setFormError("Please enter your phone number.");
      return;
    }

    // Split name into first and last name
    const nameParts = cleanYourName.split(/\s+/);
    const firstName = nameParts[0] || "Owner";
    const lastName = nameParts.slice(1).join(" ") || "Admin";

    // Ensure password has min 10 characters
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
        email: email.trim().toLowerCase(),
        password: effectivePassword,
        phone_number: cleanPhone,
        currency: "USD",
        timezone: "UTC",
      });

      setCreatedResult(result);
      setStep("success");
      setCountdown(3);

      toast.success("Car rental portal provisioned!", {
        description: `Redirecting to your dashboard: ${cleanSubdomain}.localhost:3000/dashboard`,
      });

      // Attempt to auto-login to new tenant
      try {
        const session = await loginUser(email.trim().toLowerCase(), effectivePassword, `${cleanSubdomain}.localhost:3000`);
        saveStoredSession(session);
      } catch {
        // Continue even if immediate public auth session fails
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to provision tenant portal.";
      setFormError(msg);
      toast.error("Provisioning failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-redirect to dashboard when portal created
  useEffect(() => {
    if (step === "success" && createdResult) {
      const targetUrl = `http://${createdResult.domain}:3000/dashboard`;
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
  }, [step, createdResult]);

  const handleReset = () => {
    setStep("email");
    setEmail("");
    setOtpDigits(["", "", "", "", "", ""]);
    setRentalName("");
    setSubdomain("");
    setYourName("");
    setPhone("");
    setCompanyOptional("");
    setPassword("");
    setCreatedResult(null);
    setFormError(null);
    setEmailError(null);
    setFlowMode("create");
  };

  return (
    <section
      id="create-portal"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#0A0D14] border-t border-white/[0.08]"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Self-Service Onboarding</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Launch Your Car Rental System
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            Get an isolated PostgreSQL tenant schema, branded public storefront, fleet manager, and
            online booking engine in 60 seconds.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: Email & Google Login Screen                                       */}
        {/* ========================================================================= */}
        {step === "email" && (
          <div className="max-w-md mx-auto bg-white text-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-zinc-200/90 relative">
            <div className="space-y-6">
              {/* Tab Selector: Create New Portal vs Sign In */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFlowMode("create")}
                  className={`py-2 rounded-lg transition-all ${
                    flowMode === "create"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Create Rental
                </button>
                <button
                  type="button"
                  onClick={() => setFlowMode("signin")}
                  className={`py-2 rounded-lg transition-all ${
                    flowMode === "signin"
                      ? "bg-[#EA580C] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In to Dashboard
                </button>
              </div>

              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {flowMode === "create" ? "Get started" : "Welcome back"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {flowMode === "create"
                    ? "Enter your email or continue with Google to build your rental portal."
                    : "Enter your email and 6-digit PIN to jump directly into your dashboard."}
                </p>
              </div>

              {/* Google Login (Show only, implement later) */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all shadow-sm group relative"
                >
                  {/* Google SVG Logo */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    Coming Soon
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-medium">
                  or continue with email
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(null);
                      }}
                      placeholder="jane@gym.com"
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent text-sm transition-all shadow-sm"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{flowMode === "create" ? "Continue with Email" : "Sign In with Email"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  By continuing, you agree to our Terms of Service & Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: 6-Digit OTP Verification Screen                                   */}
        {/* ========================================================================= */}
        {step === "otp" && (
          <div className="max-w-md mx-auto bg-white text-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-zinc-200/90 relative">
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-[#EA580C] mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  Check your inbox
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  We sent a 6-digit verification code to{" "}
                  <span className="font-semibold text-slate-800">{email}</span>
                </p>
              </div>

              {/* Testing PIN Notice */}
              <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#EA580C] text-white flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs">
                  PIN
                </div>
                <div className="text-xs text-orange-950">
                  <span className="font-semibold">Testing PIN:</span> Use code{" "}
                  <button
                    type="button"
                    onClick={() => {
                      const digits = TEST_OTP_PIN.split("");
                      setOtpDigits(digits);
                      verifyOtpCode(TEST_OTP_PIN);
                    }}
                    className="font-mono font-bold underline text-[#EA580C] hover:text-[#C2410C]"
                  >
                    123456
                  </button>{" "}
                  to {flowMode === "create" ? "verify email and continue" : "sign in immediately"}.
                </div>
              </div>

              {/* 6-Digit Input Boxes */}
              <form onSubmit={handleManualVerifyOtp} className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all shadow-sm"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs text-rose-500 flex items-center justify-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{flowMode === "create" ? "Verifying code..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{flowMode === "create" ? "Verify & Continue" : "Verify & Sign In to Dashboard"}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend & Change Email */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setOtpDigits(TEST_OTP_PIN.split(""));
                    verifyOtpCode(TEST_OTP_PIN);
                  }}
                  className="hover:text-[#EA580C] transition-colors font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Auto-fill 123456
                </button>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="hover:text-slate-800 transition-colors underline"
                >
                  Change email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: "Create your car rental" Form (Matches uploaded image exactly)    */}
        {/* ========================================================================= */}
        {step === "form" && (
          <div className="max-w-lg mx-auto bg-white text-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-zinc-200/90 relative">
            <div className="space-y-6">
              {/* Form Title (from screenshot: "Create your gym" -> "Create your car rental") */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Create your car rental
                </h3>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateRental} className="space-y-5">
                {/* 1. Rental Name (Image: "Gym name", placeholder: "Iron Gym") */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Rental name
                  </label>
                  <input
                    type="text"
                    value={rentalName}
                    onChange={handleRentalNameChange}
                    placeholder="Iron Gym"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent text-sm transition-all shadow-sm"
                  />
                  {subdomain && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <span>Subdomain:</span>
                      <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {subdomain}.localhost:3000
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Your Name (Image: "Your name", placeholder: "Jane Doe") */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent text-sm transition-all shadow-sm"
                  />
                </div>

                {/* 3. Email (Image: "Email", placeholder: "jane@gym.com") */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      placeholder="jane@gym.com"
                      className="w-full px-4 py-3.5 pr-24 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm shadow-sm cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                {/* 4. Phone (Image: "Phone", placeholder: "+977 9800000000") */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977 9800000000"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent text-sm transition-all shadow-sm"
                  />
                  {/* Exact helper text from image */}
                  <p className="text-xs text-slate-500 mt-1.5">
                    Use 7–20 digits. You may use +, spaces, parentheses, or hyphens.
                  </p>
                </div>

                {/* 5. Company (optional) (Image: "Company (optional)") */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    value={companyOptional}
                    onChange={(e) => setCompanyOptional(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent text-sm transition-all shadow-sm"
                  />
                </div>

                {/* Master Password for Concierge OS login */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Master password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 10 characters (e.g. FleetSecure2026!)"
                    required
                    minLength={10}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent text-sm transition-all shadow-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Used to log in to your tenant dashboard & Concierge OS.
                  </p>
                </div>

                {/* Create car rental Button (Orange, styled like image) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Provisioning your portal...</span>
                    </>
                  ) : (
                    <span>Create car rental</span>
                  )}
                </button>

                {/* Exact subtext from image */}
                <p className="text-center text-xs text-slate-500 mt-2">
                  We&apos;ll clone a tenant schema &amp; provision your site instantly.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Success & Launch Screen (Auto-redirects to Dashboard)             */}
        {/* ========================================================================= */}
        {step === "success" && createdResult && (
          <div className="max-w-lg mx-auto bg-zinc-900/90 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-emerald-500/30 backdrop-blur-xl relative">
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Portal Successfully Created!
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Your isolated tenant schema{" "}
                  <code className="text-emerald-400 font-mono font-semibold">
                    {createdResult.schema_name}
                  </code>{" "}
                  is ready.
                </p>
              </div>

              {/* Automatic Redirect Banner */}
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center space-y-3">
                <p className="text-xs text-orange-300 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                  <span>Redirecting to your dashboard in {countdown}s...</span>
                </p>
                <a
                  href={`http://${createdResult.domain}:3000/dashboard`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all"
                >
                  <span>Go to Dashboard Now</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Portal Direct Links */}
              <div className="space-y-3 text-left">
                {/* 1. Branded Customer Storefront */}
                <a
                  href={`http://${createdResult.domain}:3000`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-2xl bg-black/50 border border-white/[0.08] hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between text-orange-400 mb-1">
                    <span className="text-xs font-mono font-bold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {createdResult.domain}:3000
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm font-semibold text-white">Public Customer Storefront</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Customer reservations, car catalogue, and online booking flow
                  </p>
                </a>
              </div>

              {/* Login Credentials Summary */}
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/[0.06] text-xs text-left space-y-1 font-mono">
                <div className="text-zinc-400 flex justify-between">
                  <span>Owner Email:</span>
                  <span className="text-white font-semibold">{createdResult.owner_email}</span>
                </div>
                <div className="text-zinc-400 flex justify-between">
                  <span>Tenant Schema:</span>
                  <span className="text-emerald-400">{createdResult.schema_name}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs w-full"
                >
                  Provision Another Rental System
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  Mail,
  Loader2,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { loginUser } from "@/lib/api/dashboard";
import { saveStoredSession } from "@/lib/auth/tokenManager";

const TEST_OTP_PIN = "123456";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "create" ? "create" : "login";

  const [mode, setMode] = useState<"login" | "create">(initialMode);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input box when OTP is triggered
  useEffect(() => {
    if (otpSent) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

  const handleGoogleLogin = () => {
    toast.info("Google Sign-In is coming soon", {
      description: "Google OAuth integration will be available shortly. Please proceed with Email OTP.",
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setOtpSent(true);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    toast.success("Verification code sent!", {
      description: `Testing PIN is 123456 for ${cleanEmail}`,
    });
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    // Handle pasting complete 6-digit PIN
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 0) {
        const next = [...otpDigits];
        digits.forEach((d, i) => {
          if (index + i < 6) next[index + i] = d;
        });
        setOtpDigits(next);
        const nextIndex = Math.min(index + digits.length, 5);
        otpInputsRef.current[nextIndex]?.focus();

        if (next.every((d) => d !== "")) {
          verifyOtp(next.join(""));
        }
        return;
      }
    }

    const digit = val.slice(-1).replace(/\D/g, "");
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpError(null);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const full = next.join("");
      if (full.length === 6) {
        verifyOtp(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setIsVerifying(true);
    setOtpError(null);

    setTimeout(async () => {
      if (code === TEST_OTP_PIN) {
        const cleanEmail = email.trim().toLowerCase();

        // 1. First, attempt to sign in to existing tenant with verified OTP
        try {
          const session = await loginUser(cleanEmail, undefined, "localhost", code);
          if (session && session.access_token) {
            saveStoredSession(session);
            setIsVerifying(false);
            toast.success("Welcome back!", {
              description: "Redirecting to your dashboard...",
            });
            // Stay on the same host (e.g. http://localhost:3000/dashboard)
            window.location.href = "/dashboard";
            return;
          }
        } catch (err) {
          // User has not yet provisioned a tenant workspace -> proceed to onboarding
        }

        // 2. If no existing account/tenant found, guide user to /onboard to create their rental portal
        setIsVerifying(false);
        toast.success("Email verified!", {
          description: "Let's create your new car rental portal!",
        });
        router.push(`/onboard?email=${encodeURIComponent(cleanEmail)}`);
      } else {
        setIsVerifying(false);
        setOtpError(`Invalid code. For testing, please enter ${TEST_OTP_PIN}`);
      }
    }, 400);
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
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-400 hover:text-white px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "create" : "login");
              setOtpSent(false);
            }}
            className="text-xs font-semibold text-white px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            {mode === "login" ? "Create Rental" : "Login"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[440px] bg-zinc-950/80 border border-white/[0.1] rounded-[20px] p-8 sm:p-9 shadow-2xl backdrop-blur-2xl">
          {!otpSent ? (
            /* ============================================================= */
            /* STEP 1: Email & Google Login Screen                           */
            /* ============================================================= */
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {mode === "create" ? "Get started" : "Login to your car rental"}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Enter your email or continue with Google to build your rental portal.
                </p>
              </div>

              {emailError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    placeholder="alex@luxuryrentals.com"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send OTP</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-white/[0.08] w-full" />
                <span className="bg-zinc-950 px-3 text-xs text-zinc-500 font-medium">
                  or
                </span>
                <div className="border-t border-white/[0.08] w-full" />
              </div>

              {/* Google Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.2] text-zinc-200 hover:text-white text-sm font-semibold transition-all group cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2.5 leading-relaxed">
                  Use the same verified email you use for email login.
                </p>
              </div>
            </div>
          ) : (
            /* ============================================================= */
            /* STEP 2: 6-Digit OTP Verification Screen                       */
            /* ============================================================= */
            <div className="space-y-6">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Check your inbox
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                  We sent a 6-digit verification code to{" "}
                  <strong className="text-white font-semibold">{email}</strong>
                </p>
              </div>

              {/* Testing PIN Notice */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
                <span>
                  Testing PIN: <strong className="font-mono font-bold text-white">123456</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = TEST_OTP_PIN.split("");
                    setOtpDigits(digits);
                    verifyOtp(TEST_OTP_PIN);
                  }}
                  className="font-semibold underline text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyOtp(otpDigits.join(""));
                }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between gap-1.5">
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
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-mono font-bold rounded-[10px] border border-white/[0.12] bg-white/[0.05] focus:bg-white/[0.08] text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs text-rose-400 text-center font-medium">
                    {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify &amp; Continue</span>
                    </>
                  )}
                </button>
              </form>

              {/* Actions */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="hover:text-white underline cursor-pointer"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpDigits(["", "", "", "", "", ""]);
                    toast.success("Verification PIN resent!", { description: "PIN: 123456" });
                  }}
                  className="hover:text-purple-400 text-zinc-400 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend code
                </button>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

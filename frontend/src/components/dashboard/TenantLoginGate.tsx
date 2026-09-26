"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  KeyRound,
  Loader2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Car,
  Mail,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth/AuthContext";
import { loginUser } from "@/lib/api/dashboard";
import { saveStoredSession } from "@/lib/auth/tokenManager";

type AuthMode = "password" | "otp";

export function TenantLoginGate() {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("password");

  // Password Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP Login State
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const session = await login(email, password);
      toast.success("Welcome back!", {
        description: "Redirecting to your dashboard...",
      });
      const targetUrl = session?.redirect_url || "/dashboard";
      window.location.href = targetUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google Sign-In is coming soon", {
      description: "Google OAuth login will be available shortly. Please use email password or OTP.",
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setOtpSent(true);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    toast.success("Verification code sent!", {
      description: `Testing PIN is 123456 for ${cleanEmail}`,
    });
  };

  // Focus first input on OTP display
  useEffect(() => {
    if (otpSent && authMode === "otp") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [otpSent, authMode]);

  const handleOtpDigitChange = (index: number, val: string) => {
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
          verifyOtpAndLogin(next.join(""));
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
        verifyOtpAndLogin(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOtpAndLogin = async (code: string) => {
    setIsVerifyingOtp(true);
    setOtpError(null);

    setTimeout(async () => {
      if (code === "123456") {
        try {
          const targetEmail = email.trim() || "concierge@apex-fleet.com";
          const session = await loginUser(targetEmail, undefined, undefined, code);
          saveStoredSession(session);
          toast.success("Welcome back!", {
            description: "Redirecting to your dashboard...",
          });
          const targetUrl = session.redirect_url || "/dashboard";
          window.location.href = targetUrl;
        } catch {
          // Fallback login with demo credentials
          try {
            const session = await login("concierge@apex-fleet.com", "concierge123");
            toast.success("Welcome back!", {
              description: "Redirecting to your dashboard...",
            });
            const targetUrl = session?.redirect_url || "/dashboard";
            window.location.href = targetUrl;
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to sign in.";
            setOtpError(msg);
          }
        } finally {
          setIsVerifyingOtp(false);
        }
      } else {
        setIsVerifyingOtp(false);
        setOtpError("Invalid code. For testing, please enter 123456");
      }
    }, 400);
  };

  const fillDemoOwner = () => {
    setEmail("concierge@apex-fleet.com");
    setPassword("concierge123");
  };

  return (
    <div className="min-h-screen bg-[#07080D] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="w-full border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-black font-bold text-xs shadow-md shadow-amber-500/20">
            <Car className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="font-serif font-bold text-white text-sm tracking-wide">
              APEX CONCIERGE OS
            </span>
            <span className="text-[10px] text-zinc-500 block font-mono">
              PostgreSQL Schema-Isolated Tenant
            </span>
          </div>
        </div>

        <Link href="/">
          <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white">
            ← Return to Storefront
          </Button>
        </Link>
      </header>

      {/* Login Box */}
      <div className="max-w-md w-full mx-auto px-4 py-12">
        <div className="rounded-2xl border border-white/[0.1] bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold font-serif text-white tracking-tight">
              Tenant Staff Authentication
            </h1>
            <p className="text-xs text-zinc-400">
              Sign in to manage fleet inventory, reservations, and customer telemetry.
            </p>
          </div>

          {/* Google Sign In (Preview / Coming soon) */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium transition-all group"
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
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-400">
                Coming Soon
              </span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setErrorMsg(null);
              }}
              className={`py-1.5 rounded-lg transition-colors ${
                authMode === "password"
                  ? "bg-zinc-800 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setErrorMsg(null);
              }}
              className={`py-1.5 rounded-lg transition-colors ${
                authMode === "otp"
                  ? "bg-[#EA580C] text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Email OTP (123456)
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode 1: Password Form */}
          {authMode === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Staff Email Address
                </label>
                <Input
                  required
                  type="email"
                  placeholder="concierge@apex-fleet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-white/[0.1] text-white text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D4AF37] hover:bg-[#e2bd46] text-black font-semibold text-xs py-2.5 shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Verifying Credentials...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    Sign In to Concierge OS
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Mode 2: Email OTP Form */}
          {authMode === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Your Email Address
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="concierge@apex-fleet.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black/50 border-white/[0.1] text-white text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs py-2.5 shadow-lg shadow-orange-500/20"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      Send 6-Digit Code
                    </span>
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex items-center justify-between">
                    <span>
                      Testing PIN: <strong className="font-mono font-bold text-white">123456</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = "123456".split("");
                        setOtpDigits(digits);
                        verifyOtpAndLogin("123456");
                      }}
                      className="text-[11px] underline text-orange-400 hover:text-white"
                    >
                      Fill 123456
                    </button>
                  </div>

                  {/* 6 digits */}
                  <div className="flex items-center justify-between gap-1.5">
                    {otpDigits.map((d, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 text-center text-lg font-mono font-bold rounded-lg border border-white/[0.15] bg-black/60 text-white focus:outline-none focus:border-orange-500"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-xs text-rose-400 text-center font-medium">
                      {otpError}
                    </p>
                  )}

                  <Button
                    type="button"
                    disabled={isVerifyingOtp}
                    onClick={() => verifyOtpAndLogin(otpDigits.join(""))}
                    className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs py-2.5 shadow-lg shadow-orange-500/20"
                  >
                    {isVerifyingOtp ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Verifying Code...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" />
                        Verify &amp; Sign In
                      </span>
                    )}
                  </Button>

                  <div className="flex justify-between text-xs text-zinc-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:text-white underline text-[11px]"
                    >
                      ← Change email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpDigits(["", "", "", "", "", ""]);
                        toast.success("New code sent!", { description: "PIN: 123456" });
                      }}
                      className="hover:text-orange-400 flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Helper */}
          <div className="pt-4 border-t border-white/[0.08] text-center space-y-2">
            <p className="text-[11px] text-zinc-500">Quick Test Credentials:</p>
            <button
              type="button"
              onClick={fillDemoOwner}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D4AF37] hover:underline px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Fill: concierge@apex-fleet.com / concierge123
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center py-6 text-[11px] text-zinc-600 font-mono flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Schema-Level Security &middot; Apex Luxury Concierge</span>
      </footer>
    </div>
  );
}

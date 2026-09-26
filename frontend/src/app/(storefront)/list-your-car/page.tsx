"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  ShieldCheck,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
  Compass,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building2,
  UserCheck,
  Gauge,
  HelpCircle,
  Phone,
  Mail,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useBranding } from "@/lib/context/branding";
import { getThemeHeadingFont } from "@/lib/themes/registry";

interface VehicleTier {
  id: string;
  name: string;
  example: string;
  defaultDailyRate: number;
  image: string;
}

const VEHICLE_TIERS: VehicleTier[] = [
  {
    id: "exotic",
    name: "Exotic Supercar",
    example: "Ferrari 296 GTB / Lamborghini Huracán",
    defaultDailyRate: 1450,
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sports",
    name: "Track & Sports",
    example: "Porsche 911 GT3 RS / Mercedes-AMG GT",
    defaultDailyRate: 890,
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "suv",
    name: "Luxury Flagship SUV",
    example: "Range Rover SV / Mercedes-AMG G63",
    defaultDailyRate: 750,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "electric",
    name: "Executive EV / Sedan",
    example: "Tesla Model S Plaid / BMW i7",
    defaultDailyRate: 490,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
  },
];

const FAQS = [
  {
    q: "Who is allowed to rent and drive my consigned vehicle?",
    a: "Only vetted VIP guests, corporate executives, and verified high-net-worth clients are permitted keys. All drivers must be at least 28 years old, possess clean motor vehicle records with zero major violations, hold full personal collision coverage, and place a mandatory security deposit of $2,500 to $5,000 prior to departure.",
  },
  {
    q: "What insurance coverage protects my vehicle?",
    a: "Every rental is protected under Apex's $2,000,000 primary commercial liability and full comprehensive & collision policy backed by premier automotive underwriters. In the rare event of damage, your personal insurance is never contacted, and you pay $0 out of pocket.",
  },
  {
    q: "Can I use my vehicle whenever I want?",
    a: "Yes. As a vehicle owner/host, you enjoy unlimited personal driving days. Simply block out dates on your Host Portal with 48 hours notice, and your car will be detailed, fueled, and staged for you at our downtown concierge hub.",
  },
  {
    q: "How and when do I receive my earnings payout?",
    a: "Hosts receive 70% of gross rental revenue. Itemized earnings statements are generated at the end of each calendar month, and funds are automatically disbursed via direct ACH bank deposit on the 1st business day of every month.",
  },
  {
    q: "Where is my car stored when not rented?",
    a: "Your vehicle is stored in our private, climate-controlled concierge depot equipped with 24/7 armed biometric surveillance, dust covers, and trickle battery tendering. Vehicles are hand-washed and detailed before and after every outing.",
  },
  {
    q: "What are the eligibility requirements for vehicles?",
    a: "Vehicles must be model year 2020 or newer, possess a clean non-salvage title, have under 40,000 miles, and maintain an impeccable mechanical inspection history with factory-certified servicing.",
  },
];

export default function ListYourCarPage() {
  const branding = useBranding();
  const headingFont = getThemeHeadingFont(branding.active_theme);

  // Calculator State
  const [selectedTier, setSelectedTier] = useState<VehicleTier>(VEHICLE_TIERS[0]);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(10);
  const [customRate, setCustomRate] = useState<number>(selectedTier.defaultDailyRate);

  // Application Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{
    reference: string;
    brand: string;
    model: string;
    ownerName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phone: "",
    city: "Los Angeles / Beverly Hills",
    brand: "Ferrari",
    model: "296 GTB Assetto",
    year: 2024,
    vin: "",
    licensePlate: "",
    mileage: 4500,
    color: "Rosso Corsa",
    transmission: "automatic",
    fuelType: "hybrid",
    dailyRate: 1450,
    photoUrl: VEHICLE_TIERS[0].image,
    hasCleanTitle: true,
  });

  // Host Portal Status Lookup State
  const [lookupQuery, setLookupQuery] = useState("");
  const [showDemoPortal, setShowDemoPortal] = useState(false);

  // Calculations
  const effectiveDailyRate = customRate > 0 ? customRate : selectedTier.defaultDailyRate;
  const monthlyGross = effectiveDailyRate * daysPerMonth;
  const hostNetMonthly = Math.round(monthlyGross * 0.7);
  const apexFeeMonthly = Math.round(monthlyGross * 0.3);
  const hostAnnualEstimate = hostNetMonthly * 12;

  const handleSelectTier = (tier: VehicleTier) => {
    setSelectedTier(tier);
    setCustomRate(tier.defaultDailyRate);
    setFormData((prev) => ({
      ...prev,
      brand: tier.name.split(" ")[0],
      model: tier.example.split(" / ")[0],
      dailyRate: tier.defaultDailyRate,
      photoUrl: tier.image,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required owner contact fields.");
      return;
    }
    if (!formData.brand || !formData.model) {
      toast.error("Please specify your vehicle's make and model.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const refCode = `APX-HOST-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedApp({
      reference: refCode,
      brand: formData.brand,
      model: formData.model,
      ownerName: formData.ownerName,
    });
    setIsSubmitting(false);

    toast.success("Consignment Application Submitted!", {
      description: `Application #${refCode} registered. Our concierge partner team will reach out within 24 hours.`,
    });
  };

  return (
    <>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/[0.08]">
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.07] via-transparent to-black pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[var(--brand-primary)]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] text-xs font-mono uppercase tracking-widest animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apex Vehicle Host & Consignment Program</span>
          </div>

          <h1 className={`text-4xl sm:text-5xl lg:text-6xl ${headingFont} font-bold text-white tracking-tight leading-[1.15]`}>
            Turn Your Luxury Automobile Into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] via-amber-200 to-amber-500">
              High-Yield Passive Revenue
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            Consign your exotic, sports, or ultra-luxury vehicle with Apex Concierge. We handle
            white-glove detailing, VIP executive vetting, climate-controlled storage, and $2M
            commercial insurance while you earn{" "}
            <strong className="text-white font-semibold">70% of gross rental revenue</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#calculator"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 text-black font-semibold text-xs tracking-wider uppercase shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Calculate Your Earnings
            </a>
            <a
              href="#application"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.15] text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              Apply to List Vehicle
              <ArrowRight className="w-4 h-4 text-[var(--brand-primary)]" />
            </a>
          </div>

          {/* Key Metrics Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Owner Revenue Share
              </span>
              <span className={`text-2xl sm:text-3xl font-bold ${headingFont} text-[var(--brand-primary)]`}>
                70% Net
              </span>
              <span className="text-[11px] text-zinc-500 block mt-1">Direct monthly ACH payout</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Insurance Policy
              </span>
              <span className={`text-2xl sm:text-3xl font-bold ${headingFont} text-white`}>
                $2,000,000
              </span>
              <span className="text-[11px] text-zinc-500 block mt-1">Comprehensive & collision</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Avg. Host Earning
              </span>
              <span className={`text-2xl sm:text-3xl font-bold ${headingFont} text-emerald-400`}>
                $5,200/mo
              </span>
              <span className="text-[11px] text-zinc-500 block mt-1">Based on 8-12 rental days</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Driver Vetting
              </span>
              <span className={`text-2xl sm:text-3xl font-bold ${headingFont} text-white`}>
                Top 1% VIP
              </span>
              <span className="text-[11px] text-zinc-500 block mt-1">28+ age limit & $3k+ deposit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Host Earnings Calculator */}
      <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interactive Payout Forecaster</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl ${headingFont} font-bold text-white tracking-tight`}>
            Estimate Your Monthly Host Revenue
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto font-light">
            Select your vehicle class and projected monthly charter schedule to see how much
            passive income you can generate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Tier */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                1. Select Vehicle Classification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VEHICLE_TIERS.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleSelectTier(tier)}
                      className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "bg-zinc-900 border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]"
                          : "bg-zinc-950/60 border-white/[0.08] hover:border-white/20 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-white">{tier.name}</span>
                        <span className="text-xs font-mono text-[var(--brand-primary)]">
                          ${tier.defaultDailyRate}/day
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 line-clamp-1">{tier.example}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Rental Days Slider */}
            <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                    2. Estimated Days Rented Per Month
                  </label>
                  <span className="text-xs text-zinc-400">
                    Average Apex fleet utilization is 8 to 14 days per month
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-[var(--brand-primary)]">
                    {daysPerMonth}
                  </span>
                  <span className="text-xs text-zinc-400 block">days / month</span>
                </div>
              </div>

              <input
                type="range"
                min="2"
                max="24"
                value={daysPerMonth}
                onChange={(e) => setDaysPerMonth(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
              />

              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>2 Days (Weekend Only)</span>
                <span>12 Days (Moderate)</span>
                <span>24 Days (Peak Season)</span>
              </div>
            </div>

            {/* Custom Daily Rate Overrider */}
            <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/[0.06] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-zinc-300 block">
                  Daily Rental Base Rate
                </span>
                <span className="text-[11px] text-zinc-500">
                  You can adjust your custom charter price
                </span>
              </div>
              <div className="relative w-32">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-mono">
                  $
                </span>
                <Input
                  type="number"
                  min="200"
                  max="10000"
                  step="50"
                  value={customRate}
                  onChange={(e) => setCustomRate(parseInt(e.target.value) || 0)}
                  className="pl-6 bg-black/60 border-white/[0.1] text-xs font-mono text-white text-right"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-[var(--brand-primary)]/30 p-6 sm:p-8 space-y-6 shadow-2xl shadow-amber-500/10">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Estimated Annual Payout
                  </span>
                  <div className={`text-3xl sm:text-4xl ${headingFont} font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 mt-0.5`}>
                    ${hostAnnualEstimate.toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Charter Base Rate:</span>
                  <span className="text-white">${effectiveDailyRate.toLocaleString()} / day</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Days Active per Month:</span>
                  <span className="text-white">{daysPerMonth} days</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Gross Monthly Revenue:</span>
                  <span className="text-zinc-300">${monthlyGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Apex Concierge Fee (30%):</span>
                  <span className="text-zinc-500">-${apexFeeMonthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold bg-[var(--brand-primary)]/10 p-3 rounded-xl border border-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
                  <span>Your Net Monthly Payout:</span>
                  <span>${hostNetMonthly.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Apex Concierge 30% Includes:</span>
                </div>
                <p>
                  $2M Commercial insurance policy, professional detailing after every rental,
                  24/7 telematics, customer vetting, secure biometric depot storage, and automated
                  ACH payouts.
                </p>
              </div>

              <a
                href="#application"
                className="w-full block text-center py-3.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg"
              >
                Apply to Consign This Vehicle
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Pillars of Protection & Consignment */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950/70 border-y border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-primary)]">
              Total Peace of Mind
            </span>
            <h2 className={`text-3xl sm:text-4xl ${headingFont} font-bold text-white tracking-tight`}>
              Enterprise Protection For Your Automotive Asset
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto font-light">
              We treat consigned automobiles with the same reverence as museum collections. Here is
              how we guarantee your car is returned in pristine condition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-white ${headingFont}`}>
                $2M Commercial Coverage
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Underwritten by premier specialty automotive insurers. Zero personal liability,
                $0 host deductible, with primary coverage that shields your personal insurance
                completely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-white ${headingFont}`}>
                Strict VIP Renter Screening
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Every renter undergoes facial biometric identity validation, driving record (MVR)
                background verification, and a mandatory $2,500-$5,000 security deposit hold.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-white ${headingFont}`}>
                24/7 Telemetry & Geo-Fencing
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Discreet GPS telematics monitor speed, track rev limits, and enforce geographic
                boundaries. Any aggressive driving triggers instant dispatch intervention.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-white ${headingFont}`}>
                Climate-Controlled Depots
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Stored in private indoor facilities with continuous air filtration, battery trickle
                charging, soft dust covers, and 24/7 armed biometric security monitoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-white ${headingFont}`}>
                Complimentary Concierge Detailing
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Your vehicle receives multi-stage hand washes, wheel decontamination, and leather
                conditioning before and after every charter outing at zero cost to you.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-white ${headingFont}`}>
                Unlimited Owner Personal Use
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Your car remains yours. Block out personal driving weekends or road trips via your
                Host Portal anytime with 48 hours notice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Host Portal Status Lookup Tool */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/80 border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono uppercase">
                <Lock className="w-3 h-3" />
                <span>Existing Host Partner Access</span>
              </div>
              <h3 className={`text-xl font-bold ${headingFont} text-white mt-1`}>
                Apex Host Operations Portal
              </h3>
              <p className="text-xs text-zinc-400">
                Track vehicle status, check month-to-date earnings, and view upcoming charter schedules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDemoPortal(!showDemoPortal)}
                className="text-xs border-[var(--brand-primary)]/30 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
              >
                {showDemoPortal ? "Hide Host Dashboard" : "Demo Live Host Dashboard"}
              </Button>
            </div>
          </div>

          {/* Interactive Demo Host Dashboard */}
          {showDemoPortal && (
            <div className="p-6 rounded-xl bg-black/60 border border-white/[0.08] space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/[0.1]">
                    <Image
                      src={VEHICLE_TIERS[1].image}
                      alt="Porsche 911 GT3 RS"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      2024 Porsche 911 GT3 RS (LUX-911)
                    </h4>
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active in Fleet · Parked in Downtown Hub
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <span className="text-zinc-500 block">Host ID</span>
                    <span className="text-zinc-300 font-bold">APX-HST-4912</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <span className="text-zinc-500 block">Payout Method</span>
                    <span className="text-zinc-300 font-bold">Chase ACH ****8921</span>
                  </div>
                </div>
              </div>

              {/* Host Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-[11px] text-zinc-400 font-mono uppercase">
                    Sept 2026 Gross
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">$8,010.00</div>
                  <span className="text-[10px] text-zinc-500 font-mono">9 days booked</span>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-[11px] text-zinc-400 font-mono uppercase">
                    Your Net Payout (70%)
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    $5,607.00
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Disburses Oct 1</span>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-[11px] text-zinc-400 font-mono uppercase">
                    Current Odometer
                  </span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">3,420 mi</div>
                  <span className="text-[10px] text-zinc-500 font-mono">+220 mi this month</span>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-[11px] text-zinc-400 font-mono uppercase">
                    Upcoming Charters
                  </span>
                  <div className="text-xl font-bold font-mono text-[var(--brand-primary)] mt-0.5">
                    2 Scheduled
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Oct 4-6, Oct 11-13</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-zinc-400">
                  Want to take your Porsche on a weekend road trip?
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.info("Inspection Report Clean", {
                        description:
                          "Last 120-point digital inspection completed Sept 22, 2026. Zero faults.",
                      })
                    }
                    className="text-xs border-white/[0.1] text-zinc-300"
                  >
                    View Last Inspection
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      toast.success("Owner Personal Blockout Initiated", {
                        description:
                          "Vehicle marked unavailable to public guests for your personal driving dates.",
                      })
                    }
                    className="bg-[var(--brand-primary)] hover:opacity-90 text-black font-semibold text-xs"
                  >
                    Schedule Personal Drive
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Host Onboarding Application Form */}
      <section id="application" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-xs font-mono uppercase">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Consignment Application</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl ${headingFont} font-bold text-white tracking-tight`}>
            Apply to List Your Vehicle
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto font-light">
            Our luxury fleet curators will evaluate your vehicle within 24 hours and arrange a
            complimentary 120-point inspection and onboarding consultation.
          </p>
        </div>

        {submittedApp ? (
          <div className="p-8 rounded-2xl bg-zinc-950 border border-emerald-500/30 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className={`text-2xl font-bold ${headingFont} text-white`}>
                Application Received Successfully!
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Thank you, <strong className="text-white">{submittedApp.ownerName}</strong>. Your
                consignment request for your{" "}
                <strong className="text-white">
                  {submittedApp.brand} {submittedApp.model}
                </strong>{" "}
                is currently under review by our executive acquisitions team.
              </p>
            </div>

            <div className="inline-block p-4 rounded-xl bg-black border border-white/[0.08] text-left font-mono text-xs space-y-1">
              <span className="text-zinc-500 block">Your Consignment Reference:</span>
              <span className="text-lg font-bold text-[var(--brand-primary)] block">
                {submittedApp.reference}
              </span>
              <span className="text-[11px] text-zinc-400 block pt-1">
                A verification link has been sent to your email address.
              </span>
            </div>

            <div>
              <Button
                onClick={() => setSubmittedApp(null)}
                variant="outline"
                className="border-white/[0.1] text-xs text-zinc-300 hover:text-white"
              >
                Submit Another Vehicle
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleFormSubmit}
            className="p-6 sm:p-10 rounded-2xl bg-zinc-950/80 border border-white/[0.1] space-y-8 shadow-2xl"
          >
            {/* Section 1: Owner Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] font-mono border-b border-white/[0.08] pb-2">
                1. Owner & Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Full Legal Name *
                  </label>
                  <Input
                    required
                    placeholder="Alexander Wright"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Email Address *
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="alexander@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    required
                    placeholder="+1 (310) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Preferred Depot Region *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                  >
                    <option value="Los Angeles / Beverly Hills">Los Angeles / Beverly Hills Hub</option>
                    <option value="Miami / South Beach">Miami / South Beach Hub</option>
                    <option value="New York / Manhattan">New York / Manhattan VIP Depot</option>
                    <option value="Las Vegas / Airport">Las Vegas Private Terminal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle Profile */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] font-mono border-b border-white/[0.08] pb-2">
                2. Vehicle Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Make / Brand *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Ferrari"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Model *
                  </label>
                  <Input
                    required
                    placeholder="e.g. 296 GTB Assetto"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Year *
                  </label>
                  <Input
                    required
                    type="number"
                    min="2018"
                    max="2026"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Current Odometer (Miles) *
                  </label>
                  <Input
                    required
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Exterior Color
                  </label>
                  <Input
                    placeholder="Rosso Corsa"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Target Daily Rate ($) *
                  </label>
                  <Input
                    required
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: parseInt(e.target.value) || 1200 })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Photo Preview */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] font-mono border-b border-white/[0.08] pb-2">
                3. Display Photograph
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.1] shrink-0">
                  <Image
                    src={formData.photoUrl || VEHICLE_TIERS[0].image}
                    alt="Vehicle Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <label className="block text-xs font-medium text-zinc-300">
                    Photo URL or Preset
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                  <div className="flex gap-2">
                    {VEHICLE_TIERS.map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: t.image })}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] hover:text-white text-zinc-400"
                      >
                        Preset {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Eligibility Check */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.hasCleanTitle}
                  onChange={(e) => setFormData({ ...formData, hasCleanTitle: e.target.checked })}
                  className="mt-0.5 rounded border-white/20 bg-black/60 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span className="text-xs text-zinc-300 leading-relaxed">
                  I certify that this vehicle possesses a clean title with no salvage, flood, or
                  unrepaired frame damage history, and meets the Apex 40,000 maximum mileage requirement.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[var(--brand-primary)] hover:opacity-90 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-xl shadow-amber-500/20"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Consignment Application...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Submit Vehicle for Consignment Approval
                </span>
              )}
            </Button>
          </form>
        )}
      </section>

      {/* Host Program FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full border-t border-white/[0.08]">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-zinc-300 text-xs font-mono uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>Host Transparency & Guidance</span>
          </div>
          <h2 className={`text-3xl ${headingFont} font-bold text-white tracking-tight`}>
            Frequently Asked Questions by Vehicle Owners
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-zinc-950/60 border border-white/[0.08] space-y-2"
            >
              <h3 className="text-sm font-semibold text-white flex items-center justify-between">
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}

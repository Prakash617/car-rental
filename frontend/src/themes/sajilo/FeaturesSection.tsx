"use client";

import React from "react";
import { FeaturesProps } from "@/lib/themes/types";
import {
  ShieldCheck,
  UserCheck,
  BadgeDollarSign,
  MapPin,
  HeartHandshake,
  Headphones,
  CheckCircle2,
  Car
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Verified Fleet",
    desc: "Rigorous 35-point safety inspections, chilled air conditioning, clean sanitization, and up-to-date road tax documents.",
    color: "text-[#e11d2e]",
    bg: "bg-red-50",
  },
  {
    icon: UserCheck,
    title: "Professional Chauffeurs",
    desc: "Polite, punctual drivers with 5+ years of Nepal highway driving experience, verified background checks, and local route fluency.",
    color: "text-[#388ddd]",
    bg: "bg-blue-50",
  },
  {
    icon: BadgeDollarSign,
    title: "Transparent NPR Rates",
    desc: "All-inclusive fixed rates for 4h, 8h, and 1-day hires. Chauffeur fees and standard kilometers included with zero hidden charges.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: MapPin,
    title: "14+ Cities In Nepal",
    desc: "Seamless pick-up and drop across Kathmandu, Pokhara, Chitwan, Banepa, Biratnagar, Butwal, Janakpur, and major airports.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: HeartHandshake,
    title: "Wedding & Tour Specialists",
    desc: "Designer floral car decorations, convoy arrangements, and customized multi-day Himalayan road trip packages.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Headphones,
    title: "24/7 Travel Helpline",
    desc: "Live concierge support (+977 974 181 6117) throughout your journey with rapid replacement guarantee in case of emergency.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

export function SajiloFeaturesSection({ branding }: FeaturesProps) {
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#e11d2e]">
            Why Choose {branding?.name || "Apex Rentals"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The Most Reliable Car Hire Network In Nepal
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Whether it&apos;s a daily city commute, airport pickup, outstation tour, or marriage event, we deliver comfort and safety at every turn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#388ddd] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Sajilo Payment Milestone Banner */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#388ddd]">
              Hassle-Free Booking Process
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Only 10% Advance To Secure Your Ride
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Pay 10% now to confirm your driver &amp; vehicle. Pay 40% before departure, and the remaining 50% upon journey completion.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> 10% Advance
            </div>
            <span>&rarr;</span>
            <div className="flex items-center gap-1.5 text-blue-600">
              <CheckCircle2 className="w-4 h-4" /> 40% On Pickup
            </div>
            <span>&rarr;</span>
            <div className="flex items-center gap-1.5 text-slate-900">
              <CheckCircle2 className="w-4 h-4" /> 50% On Drop
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

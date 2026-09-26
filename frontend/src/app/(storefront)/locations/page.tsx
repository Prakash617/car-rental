"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  Sparkles,
} from "lucide-react";
import { useBranding } from "@/lib/context/branding";
import { getThemeHeadingFont } from "@/lib/themes/registry";

const HUBS = [
  {
    name: "Downtown Flagship Hub",
    type: "Metropolitan Executive Depot",
    address: "9400 Wilshire Blvd, Suite 1200, Beverly Hills, CA 90212",
    phone: "+1 (310) 555-0199",
    hours: "Open 24/7 (By Appointment)",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    features: [
      "Climate-controlled private garage",
      "Host vehicle drop-off & inspection suite",
      "Private VIP guest hospitality lounge",
      "Tesla & CCS Level 3 EV DC Fast Charging",
    ],
  },
  {
    name: "Airport VIP Private Terminal Depot",
    type: "FBO & Aviation Concierge",
    address: "Van Nuys Airport (VNY) / Signature Flight Support, Gate 4",
    phone: "+1 (818) 555-0144",
    hours: "24/7 Ramp Delivery & Plane-Side Handover",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    features: [
      "Direct tarmac plane-side car positioning",
      "Pre-cooled / pre-heated cabin arrival",
      "Discreet luggage transfer & security detail",
      "Return keys at jet steps",
    ],
  },
  {
    name: "Miami South Beach Marina Terminal",
    type: "Coastal Exotic Showcase",
    address: "1000 Ocean Drive, Miami Beach, FL 33139",
    phone: "+1 (305) 555-0188",
    hours: "Daily 7:00 AM – 11:00 PM (Emergency Dispatch 24/7)",
    image: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=800&q=80",
    features: [
      "Yacht marina curbside handover",
      "Convertible & supercar express dispatch",
      "Host vehicle staging & detailing pavilion",
      "Valet coordination with luxury hotels",
    ],
  },
];

export default function LocationsPage() {
  const branding = useBranding();
  const headingFont = getThemeHeadingFont(branding.active_theme);

  return (
    <>
      {/* Header */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase border"
            style={{
              backgroundColor: `${branding.primary_color}18`,
              borderColor: `${branding.primary_color}33`,
              color: branding.primary_color,
            }}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Depot Hubs &amp; Aviation Terminals</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-bold text-white tracking-tight ${headingFont}`}>
            Strategic Concierge Hubs
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            From private aviation FBO tarmac gates to secure downtown climate-controlled depots,
            {branding.name}&apos;s physical infrastructure guarantees white-glove arrival and flawless vehicle turnover.
          </p>
        </div>
      </section>

      {/* Hubs Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {HUBS.map((hub, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-zinc-950/70 border border-white/[0.08] overflow-hidden flex flex-col justify-between transition-colors shadow-xl group hover:border-white/[0.2]"
            >
              <div>
                <div className="relative aspect-[16/10] w-full bg-zinc-900">
                  <Image src={hub.image} alt={hub.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white border border-white/[0.1]">
                      {hub.type}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className={`text-lg font-bold text-white ${headingFont}`}>{hub.name}</h3>

                  <div className="space-y-2 text-xs text-zinc-400 font-light">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: branding.primary_color }} />
                      <span>{hub.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" style={{ color: branding.primary_color }} />
                      <span>{hub.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-4 h-4 shrink-0" style={{ color: branding.primary_color }} />
                      <span>{hub.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <span className="text-[11px] font-mono uppercase text-zinc-500 block">
                      Hub Capabilities
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {hub.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: branding.primary_color }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href="/fleet"
                  className="w-full py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold uppercase tracking-wider text-white text-center block transition-all hover:text-black"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = branding.primary_color;
                    (e.currentTarget as HTMLElement).style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                >
                  View Vehicles at This Hub
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

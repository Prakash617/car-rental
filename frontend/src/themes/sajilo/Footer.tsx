"use client";

import React from "react";
import Link from "next/link";
import { FooterProps } from "@/lib/themes/types";
import {
  Car,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CreditCard,
  Heart
} from "lucide-react";

export function SajiloFooter({ branding }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#e11d2e] flex items-center justify-center text-white font-bold shadow-md shadow-red-500/30">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                {branding?.name || "Apex Rentals"}
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Trusted car rental marketplace with verified fleet and trained chauffeurs. Providing safe, comfortable, and timely travel across 14+ cities.
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e11d2e] shrink-0" />
                <span>Apex Fleet Hub, Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#388ddd] shrink-0" />
                <a href={`tel:${branding?.support_phone || "+1 (800) 555-APEX"}`} className="hover:text-white transition-colors">
                  {branding?.support_phone || "+1 (800) 555-APEX"}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${branding?.support_email || "concierge@apex-fleet.com"}`} className="hover:text-white transition-colors">
                  {branding?.support_email || "concierge@apex-fleet.com"}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>24/7 Helpline &amp; Roadside Dispatch</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Rentals &amp; Fleet
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Search Cars In Nepal
                </Link>
              </li>
              <li>
                <Link href="/search?category=sedan" className="hover:text-white transition-colors">
                  Sedan Car Rental (EV / Fuel)
                </Link>
              </li>
              <li>
                <Link href="/search?category=suv" className="hover:text-white transition-colors">
                  SUV &amp; Scorpio Hire
                </Link>
              </li>
              <li>
                <Link href="/search?category=van" className="hover:text-white transition-colors">
                  Toyota &amp; EV Hiace (14 Seater)
                </Link>
              </li>
              <li>
                <Link href="/search?trip_type=marriage" className="hover:text-white transition-colors">
                  Wedding Car Decoration
                </Link>
              </li>
              <li>
                <Link href="/fleet" className="hover:text-white transition-colors">
                  All Vehicles Showroom
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Cities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Popular Cities
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/search?city=Kathmandu" className="hover:text-white transition-colors">
                  Car Rental in Kathmandu
                </Link>
              </li>
              <li>
                <Link href="/search?city=Pokhara" className="hover:text-white transition-colors">
                  Car Rental in Pokhara
                </Link>
              </li>
              <li>
                <Link href="/search?city=Chitwan" className="hover:text-white transition-colors">
                  Car Rental in Chitwan
                </Link>
              </li>
              <li>
                <Link href="/search?city=Banepa" className="hover:text-white transition-colors">
                  Car Rental in Banepa / Dhulikhel
                </Link>
              </li>
              <li>
                <Link href="/search?city=Biratnagar" className="hover:text-white transition-colors">
                  Car Rental in Biratnagar
                </Link>
              </li>
              <li>
                <Link href="/search?city=Janakpur" className="hover:text-white transition-colors">
                  Car Rental in Janakpur
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Portal & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Desk
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  href="/client"
                  className="font-bold text-amber-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/client" className="hover:text-white transition-colors">
                  Track Reservation &amp; Invoices
                </Link>
              </li>
              <li>
                <Link href="/list-your-car" className="hover:text-white transition-colors">
                  List Your Car / Host Vehicle
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About {branding?.name || "Apex Rentals"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>

            {/* Nepal Payment Options Badges */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                Accepted Payments
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">eSewa</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Khalti</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Fonepay</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Cash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {branding?.name || "Apex Rentals"}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Kathmandu, Nepal</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-slate-400">
              Safe Journeys Guaranteed <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

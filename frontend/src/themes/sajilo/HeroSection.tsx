"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Search,
  ShieldCheck,
  CheckCircle,
  PhoneCall,
  Sparkles,
  Award,
  ChevronRight,
  HeartHandshake
} from "lucide-react";
import { HeroProps } from "@/lib/themes/types";

const NEPAL_CITIES = [
  "Kathmandu",
  "Pokhara",
  "Chitwan (Sauraha)",
  "Banepa / Dhulikhel",
  "Biratnagar",
  "Birgunj",
  "Butwal",
  "Dhangadi",
  "Dharan",
  "Hetauda",
  "Ilam",
  "Itahari",
  "Janakpur",
  "Nepalgunj",
];

const VEHICLE_CATEGORIES = [
  { value: "all", label: "All Vehicles" },
  { value: "sedan", label: "Sedan Car (EV / Fuel)" },
  { value: "suv", label: "SUV Car (Creta / Brezza / Scorpio)" },
  { value: "van", label: "Toyota Hiace / EV Hiace" },
  { value: "compact", label: "Hatchback (Swift / Tiago EV)" },
  { value: "luxury", label: "Luxury & Wedding Fleet" },
];

const DESTINATIONS = [
  { name: "Kathmandu Valley", tag: "Day Tour / Airport", price: "From Rs. 3,500" },
  { name: "Pokhara Lakes", tag: "Scenic Highway", price: "From Rs. 14,000" },
  { name: "Chitwan Safari", tag: "Wildlife Tour", price: "From Rs. 12,500" },
  { name: "Nagarkot Sunrise", tag: "Himalayan View", price: "From Rs. 4,500" },
  { name: "Janakpur Dham", tag: "Cultural Heritage", price: "From Rs. 16,000" },
  { name: "Lumbini Sacred Garden", tag: "Peace Highway", price: "From Rs. 18,500" },
];

export function SajiloHeroSection({ branding }: HeroProps) {
  const router = useRouter();
  const [pickupCity, setPickupCity] = useState("Kathmandu");
  const [vehicleType, setVehicleType] = useState("all");
  const [tripType, setTripType] = useState<"return" | "one_way" | "marriage" | "tour">("return");
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState("08:00");
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [returnTime, setReturnTime] = useState("18:00");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      city: pickupCity,
      category: vehicleType,
      trip_type: tripType,
      pickup_date: `${pickupDate}T${pickupTime}`,
      return_date: `${returnDate}T${returnTime}`,
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-50 via-white to-slate-100/60 text-slate-900 border-b border-slate-200 overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#e11d2e]/10 to-[#388ddd]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 rounded-full bg-gradient-to-tr from-[#388ddd]/15 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative z-10">
        {/* Title and Tagline */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#e11d2e] text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#e11d2e]" />
            <span>100% Verified Fleet &bull; Experienced Chauffeurs Included</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Rent A Car In Nepal{" "}
            <span className="bg-gradient-to-r from-[#e11d2e] via-[#d03835] to-[#388ddd] bg-clip-text text-transparent">
              With Professional Driver
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Hassle-free car rental for city rides, tours, weddings, and inter-city travel across Nepal. Fixed transparent rates in NPR with zero hidden charges.
          </p>
        </div>

        {/* Floating Sajilo Smart Search Widget */}
        <div className="relative mx-auto max-w-5xl">
          {/* Gradient Border Wrap */}
          <div className="p-[2px] rounded-2xl bg-gradient-to-r from-[#388ddd] via-[#5aa0e8] to-[#e11d2e] shadow-2xl">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-inner space-y-5">
              {/* Trip Type Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
                  Trip Type:
                </span>
                {[
                  { id: "return", label: "Round Trip (Return)" },
                  { id: "one_way", label: "One-Way Drop" },
                  { id: "tour", label: "Multi-Day Tour" },
                  { id: "marriage", label: "Wedding / Marriage Car" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTripType(tab.id as typeof tripType)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      tripType === tab.id
                        ? "bg-[#e11d2e] text-white shadow-sm shadow-red-500/30"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Controls Grid */}
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Pickup City */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#e11d2e]" />
                      Pickup City / Location
                    </label>
                    <select
                      value={pickupCity}
                      onChange={(e) => setPickupCity(e.target.value)}
                      className="w-full h-11 px-3 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] focus:border-[#388ddd] outline-none text-slate-900 transition-all"
                    >
                      {NEPAL_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#388ddd]" />
                      Vehicle Type
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full h-11 px-3 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] focus:border-[#388ddd] outline-none text-slate-900 transition-all"
                    >
                      {VEHICLE_CATEGORIES.map((vc) => (
                        <option key={vc.value} value={vc.value}>
                          {vc.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pickup Date & Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#e11d2e]" />
                      Pickup Date &amp; Time
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="col-span-3 h-11 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
                      />
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="col-span-2 h-11 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Return Date & Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#388ddd]" />
                      Return Date &amp; Time
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="col-span-3 h-11 px-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
                      />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="col-span-2 h-11 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> No advance cancellation penalty
                    </span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Award className="w-3.5 h-3.5 text-amber-500" /> Fixed Nepal Road Rates
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-[#e11d2e] via-[#d03835] to-[#b01524] hover:from-[#b01524] hover:to-[#e11d2e] text-white text-sm font-bold tracking-wide rounded-xl shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
                  >
                    <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>Search Available Cars</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Popular Nepal Routes Showcase */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e11d2e]" /> Popular Travel Routes &amp; Tours
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Instant pricing with driver included
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => router.push(`/search?city=${encodeURIComponent(dest.name.split(" ")[0])}`)}
                className="bg-white border border-slate-200/90 rounded-xl p-3 text-left hover:border-[#388ddd] hover:shadow-md transition-all group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#e11d2e] transition-colors line-clamp-1">
                  {dest.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{dest.tag}</div>
                <div className="text-[11px] font-bold text-[#388ddd] mt-2">{dest.price}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

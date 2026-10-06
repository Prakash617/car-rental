"use client";

import React, { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  UserCheck,
  Gauge,
  Fuel,
  Users,
  ArrowRight,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowUpDown,
  ChevronRight,
  Award,
  Flower2
} from "lucide-react";
import { useVehiclesQuery } from "@/lib/query/hooks/useVehiclesQuery";
import { Vehicle } from "@/types";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

const NEPAL_CITIES = [
  "All Cities",
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
  { id: "all", label: "All Vehicles" },
  { id: "sedan", label: "Sedan Car (EV / Fuel)" },
  { id: "suv", label: "SUV Car (Creta / Brezza / Scorpio)" },
  { id: "van", label: "Toyota Hiace / EV Hiace" },
  { id: "compact", label: "Hatchback (Swift / Tiago EV)" },
  { id: "luxury", label: "Luxury & Wedding Fleet" },
];

function SearchContent() {
  const searchParams = useSearchParams();

  // Initial params
  const initialCity = searchParams.get("city") || "All Cities";
  const initialCategory = searchParams.get("category") || "all";
  const initialTripType = searchParams.get("trip_type") || "return";

  // Filter States
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [tripType, setTripType] = useState(initialTripType);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "recommended">("recommended");
  const [onlyEV, setOnlyEV] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dates
  const [pickupDate, setPickupDate] = useState(() => {
    const raw = searchParams.get("pickup_date");
    if (raw) return raw.split("T")[0];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState(() => {
    const raw = searchParams.get("pickup_date");
    if (raw && raw.includes("T")) return raw.split("T")[1].slice(0, 5);
    return "08:00";
  });
  const [returnDate, setReturnDate] = useState(() => {
    const raw = searchParams.get("return_date");
    if (raw) return raw.split("T")[0];
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [returnTime, setReturnTime] = useState(() => {
    const raw = searchParams.get("return_date");
    if (raw && raw.includes("T")) return raw.split("T")[1].slice(0, 5);
    return "18:00";
  });

  const { data: vehicles = [], isLoading } = useVehiclesQuery();

  // Filtering Logic
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // Category filter
        let matchesCategory = true;
        if (selectedCategory !== "all") {
          matchesCategory = v.category.toLowerCase() === selectedCategory.toLowerCase();
        }

        // Trip Type filter: if marriage, prioritize luxury / sedan
        if (tripType === "marriage" && selectedCategory === "all") {
          matchesCategory = v.category === "luxury" || v.category === "sedan" || v.category === "suv";
        }

        // Keyword filter
        const q = searchKeyword.toLowerCase().trim();
        const matchesKeyword =
          !q ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q));

        // EV toggle
        const matchesEV = !onlyEV || v.fuel_type === "electric";

        return matchesCategory && matchesKeyword && matchesEV;
      })
      .sort((a, b) => {
        const rateA = Number(a.daily_rate) || 0;
        const rateB = Number(b.daily_rate) || 0;
        if (sortBy === "price_asc") return rateA - rateB;
        if (sortBy === "price_desc") return rateB - rateA;
        return 0;
      });
  }, [vehicles, selectedCategory, tripType, searchKeyword, onlyEV, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Search Header Banner (White Clean Theme) */}
      <div className="relative bg-white text-slate-900 pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#e11d2e] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Nepal Vehicle Search
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Rent A Car In Nepal With Driver
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Showing verified vehicles available across Nepal with professional chauffeurs.
            </p>
          </div>

          {/* Floating Smart Search Widget */}
          <div className="relative mx-auto max-w-5xl">
            <div className="p-[2px] rounded-2xl bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 shadow-xl border border-slate-200/60">
              <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
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
                      onClick={() => setTripType(tab.id)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Pickup City */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#e11d2e]" />
                      Pickup City / Location
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-11 px-3 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900 transition-all"
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
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-11 px-3 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900 transition-all"
                    >
                      {VEHICLE_CATEGORIES.map((vc) => (
                        <option key={vc.id} value={vc.id}>
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
                        className="col-span-3 h-11 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
                      />
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="col-span-2 h-11 px-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
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
                        className="col-span-3 h-11 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
                      />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="col-span-2 h-11 px-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Info row */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 10% Advance Booking
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Award className="w-3.5 h-3.5 text-amber-500" /> Chauffeur Included
                    </span>
                  </div>

                  <span className="text-[#388ddd] font-semibold">
                    Hub: {selectedCity === "All Cities" ? "All Nepal" : selectedCity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#e11d2e]" />
            <span>Filter Options</span>
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 px-3 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#e11d2e]" /> Filter Fleet
                </span>
                <button
                  onClick={() => {
                    setSelectedCity("All Cities");
                    setSelectedCategory("all");
                    setTripType("return");
                    setSearchKeyword("");
                    setOnlyEV(false);
                  }}
                  className="text-xs text-[#388ddd] hover:underline font-semibold"
                >
                  Reset All
                </button>
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Vehicle Keyword</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search brand, model..."
                    className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none"
                  />
                </div>
              </div>

              {/* Vehicle Category Radio List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#388ddd]" /> Category
                </label>
                <div className="space-y-1.5">
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900"
                    >
                      <input
                        type="radio"
                        name="category_filter"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="accent-[#e11d2e] w-3.5 h-3.5"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* EV Only toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> Only EV (Electric)
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyEV}
                    onChange={(e) => setOnlyEV(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                </label>
              </div>

              {/* Wedding Car Badge Note */}
              {tripType === "marriage" && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-[11px] text-pink-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-pink-700">
                    <Flower2 className="w-3.5 h-3.5" /> Wedding Styling Active
                  </div>
                  <p className="text-slate-600">
                    Vehicles can be decorated with fresh floral arrangements and ribbons upon checkout.
                  </p>
                </div>
              )}

              {/* Nepal Road Note */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] text-[#e11d2e] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Apex Assurance
                </div>
                <p className="text-slate-600 font-normal">
                  Chauffeur fees, air conditioning, and highway permits are included in all Nepal rates.
                </p>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="lg:col-span-3 space-y-5">
            {/* Sort and Count Bar */}
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
              <span className="text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{filteredVehicles.length}</strong> available vehicles
                {selectedCity !== "All Cities" && ` in ${selectedCity}`}
              </span>

              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium hidden sm:flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Vehicles Cards List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((v) => {
                  const firstImage = v.images?.[0];
                  const rawImage =
                    typeof firstImage === "string"
                      ? firstImage
                      : firstImage?.url || DEFAULT_VEHICLE_IMAGE;
                  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

                  const dailyRate = Number(v.daily_rate) || 6500;
                  const rate4h = v.rate_4h ? Number(v.rate_4h) : Math.round(dailyRate * 0.55);
                  const rate8h = v.rate_8h ? Number(v.rate_8h) : Math.round(dailyRate * 0.80);

                  return (
                    <div
                      key={v.id}
                      className="group bg-gradient-to-br from-[#388ddd]/60 via-[#5aa0e8]/30 to-[#e11d2e]/60 p-[1.5px] rounded-2xl shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="bg-white rounded-[15px] h-full flex flex-col justify-between overflow-hidden">
                        {/* Photo */}
                        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                          <Image
                            src={primaryImage}
                            alt={`${v.brand} ${v.model}`}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 flex gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/95 text-slate-800 shadow-sm">
                              {v.category}
                            </span>
                            {v.fuel_type === "electric" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white shadow-sm flex items-center gap-0.5">
                                <Zap className="w-2.5 h-2.5" /> EV
                              </span>
                            )}
                          </div>
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 text-amber-300 backdrop-blur-sm flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Chauffeur Included
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#e11d2e]">
                                {v.brand}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{v.year}</span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#388ddd] transition-colors">
                              {v.model}
                            </h3>

                            {/* Specs */}
                            <div className="grid grid-cols-3 gap-1 py-2 my-2 border-y border-slate-100 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1">
                                <Gauge className="w-3 h-3 text-slate-400" />
                                <span className="capitalize">{v.transmission}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Fuel className="w-3 h-3 text-slate-400" />
                                <span className="capitalize">{v.fuel_type}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span>{v.seats} Seats</span>
                              </div>
                            </div>

                            {/* Rates box */}
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-xs">
                              <div className="flex items-center justify-between text-slate-600">
                                <span>4 Hours (≤ 50km)</span>
                                <span className="font-bold text-slate-900">
                                  Rs. {rate4h.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>8 Hours (≤ 100km)</span>
                                <span className="font-bold text-slate-900">
                                  Rs. {rate8h.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold text-slate-800">
                                <span>1 Day Base</span>
                                <span className="font-extrabold text-[#e11d2e] text-sm">
                                  Rs. {dailyRate.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center gap-2">
                            <Link
                              href={`/vehicle/${v.id}`}
                              className="flex-1 py-2 px-3 bg-[#e11d2e] hover:bg-[#b01524] text-white rounded-xl text-xs font-bold text-center shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1"
                            >
                              <span>Book Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/vehicle/${v.id}`}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No vehicles found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing your filters or choosing a different vehicle category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setTripType("return");
                    setSearchKeyword("");
                    setOnlyEV(false);
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-10 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

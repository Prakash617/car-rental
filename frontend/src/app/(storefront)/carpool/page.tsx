"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  Star,
  Phone,
  CheckCircle2,
  AlertCircle,
  Bell,
  PlusCircle,
  X,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
  Check,
  Leaf,
  Luggage,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { CarpoolRide } from "@/types";

const NEPAL_CITIES = [
  "Kathmandu",
  "Pokhara",
  "Chitwan (Bharatpur)",
  "Dharan",
  "Butwal",
  "Biratnagar",
  "Itahari",
  "Hetauda",
  "Banepa",
  "Janakpur",
  "Nepalgunj",
  "Dhangadhi",
  "Bhairahawa",
];

const POPULAR_ROUTES = [
  { from: "Kathmandu", to: "Pokhara" },
  { from: "Kathmandu", to: "Chitwan (Bharatpur)" },
  { from: "Pokhara", to: "Kathmandu" },
  { from: "Kathmandu", to: "Dharan" },
  { from: "Kathmandu", to: "Butwal" },
];

function CarpoolContent() {
  const searchParams = useSearchParams();

  // Filter States
  const [fromCity, setFromCity] = useState(searchParams.get("from") || "");
  const [toCity, setToCity] = useState(searchParams.get("to") || "");
  const [travelDate, setTravelDate] = useState(searchParams.get("date") || "");
  const [passengers, setPassengers] = useState(Number(searchParams.get("seats") || 1));

  // Data States
  const [rides, setRides] = useState<CarpoolRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Seat Booking Modal States
  const [selectedRide, setSelectedRide] = useState<CarpoolRide | null>(null);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [pickupLandmark, setPickupLandmark] = useState("");
  const [dropoffLandmark, setDropoffLandmark] = useState("");
  const [passengerNotes, setPassengerNotes] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [bookingErrorMsg, setBookingErrorMsg] = useState<string | null>(null);

  // Route Alert Subscription Modal States
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertFrom, setAlertFrom] = useState("");
  const [alertTo, setAlertTo] = useState("");
  const [alertPhone, setAlertPhone] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertDate, setAlertDate] = useState("");
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);
  const [alertErrorMsg, setAlertErrorMsg] = useState<string | null>(null);

  // Offer Ride Modal States
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    origin_city: "Kathmandu",
    origin_point: "Kalanki / Ring Road",
    destination_city: "Pokhara",
    destination_point: "Prithvi Chowk / Lakeside",
    departure_datetime: "",
    vehicle_model: "Toyota EV HiAce (14 Seater)",
    vehicle_type: "EV Hiace",
    vehicle_image: "",
    total_seats: 10,
    available_seats: 5,
    price_per_seat: 950,
    driver_name: "",
    driver_phone: "",
    features: "AC, Luggage Storage, EV Silent Drive",
    notes: "Direct highway route. Max 1 bag per passenger.",
  });
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);
  const [offerErrorMsg, setOfferErrorMsg] = useState<string | null>(null);

  // Pre-fill user data from local customer auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("apex_customer_auth");
        if (stored) {
          const customer = JSON.parse(stored);
          const name = customer.full_name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
          if (name) {
            setPassengerName(name);
            setOfferForm((prev) => ({ ...prev, driver_name: name }));
          }
          if (customer.phone && customer.phone !== "—") {
            setPassengerPhone(customer.phone);
            setAlertPhone(customer.phone);
            setOfferForm((prev) => ({ ...prev, driver_phone: customer.phone }));
          }
          if (customer.email) {
            setPassengerEmail(customer.email);
            setAlertEmail(customer.email);
          }
        }
      } catch (e) {
        console.error("Failed to parse local customer auth:", e);
      }
    }
  }, []);

  // Fetch Rides from Backend
  const fetchRides = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromCity.trim()) params.append("from", fromCity.trim());
      if (toCity.trim()) params.append("to", toCity.trim());
      if (travelDate) params.append("date", travelDate);
      if (passengers > 1) params.append("seats", String(passengers));

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await apiFetch<any>(`/api/v1/carpool/${query}`);
      const list = Array.isArray(res) ? res : res?.data || [];
      setRides(list);
    } catch (err: any) {
      console.error("Failed to fetch carpool rides:", err);
      setError("Unable to load carpool departures. Showing regional Nepal schedules.");
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [fromCity, toCity, travelDate, passengers]);

  // Handle Search Submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRides();
  };

  // Open seat booking modal
  const handleOpenBooking = (ride: CarpoolRide) => {
    setSelectedRide(ride);
    setBookingSeats(1);
    setPickupLandmark(ride.origin_point);
    setDropoffLandmark(ride.destination_point);
    setBookingSuccessMsg(null);
    setBookingErrorMsg(null);
  };

  // Handle seat booking submit
  const handleConfirmSeatBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRide) return;
    setIsSubmittingBooking(true);
    setBookingErrorMsg(null);
    setBookingSuccessMsg(null);

    try {
      const res = await apiFetch<any>(`/api/v1/carpool/${selectedRide.id}/request-seat/`, {
        method: "POST",
        body: JSON.stringify({
          passenger_name: passengerName.trim(),
          passenger_phone: passengerPhone.trim(),
          passenger_email: passengerEmail.trim(),
          seats_requested: bookingSeats,
          pickup_point: pickupLandmark.trim(),
          dropoff_point: dropoffLandmark.trim(),
          notes: passengerNotes.trim(),
        }),
      });

      // Matches Sajilo Rental prompt: "Booking request sent — we will contact you soon."
      setBookingSuccessMsg(res?.message || "Booking request sent — we will contact you soon.");

      // Update remaining seats in local list
      setRides((prev) =>
        prev.map((r) =>
          r.id === selectedRide.id
            ? {
                ...r,
                available_seats: Math.max(0, r.available_seats - bookingSeats),
                status: r.available_seats - bookingSeats <= 0 ? "full" : r.status,
              }
            : r
        )
      );

      // Close modal after delay
      setTimeout(() => {
        setSelectedRide(null);
        setBookingSuccessMsg(null);
      }, 3500);
    } catch (err: any) {
      setBookingErrorMsg(err.message || "Failed to submit booking request. Please check seat availability.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle route alert subscription
  const handleSubscribeAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAlert(true);
    setAlertErrorMsg(null);
    setAlertSuccessMsg(null);

    try {
      const res = await apiFetch<any>("/api/v1/carpool/subscribe-alert/", {
        method: "POST",
        body: JSON.stringify({
          origin_city: alertFrom || fromCity || "Kathmandu",
          destination_city: alertTo || toCity || "Pokhara",
          preferred_date: alertDate || travelDate || null,
          phone: alertPhone.trim(),
          email: alertEmail.trim(),
          passenger_count: passengers,
        }),
      });

      setAlertSuccessMsg(
        res?.message ||
          "Subscribed! We will notify you via SMS / WhatsApp once a vehicle is published on this route."
      );
      setTimeout(() => {
        setShowAlertModal(false);
        setAlertSuccessMsg(null);
      }, 3500);
    } catch (err: any) {
      setAlertErrorMsg(err.message || "Failed to subscribe to route alerts.");
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  // Handle publish ride submit
  const handlePublishRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOffer(true);
    setOfferErrorMsg(null);
    setOfferSuccessMsg(null);

    try {
      const featArray = offerForm.features.split(",").map((f) => f.trim()).filter(Boolean);
      const res = await apiFetch<any>("/api/v1/carpool/publish-ride/", {
        method: "POST",
        body: JSON.stringify({
          ...offerForm,
          features: featArray,
        }),
      });

      const newRide = res?.data || res?.ride;
      if (newRide) {
        setRides((prev) => [newRide, ...prev]);
      } else {
        fetchRides();
      }

      setOfferSuccessMsg("Shared ride published successfully! It is now live in the carpool directory.");
      setTimeout(() => {
        setShowOfferModal(false);
        setOfferSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setOfferErrorMsg(err.message || "Failed to publish carpool ride.");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
      {/* ========================================================= */}
      {/* HERO SECTION (Matches sajilorental.com/carpool)           */}
      {/* ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#0b1329] via-[#0f1b3b] to-[#14234b] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e11d2e_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* Breadcrumb & Pill */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
              <Users className="w-3.5 h-3.5" />
              Shared travel
            </span>
            <span className="text-xs text-slate-400">Nepal Intercity Network</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Carpool — Shared Rides Across Nepal
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Find published shared rides or subscribe to get notified when a vehicle is available for your route.
                Comfortable EV HiAce, Scorpio 4x4, and executive sedans with vetted chauffeurs.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAlertFrom(fromCity);
                  setAlertTo(toCity);
                  setShowAlertModal(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Subscribe for Route Alerts</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#e11d2e] hover:bg-[#b01524] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-500/25 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Offer a Ride</span>
              </button>
            </div>
          </div>

          {/* Highlights ribbon */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                ✓
              </div>
              <span className="text-slate-300 font-medium">Verified Drivers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[11px]">
                ⚡
              </div>
              <span className="text-slate-300 font-medium">EV &amp; 4x4 Fleet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                💰
              </div>
              <span className="text-slate-300 font-medium">Up to 60% Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[11px]">
                📍
              </div>
              <span className="text-slate-300 font-medium">Doorway Stops</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* INTERACTIVE SEARCH & FILTER BAR                           */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-9 relative z-20">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200/90 flex flex-col lg:flex-row items-center gap-3"
        >
          {/* Pickup City */}
          <div className="w-full lg:flex-1 relative">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              From:
            </span>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#e11d2e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                list="nepal-cities-from"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="Pickup City (e.g. Kathmandu)"
                className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#e11d2e]"
              />
              <datalist id="nepal-cities-from">
                {NEPAL_CITIES.map((c) => (
                  <option key={`from-${c}`} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Destination City */}
          <div className="w-full lg:flex-1 relative">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              To:
            </span>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                list="nepal-cities-to"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="Destination City (e.g. Pokhara)"
                className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#e11d2e]"
              />
              <datalist id="nepal-cities-to">
                {NEPAL_CITIES.map((c) => (
                  <option key={`to-${c}`} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Travel Date */}
          <div className="w-full lg:w-48 relative">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Date:
            </span>
            <div className="relative">
              <Calendar className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#e11d2e]"
              />
            </div>
          </div>

          {/* Seats Count */}
          <div className="w-full lg:w-36 relative">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Seats:
            </span>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full h-11 px-3 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#e11d2e]"
            >
              <option value={1}>1 Seat</option>
              <option value={2}>2 Seats</option>
              <option value={3}>3 Seats</option>
              <option value={4}>4+ Seats</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="w-full lg:w-auto pt-3 sm:pt-4">
            <button
              type="submit"
              className="w-full lg:w-auto h-11 px-6 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Rides</span>
            </button>
          </div>
        </form>

        {/* Popular Route Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          <span className="text-slate-400 font-semibold">Popular Routes:</span>
          {POPULAR_ROUTES.map((route, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFromCity(route.from);
                setToCity(route.to);
              }}
              className="px-3 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-[#e11d2e] rounded-full border border-slate-200/90 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {route.from} &rarr; {route.to}
            </button>
          ))}
          {(fromCity || toCity || travelDate) && (
            <button
              type="button"
              onClick={() => {
                setFromCity("");
                setToCity("");
                setTravelDate("");
                setPassengers(1);
              }}
              className="text-[#e11d2e] hover:underline font-semibold ml-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CARPOOL LISTINGS                                     */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Published Shared Departures
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing active intercity carpools with confirmed seats and verified chauffeurs.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            {rides.length} {rides.length === 1 ? "Ride" : "Rides"} Available
          </span>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold text-slate-500">
              Searching nearest carpool departures across Nepal...
            </p>
          </div>
        ) : rides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => {
              const departureDate = new Date(ride.departure_datetime);
              const formattedDate = departureDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const formattedTime = departureDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });

              const isSeatsLow = ride.available_seats <= 2 && ride.available_seats > 0;
              const isFull = ride.available_seats === 0 || ride.status === "full";

              return (
                <div
                  key={ride.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Header */}
                  <div className="p-5 pb-4 border-b border-slate-100 space-y-3">
                    {/* Time & Seats Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-[#e11d2e]" />
                        <span>{formattedDate} &bull; {formattedTime}</span>
                      </div>

                      {isFull ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                          Fully Booked
                        </span>
                      ) : isSeatsLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          Only {ride.available_seats} seats left
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ride.available_seats} of {ride.total_seats} seats free
                        </span>
                      )}
                    </div>

                    {/* Route Timeline */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-start gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-[#e11d2e] ring-4 ring-red-100 shrink-0 mt-1" />
                        <div>
                          <strong className="text-sm font-extrabold text-slate-900 block leading-tight">
                            {ride.origin_city}
                          </strong>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {ride.origin_point}
                          </span>
                        </div>
                      </div>

                      <div className="pl-1.5 -my-1 border-l-2 border-dashed border-slate-200 h-4" />

                      <div className="flex items-start gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 shrink-0 mt-1" />
                        <div>
                          <strong className="text-sm font-extrabold text-slate-900 block leading-tight">
                            {ride.destination_city}
                          </strong>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {ride.destination_point}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Chauffeur Profile */}
                  <div className="p-5 pt-3 space-y-3">
                    {/* Vehicle pill */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-slate-600" />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs leading-tight">
                            {ride.vehicle_model}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {ride.vehicle_type}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Comfort Class
                      </span>
                    </div>

                    {/* Driver row */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs">
                          {ride.driver_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900">{ride.driver_name}</span>
                            {ride.is_driver_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {ride.driver_trips} trips completed
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(ride.driver_rating).toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Amenities tags */}
                    {Array.isArray(ride.features) && ride.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ride.features.slice(0, 3).map((feat, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Fare & Action */}
                  <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Fare per seat
                      </span>
                      <strong className="text-lg font-extrabold text-[#e11d2e]">
                        Rs. {Number(ride.price_per_seat).toLocaleString()}
                      </strong>
                    </div>

                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => handleOpenBooking(ride)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isFull
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-black text-white hover:shadow-md"
                      }`}
                    >
                      <span>{isFull ? "Full" : "Request Seat"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* NO PUBLISHED CARPOOLS EMPTY STATE                         */
          /* (Matches exact copy from sajilorental.com/carpool)        */
          /* ========================================================= */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#e11d2e] border border-red-100 flex items-center justify-center mx-auto shadow-2xs">
              <Users className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                No published carpools
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Try another date or route, or subscribe to get notified when one is added.
              </p>
            </div>

            {/* Embedded Route Alert Subscription Box */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-left space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Get Instant SMS / Email Route Alert
                </h4>
              </div>

              {alertSuccessMsg ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{alertSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribeAlert} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">From:</label>
                      <input
                        type="text"
                        value={alertFrom || fromCity}
                        onChange={(e) => setAlertFrom(e.target.value)}
                        placeholder="e.g. Kathmandu"
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">To:</label>
                      <input
                        type="text"
                        value={alertTo || toCity}
                        onChange={(e) => setAlertTo(e.target.value)}
                        placeholder="e.g. Pokhara"
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="text"
                        value={alertPhone}
                        onChange={(e) => setAlertPhone(e.target.value)}
                        placeholder="e.g. 9841234567"
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                      />
                    </div>
                  </div>

                  {alertErrorMsg && (
                    <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                      {alertErrorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingAlert}
                    className="w-full h-10 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Subscribe for route alerts</span>
                  </button>
                </form>
              )}
            </div>

            {/* Back to search */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setFromCity("");
                  setToCity("");
                  setTravelDate("");
                  fetchRides();
                }}
                className="text-xs font-bold text-[#e11d2e] hover:underline cursor-pointer"
              >
                Clear all filters and show all departures &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* HOW SHARED CARPOOL TRAVEL WORKS                           */}
        {/* ========================================================= */}
        <section className="mt-20 pt-12 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e11d2e] bg-red-50 px-3 py-1 rounded-full border border-red-100">
              Reliable &amp; Safe
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
              Why Travel via Sajilo Carpool?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Connect with fellow travelers heading your direction while splitting highway fuel costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                🛡️
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Vetted Chauffeurs</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All carpool vehicles and drivers undergo license validation, background verification, and identity checks before publishing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                ⚡
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Quiet EV &amp; 4x4 HiAce</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Travel in modern electric vans and rugged Scorpios with air conditioning, generous luggage compartments, and spacious legroom.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base">
                💸
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Transparent Seat Pricing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fixed transparent fares with no surge charges. Pay for only the seat you occupy without chartering the whole vehicle.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* SEAT RESERVATION MODAL                                    */}
      {/* ========================================================= */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-200 p-6 relative my-8">
            <button
              onClick={() => setSelectedRide(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              {/* Header */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e11d2e] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                  Shared Seat Reservation
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {selectedRide.origin_city} &rarr; {selectedRide.destination_city}
                </h3>
                <span className="text-xs text-slate-500">
                  {new Date(selectedRide.departure_datetime).toLocaleString()} &bull; {selectedRide.vehicle_model}
                </span>
              </div>

              {bookingSuccessMsg ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {bookingSuccessMsg}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Our Kathmandu dispatch desk has reserved your seat. The chauffeur will call your phone prior to pickup.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmSeatBooking} className="space-y-4 text-xs">
                  {bookingErrorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
                      {bookingErrorMsg}
                    </div>
                  )}

                  {/* Seat count selector */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Number of Seats</span>
                      <span className="text-[11px] text-slate-500">
                        Available: {selectedRide.available_seats} seats
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingSeats((prev) => Math.max(1, prev - 1))}
                        disabled={bookingSeats <= 1}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-sm text-slate-900 w-6 text-center">
                        {bookingSeats}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setBookingSeats((prev) => Math.min(selectedRide.available_seats, prev + 1))
                        }
                        disabled={bookingSeats >= selectedRide.available_seats}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Passenger fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Passenger Name *</label>
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="e.g. Ramesh KC"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                      <input
                        type="text"
                        required
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="e.g. 9841234567"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Pickup Landmark</label>
                      <input
                        type="text"
                        value={pickupLandmark}
                        onChange={(e) => setPickupLandmark(e.target.value)}
                        placeholder={selectedRide.origin_point}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Dropoff Landmark</label>
                      <input
                        type="text"
                        value={dropoffLandmark}
                        onChange={(e) => setDropoffLandmark(e.target.value)}
                        placeholder={selectedRide.destination_point}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Notes / Baggage</label>
                    <input
                      type="text"
                      value={passengerNotes}
                      onChange={(e) => setPassengerNotes(e.target.value)}
                      placeholder="e.g. 1 trolley bag, travelling with child"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                    />
                  </div>

                  {/* Price Calculation */}
                  <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-600 block">Total Fare Payable</span>
                      <span className="text-[10px] text-slate-400">
                        Rs. {Number(selectedRide.price_per_seat).toLocaleString()} &times; {bookingSeats} {bookingSeats === 1 ? "seat" : "seats"}
                      </span>
                    </div>
                    <strong className="text-base font-extrabold text-[#e11d2e]">
                      Rs. {(Number(selectedRide.price_per_seat) * bookingSeats).toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRide(null)}
                      className="flex-1 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="flex-1 h-11 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingBooking ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Confirm Seat Request</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ROUTE ALERT SUBSCRIPTION MODAL                            */}
      {/* ========================================================= */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 p-6 relative">
            <button
              onClick={() => setShowAlertModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Subscribe for Route Alerts</h3>
                  <span className="text-xs text-slate-500">
                    Get notified immediately when shared seats open.
                  </span>
                </div>
              </div>

              {alertSuccessMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{alertSuccessMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribeAlert} className="space-y-3 text-xs">
                  {alertErrorMsg && (
                    <div className="p-2.5 bg-red-50 text-red-700 rounded-xl font-medium">
                      {alertErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">From:</label>
                      <input
                        type="text"
                        required
                        value={alertFrom}
                        onChange={(e) => setAlertFrom(e.target.value)}
                        placeholder="Kathmandu"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">To:</label>
                      <input
                        type="text"
                        required
                        value={alertTo}
                        onChange={(e) => setAlertTo(e.target.value)}
                        placeholder="Pokhara"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={alertDate}
                      onChange={(e) => setAlertDate(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={alertPhone}
                      onChange={(e) => setAlertPhone(e.target.value)}
                      placeholder="e.g. 9841234567"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAlert}
                    className="w-full h-11 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors cursor-pointer mt-2"
                  >
                    {isSubmittingAlert ? "Subscribing..." : "Subscribe for route alerts"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* OFFER / PUBLISH A RIDE MODAL                              */}
      {/* ========================================================= */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-200 p-6 relative my-8">
            <button
              onClick={() => setShowOfferModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e11d2e] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                  Driver / Host Portal
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Publish a Shared Travel Departure
                </h3>
                <span className="text-xs text-slate-500">
                  List empty seats in your Scorpio, EV, or sedan and split trip fuel expenses.
                </span>
              </div>

              {offerSuccessMsg ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{offerSuccessMsg}</h4>
                </div>
              ) : (
                <form onSubmit={handlePublishRide} className="space-y-3 text-xs">
                  {offerErrorMsg && (
                    <div className="p-2.5 bg-red-50 text-red-700 rounded-xl font-medium">
                      {offerErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Departure City *</label>
                      <input
                        type="text"
                        required
                        value={offerForm.origin_city}
                        onChange={(e) => setOfferForm({ ...offerForm, origin_city: e.target.value })}
                        placeholder="Kathmandu"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Pickup Point *</label>
                      <input
                        type="text"
                        required
                        value={offerForm.origin_point}
                        onChange={(e) => setOfferForm({ ...offerForm, origin_point: e.target.value })}
                        placeholder="Kalanki Chowk"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Destination City *</label>
                      <input
                        type="text"
                        required
                        value={offerForm.destination_city}
                        onChange={(e) => setOfferForm({ ...offerForm, destination_city: e.target.value })}
                        placeholder="Pokhara"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Dropoff Point *</label>
                      <input
                        type="text"
                        required
                        value={offerForm.destination_point}
                        onChange={(e) => setOfferForm({ ...offerForm, destination_point: e.target.value })}
                        placeholder="Prithvi Chowk"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Departure Date &amp; Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={offerForm.departure_datetime}
                        onChange={(e) => setOfferForm({ ...offerForm, departure_datetime: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Vehicle Model *</label>
                      <input
                        type="text"
                        required
                        value={offerForm.vehicle_model}
                        onChange={(e) => setOfferForm({ ...offerForm, vehicle_model: e.target.value })}
                        placeholder="Toyota EV HiAce / Scorpio"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Available Seats *</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        required
                        value={offerForm.available_seats}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, available_seats: Number(e.target.value) })
                        }
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Price per Seat (Rs.) *</label>
                      <input
                        type="number"
                        min={100}
                        required
                        value={offerForm.price_per_seat}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, price_per_seat: Number(e.target.value) })
                        }
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Driver Name *</label>
                      <input
                        type="text"
                        required
                        value={offerForm.driver_name}
                        onChange={(e) => setOfferForm({ ...offerForm, driver_name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Driver Phone *</label>
                      <input
                        type="text"
                        required
                        value={offerForm.driver_phone}
                        onChange={(e) => setOfferForm({ ...offerForm, driver_phone: e.target.value })}
                        placeholder="98XXXXXXXX"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Route &amp; Luggage Notes</label>
                    <input
                      type="text"
                      value={offerForm.notes}
                      onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                      placeholder="e.g. Mugling route, AC on, trunk space available"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(false)}
                      className="flex-1 h-11 border border-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOffer}
                      className="flex-1 h-11 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingOffer ? "Publishing..." : "Publish Carpool Ride"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CarpoolPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CarpoolContent />
    </Suspense>
  );
}

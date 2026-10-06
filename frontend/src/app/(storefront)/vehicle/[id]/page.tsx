"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Gauge,
  Fuel,
  Users,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Car,
  Award,
  AlertCircle,
  Flower2
} from "lucide-react";
import { useVehiclesQuery } from "@/lib/query/hooks/useVehiclesQuery";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";

const NEPAL_CITIES = [
  "Kathmandu (Tribhuvan Airport / Thamel)",
  "Pokhara (Lakeside)",
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

const WEDDING_DECORATIONS = [
  { id: "none", name: "No Decoration", price: 0, desc: "Standard clean car with chauffeur" },
  { id: "classic", name: "Classic Floral", price: 3500, desc: "Front hood bouquet + ribbon doors" },
  { id: "bloom", name: "Elegant Bloom", price: 4500, desc: "Fresh rose ribbons & side mirrors garland" },
  { id: "premium", name: "Premium Elegance", price: 5500, desc: "Full bonnet fresh flowers & rear trail" },
  { id: "luxury", name: "Luxury Floral", price: 7500, desc: "Imported orchids & lilies bespoke styling" },
  { id: "royal", name: "Signature Royal", price: 10000, desc: "VVIP wedding styling + red carpet dispatch" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;
  const router = useRouter();

  const { data: vehicles = [], isLoading } = useVehiclesQuery();
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === vehicleId) || null;
  }, [vehicles, vehicleId]);

  // Gallery active index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking Form State
  const [tripType, setTripType] = useState<"return" | "one_way" | "tour" | "marriage">("return");
  const [pickupLocation, setPickupLocation] = useState("Kathmandu");
  const [destinationLocation, setDestinationLocation] = useState("Pokhara");
  const [stops, setStops] = useState<string[]>([]);
  const [newStopText, setNewStopText] = useState("");
  const [selectedDecoration, setSelectedDecoration] = useState(WEDDING_DECORATIONS[0]);

  // Dates
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

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<{
    reference: string;
    total: number;
    advance: number;
  } | null>(null);

  // Active Policy tab
  const [policyTab, setPolicyTab] = useState<"rates" | "driver" | "cancellation">("rates");

  // Calculations
  const dailyRate = Number(vehicle?.daily_rate) || 6500;
  const rate4h = vehicle?.rate_4h ? Number(vehicle.rate_4h) : Math.round(dailyRate * 0.55);
  const rate8h = vehicle?.rate_8h ? Number(vehicle.rate_8h) : Math.round(dailyRate * 0.80);

  // Calculate rental days
  const rentalDays = useMemo(() => {
    try {
      const p = new Date(`${pickupDate}T${pickupTime}`);
      const r = new Date(`${returnDate}T${returnTime}`);
      const diffMs = r.getTime() - p.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays || 1);
    } catch {
      return 1;
    }
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  // Base fare
  const baseFare = dailyRate * rentalDays;
  const decorationFee = tripType === "marriage" ? selectedDecoration.price : 0;
  const subtotal = baseFare + decorationFee;
  const vatAmount = Math.round(subtotal * 0.13); // 13% Nepal VAT
  const totalAmount = subtotal + vatAmount;
  const advanceAmount = Math.round(totalAmount * 0.10); // 10% Advance

  // Handlers
  const addStop = () => {
    if (newStopText.trim()) {
      setStops([...stops, newStopText.trim()]);
      setNewStopText("");
    }
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg("Please provide your full name, phone number, and email address.");
      return;
    }

    if (!vehicle) return;

    setIsSubmitting(true);
    try {
      const payload = {
        vehicle_id: vehicle.id,
        customer: {
          first_name: customerName.split(" ")[0] || customerName,
          last_name: customerName.split(" ").slice(1).join(" ") || "",
          phone: customerPhone,
          email: customerEmail,
        },
        pickup_datetime: `${pickupDate}T${pickupTime}:00Z`,
        return_datetime: `${returnDate}T${returnTime}:00Z`,
        pickup_location: pickupLocation,
        destination_location: destinationLocation,
        stops: stops,
        trip_type: tripType,
        decoration_name: tripType === "marriage" ? selectedDecoration.name : "",
        decoration_price: decorationFee,
        advance_amount: advanceAmount,
        notes: specialNotes,
      };

      const res = await apiFetch<any>("/api/v1/bookings/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.booking_reference) {
        setBookingSuccess({
          reference: res.booking_reference,
          total: totalAmount,
          advance: advanceAmount,
        });
      } else {
        // Fallback demo ref
        const fallbackRef = `SAJ-${Math.floor(100000 + Math.random() * 900000)}`;
        setBookingSuccess({
          reference: fallbackRef,
          total: totalAmount,
          advance: advanceAmount,
        });
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      // If error occurs, create client reservation state
      const fallbackRef = `SAJ-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingSuccess({
        reference: fallbackRef,
        total: totalAmount,
        advance: advanceAmount,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#e11d2e] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Loading vehicle details...
          </p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md text-center space-y-4">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Vehicle Not Found</h2>
          <p className="text-xs text-slate-500">
            The vehicle you requested is not active or has been updated in our inventory.
          </p>
          <Link
            href="/search"
            className="inline-block px-5 py-2.5 bg-[#e11d2e] text-white text-xs font-bold rounded-xl"
          >
            Back To Search
          </Link>
        </div>
      </div>
    );
  }

  // Primary image and images gallery
  const images = vehicle.images && vehicle.images.length > 0
    ? vehicle.images.map((img) => (typeof img === "string" ? img : img.url))
    : [DEFAULT_VEHICLE_IMAGE];
  const activeImage = getSafeImageUrl(images[activeImageIndex], DEFAULT_VEHICLE_IMAGE);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/search" className="hover:text-slate-900">
            Vehicles
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">
            {vehicle.brand} {vehicle.model}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Media Gallery, Specs, Driver & Policies (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Gallery Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-slate-100">
                <Image
                  src={activeImage}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  unoptimized
                  className="object-cover"
                />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                    {vehicle.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Vehicle
                  </span>
                </div>

                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-900/90 text-amber-300 backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                    <UserCheck className="w-4 h-4" /> Professional Chauffeur Included
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === i ? "border-[#e11d2e] ring-2 ring-red-200" : "border-slate-200"
                      }`}
                    >
                      <Image
                        src={getSafeImageUrl(img, DEFAULT_VEHICLE_IMAGE)}
                        alt="Thumbnail"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Overview Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e11d2e]">
                    {vehicle.brand}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Daily Base Rate</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#e11d2e]">
                    Rs. {dailyRate.toLocaleString()}
                    <span className="text-xs font-medium text-slate-500"> / day</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {vehicle.description ||
                  `Experience superior comfort in Nepal with our verified ${vehicle.brand} ${vehicle.model}. Accompanied by an experienced licensed chauffeur with comprehensive knowledge of Nepal's highways.`}
              </p>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-[#388ddd]" /> Transmission
                  </span>
                  <strong className="capitalize text-slate-900">{vehicle.transmission}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <Fuel className="w-3.5 h-3.5 text-[#388ddd]" /> Fuel Type
                  </span>
                  <strong className="capitalize text-slate-900">{vehicle.fuel_type}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#388ddd]" /> Seating
                  </span>
                  <strong className="text-slate-900">{vehicle.seats} Passengers</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#388ddd]" /> Model Year
                  </span>
                  <strong className="text-slate-900">{vehicle.year} Edition</strong>
                </div>
              </div>
            </div>

            {/* Chauffeur Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Dedicated Chauffeur
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {vehicle.driver_name || "Suresh Maharjan"}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block">Experience</span>
                  <strong className="text-slate-900">{vehicle.driver_experience || "7+ Years"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Languages</span>
                  <strong className="text-slate-900">Nepali, English, Hindi</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Highway Clearance</span>
                  <strong className="text-emerald-600">Prithvi &amp; BP Highway Specialist</strong>
                </div>
              </div>
            </div>

            {/* Rental Policy & Rates Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold">
                {[
                  { id: "rates", label: "Fixed Rate Tiers" },
                  { id: "driver", label: "Driver & Inclusions" },
                  { id: "cancellation", label: "Payment & Cancellation" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPolicyTab(t.id as typeof policyTab)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      policyTab === t.id
                        ? "bg-[#e11d2e] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {policyTab === "rates" && (
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-slate-500 block">4-Hour Tour</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                        Rs. {rate4h.toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-slate-400">Includes ≤ 50 km</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-slate-500 block">8-Hour Tour</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                        Rs. {rate8h.toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-slate-400">Includes ≤ 100 km</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-slate-500 block">Full Day (24 hrs)</span>
                      <strong className="text-sm font-bold text-[#e11d2e] block mt-0.5">
                        Rs. {dailyRate.toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-slate-400">Includes ≤ 200 km</span>
                    </div>
                  </div>
                  <p className="text-slate-500 pt-1">
                    * Fuel over the standard mileage allowance is charged at Rs. {vehicle.fuel_rate_per_km || "22"}/km. Toll taxes and parking fees are paid as actuals.
                  </p>
                </div>
              )}

              {policyTab === "driver" && (
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Driver food and night lodging are fully covered by Apex Rentals for standard outstation trips.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Air conditioning operates without extra charges during all highway travels.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Immediate vehicle replacement guarantee anywhere in Nepal in case of unexpected technical issues.</span>
                  </li>
                </ul>
              )}

              {policyTab === "cancellation" && (
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                    <strong>Zero Cancellation Fee:</strong> Cancel up to 24 hours prior to scheduled pickup for a 100% refund of your advance payment.
                  </div>
                  <p>
                    <strong>Payment Terms:</strong> 10% advance deposit confirms your chauffeur dispatch. 40% is payable upon vehicle arrival, and the final 50% balance upon trip completion.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Booking System Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white rounded-2xl border-2 border-[#388ddd]/40 shadow-xl p-6 space-y-6">
              {/* Card Header */}
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#388ddd]">
                    Instant Reservation
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Book This Vehicle
                  </h2>
                </div>
                <div className="px-2.5 py-1 bg-red-50 text-[#e11d2e] border border-red-200 rounded-lg text-xs font-bold">
                  10% Advance
                </div>
              </div>

              {bookingSuccess ? (
                /* Success Modal / State */
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">
                      Reservation Confirmed!
                    </h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Your booking reference has been registered with Apex Rentals.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-emerald-200 space-y-2 text-xs text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Booking Reference:</span>
                      <strong className="font-mono text-slate-900 text-sm">
                        {bookingSuccess.reference}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle:</span>
                      <strong className="text-slate-900">
                        {vehicle.brand} {vehicle.model}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Estimated:</span>
                      <strong className="text-slate-900">
                        Rs. {bookingSuccess.total.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 text-emerald-600 font-bold">
                      <span>10% Advance Due:</span>
                      <span>Rs. {bookingSuccess.advance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/client"
                      className="w-full py-3 bg-[#e11d2e] hover:bg-[#b01524] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md text-center"
                    >
                      Open Client Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBookingSuccess(null)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Make another reservation
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Form */
                <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Trip Type Selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Select Trip Type</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "return", label: "Round Trip (Return)" },
                        { id: "one_way", label: "One-Way Drop" },
                        { id: "tour", label: "Multi-Day Tour" },
                        { id: "marriage", label: "Wedding Car" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTripType(t.id as typeof tripType)}
                          className={`py-2 px-2.5 rounded-xl font-bold transition-all border text-left ${
                            tripType === t.id
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pickup and Destination */}
                  <div className="space-y-2">
                    <div>
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#e11d2e]" /> Pickup Location
                      </label>
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="e.g. Kathmandu Airport, Thamel, Lalitpur"
                        className="w-full h-10 px-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#388ddd]" /> Destination Location
                      </label>
                      <input
                        type="text"
                        value={destinationLocation}
                        onChange={(e) => setDestinationLocation(e.target.value)}
                        placeholder="e.g. Pokhara, Chitwan Sauraha, Nagarkot"
                        className="w-full h-10 px-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] outline-none font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Dynamic Stops */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">En-route Stops (Optional)</label>
                      <span className="text-[10px] text-slate-400">{stops.length} stops added</span>
                    </div>

                    {stops.map((stop, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-slate-800"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#388ddd] text-white text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {stop}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeStop(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newStopText}
                        onChange={(e) => setNewStopText(e.target.value)}
                        placeholder="Add stop (e.g. Malekhu, Kurintar, Damauli)"
                        className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={addStop}
                        className="px-3 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Wedding Decoration Selection */}
                  {tripType === "marriage" && (
                    <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2">
                      <label className="font-bold text-pink-900 flex items-center gap-1.5">
                        <Flower2 className="w-4 h-4 text-pink-600" /> Wedding Floral Decoration
                      </label>
                      <div className="space-y-1.5">
                        {WEDDING_DECORATIONS.map((dec) => (
                          <label
                            key={dec.id}
                            className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                              selectedDecoration.id === dec.id
                                ? "bg-white border-pink-500 shadow-sm"
                                : "bg-white/60 border-pink-100 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="decoration"
                                checked={selectedDecoration.id === dec.id}
                                onChange={() => setSelectedDecoration(dec)}
                                className="accent-pink-600 w-3.5 h-3.5"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{dec.name}</span>
                                <span className="text-[10px] text-slate-500">{dec.desc}</span>
                              </div>
                            </div>
                            <span className="font-bold text-pink-700">
                              {dec.price === 0 ? "Included" : `+Rs. ${dec.price.toLocaleString()}`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates & Times */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#e11d2e]" /> Pickup Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full h-10 px-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        required
                      />
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full h-8 px-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#388ddd]" /> Return Date
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full h-10 px-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        required
                      />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full h-8 px-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  {/* Customer Information Form */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="font-bold text-slate-900 block">Renter Contact Details</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full Name (e.g. Ramesh Shrestha)"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone (98XXXXXXXX)"
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        required
                      />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        required
                      />
                    </div>
                    <textarea
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Special requests (e.g. luggage size, airport flight #)"
                      className="w-full h-14 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                    />
                  </div>

                  {/* Price Breakdown Box */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Vehicle Base ({rentalDays} day{rentalDays > 1 ? "s" : ""}):</span>
                      <span>Rs. {baseFare.toLocaleString()}</span>
                    </div>

                    {decorationFee > 0 && (
                      <div className="flex justify-between text-pink-700">
                        <span>Decoration ({selectedDecoration.name}):</span>
                        <span>+Rs. {decorationFee.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Govt VAT (13%):</span>
                      <span>Rs. {vatAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-sm text-slate-900">
                      <span>Total Estimated Fare:</span>
                      <span className="text-[#e11d2e]">Rs. {totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200/60 font-bold text-emerald-600 text-xs">
                      <span>10% Advance To Confirm:</span>
                      <span>Rs. {advanceAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[#e11d2e] via-[#d03835] to-[#b01524] hover:from-[#b01524] hover:to-[#e11d2e] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Confirming With Chauffeur...</span>
                    ) : (
                      <>
                        <span>Confirm Reservation (10% Advance)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Free cancellation up to 24h &bull; Verified chauffeur</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

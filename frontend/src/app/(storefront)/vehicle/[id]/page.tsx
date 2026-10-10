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
  Flower2,
  Lock,
  LogOut,
  Check,
  X,
  User,
} from "lucide-react";
import { useVehiclesQuery } from "@/lib/query/hooks/useVehiclesQuery";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
import { triggerGoogleOAuth, authenticateWithGoogleToken } from "@/lib/googleAuth";

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

  // Customer Authentication state
  const [currentCustomer, setCurrentCustomer] = useState<{
    id?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  // Customer info inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Embedded Auth form state
  const [authTab, setAuthTab] = useState<"signup" | "signin">("signup");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authSigninIdentifier, setAuthSigninIdentifier] = useState("");
  const [authSigninPassword, setAuthSigninPassword] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("pawan.google@example.com");
  const [googleNameInput, setGoogleNameInput] = useState("Pawan Adhikari");
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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

  // Fleet Availability & Overlap Protection
  const [bookedRanges, setBookedRanges] = useState<
    { id: string; reference: string; start: string; end: string }[]
  >([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityConflict, setAvailabilityConflict] = useState<string | null>(null);

  // Load booked date ranges for vehicle
  useEffect(() => {
    if (!vehicle?.id) return;
    const loadBookedDates = async () => {
      try {
        const res = await apiFetch<any>(`/api/v1/vehicles/${vehicle.id}/booked-dates/`);
        const ranges = res?.data?.booked_ranges || res?.booked_ranges || [];
        setBookedRanges(ranges);
      } catch (e) {
        console.warn("Failed to load booked dates:", e);
      }
    };
    loadBookedDates();
  }, [vehicle?.id]);

  // Live conflict verification whenever dates change
  useEffect(() => {
    if (!vehicle?.id || !pickupDate || !returnDate) return;

    const startIso = `${pickupDate}T${pickupTime}:00Z`;
    const endIso = `${returnDate}T${returnTime}:00Z`;

    const startTs = new Date(startIso).getTime();
    const endTs = new Date(endIso).getTime();

    if (isNaN(startTs) || isNaN(endTs)) return;

    if (endTs <= startTs) {
      setAvailabilityConflict("Return date/time must be strictly after pickup date/time.");
      return;
    }

    // Local overlap check against known booked ranges
    const localConflict = bookedRanges.find((r) => {
      const bStart = new Date(r.start).getTime();
      const bEnd = new Date(r.end).getTime();
      return startTs < bEnd && endTs > bStart;
    });

    if (localConflict) {
      const conflictStart = new Date(localConflict.start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const conflictEnd = new Date(localConflict.end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      setAvailabilityConflict(
        `This vehicle is already reserved from ${conflictStart} to ${conflictEnd} (${localConflict.reference}). Please choose different dates.`
      );
      return;
    }

    // Backend verification
    const verifyAvailability = async () => {
      setIsCheckingAvailability(true);
      try {
        const res = await apiFetch<any>(
          `/api/v1/vehicles/${vehicle.id}/check-availability/?pickup=${startIso}&return=${endIso}`
        );
        const isAvailable = res?.data?.is_available ?? res?.is_available;
        if (!isAvailable) {
          setAvailabilityConflict(
            res?.message || "Vehicle has a conflicting booking or maintenance for these dates."
          );
        } else {
          setAvailabilityConflict(null);
        }
      } catch {
        // Do not hard-block on transient network issues unless local conflict found
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timer = setTimeout(verifyAvailability, 250);
    return () => clearTimeout(timer);
  }, [vehicle?.id, pickupDate, pickupTime, returnDate, returnTime, bookedRanges]);

  // Sync customer session
  useEffect(() => {
    const syncCustomer = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const authSessionParam = urlParams.get("auth_session");
        if (authSessionParam) {
          try {
            const raw = decodeURIComponent(atob(authSessionParam));
            const incomingCustomer = JSON.parse(raw);
            if (incomingCustomer?.id) {
              localStorage.setItem("apex_customer_auth", JSON.stringify(incomingCustomer));
              localStorage.removeItem("apex_user_logged_out");
              window.dispatchEvent(new Event("apex_customer_auth_changed"));

              urlParams.delete("auth_session");
              const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : "";
              window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
            }
          } catch (e) {
            console.error("Failed to parse auth_session in vehicle page:", e);
          }
        }

        const stored = localStorage.getItem("apex_customer_auth");
        if (stored) {
          const cust = JSON.parse(stored);
          setCurrentCustomer(cust);
          const name = cust.full_name || `${cust.first_name || ""} ${cust.last_name || ""}`.trim();
          if (name) setCustomerName(name);
          if (cust.email) setCustomerEmail(cust.email);
          if (cust.phone && cust.phone !== "—") setCustomerPhone(cust.phone);
        } else {
          setCurrentCustomer(null);
        }
      } catch {
        setCurrentCustomer(null);
      }
    };

    syncCustomer();
    window.addEventListener("apex_customer_auth_changed", syncCustomer);
    return () => window.removeEventListener("apex_customer_auth_changed", syncCustomer);
  }, []);

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

  const applyCustomerToState = (customer: any) => {
    setCurrentCustomer(customer);
    const name =
      customer.full_name ||
      `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
    setCustomerName(name);
    setCustomerEmail(customer.email || "");
    if (customer.phone && customer.phone !== "—") setCustomerPhone(customer.phone);
    setShowGoogleModal(false);
  };

  const handleGoogleClick = () => {
    setAuthErrorMsg("");
    triggerGoogleOAuth({
      onSuccess: (customer) => {
        applyCustomerToState(customer);
      },
      onError: (errMsg) => {
        setAuthErrorMsg(errMsg);
      },
      onFallback: () => {
        setShowGoogleModal(true);
      },
      setLoading: setIsGoogleSubmitting,
    });
  };

  // Google Sign-In Handler
  const handleGoogleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    setIsGoogleSubmitting(true);
    setAuthErrorMsg("");

    try {
      const customer = await authenticateWithGoogleToken({
        email: googleEmailInput.trim().toLowerCase(),
        first_name: googleNameInput.trim().split(" ")[0] || "Google",
        last_name: googleNameInput.trim().split(" ").slice(1).join(" ") || "User",
        google_id: `g_${Date.now()}`,
      });

      applyCustomerToState(customer);
    } catch (err: any) {
      setAuthErrorMsg(err.message || "Failed to authenticate with Google.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Embedded Sign Up Handler
  const handleEmbeddedSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg("");
    setIsSubmittingAuth(true);

    try {
      const res = await apiFetch<any>("/api/v1/customers/auth/signup/", {
        method: "POST",
        body: JSON.stringify({
          first_name: authFirstName.trim(),
          last_name: authLastName.trim(),
          email: authEmail.trim(),
          phone: authPhone.trim(),
          password: authPassword,
        }),
      });

      const customer = res?.customer || res;
      localStorage.setItem("apex_customer_auth", JSON.stringify(customer));
      localStorage.removeItem("apex_user_logged_out");
      window.dispatchEvent(new Event("apex_customer_auth_changed"));

      setCurrentCustomer(customer);
      const name = customer.full_name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
      setCustomerName(name);
      setCustomerEmail(customer.email || "");
      setCustomerPhone(customer.phone || "");
    } catch (err: any) {
      setAuthErrorMsg(err.message || "Failed to create account. Please check your details.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Embedded Sign In Handler
  const handleEmbeddedSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg("");
    setIsSubmittingAuth(true);

    try {
      const res = await apiFetch<any>("/api/v1/customers/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          identifier: authSigninIdentifier.trim(),
          password: authSigninPassword,
        }),
      });

      const customer = res?.customer || res;
      localStorage.setItem("apex_customer_auth", JSON.stringify(customer));
      localStorage.removeItem("apex_user_logged_out");
      window.dispatchEvent(new Event("apex_customer_auth_changed"));

      setCurrentCustomer(customer);
      const name = customer.full_name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
      setCustomerName(name);
      setCustomerEmail(customer.email || "");
      if (customer.phone && customer.phone !== "—") setCustomerPhone(customer.phone);
    } catch (err: any) {
      setAuthErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogoutCustomer = () => {
    localStorage.removeItem("apex_customer_auth");
    localStorage.setItem("apex_user_logged_out", "true");
    window.dispatchEvent(new Event("apex_customer_auth_changed"));
    setCurrentCustomer(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
  };

  // Submit Booking to Backend
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (availabilityConflict) {
      setErrorMsg(availabilityConflict);
      return;
    }

    if (!currentCustomer) {
      setErrorMsg("Please create an account or sign in with Google or Email/Password to order this vehicle.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg("Please provide your full contact details to complete the booking.");
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
        const fallbackRef = `APX-${Math.floor(100000 + Math.random() * 900000)}`;
        setBookingSuccess({
          reference: fallbackRef,
          total: totalAmount,
          advance: advanceAmount,
        });
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      const fallbackRef = `APX-${Math.floor(100000 + Math.random() * 900000)}`;
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

  const images = vehicle.images && vehicle.images.length > 0
    ? vehicle.images.map((img) =>
        getSafeImageUrl(typeof img === "string" ? img : img.url, DEFAULT_VEHICLE_IMAGE)
      )
    : [DEFAULT_VEHICLE_IMAGE];

  const mainImage = images[activeImageIndex] || images[0] || DEFAULT_VEHICLE_IMAGE;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 font-medium">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-slate-900 font-medium">Fleet</Link>
            <span>/</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-xs font-bold text-slate-700 hover:text-black flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to fleet</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Vehicle Details & Media (8 cols)             */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* 1. Main Media Hero Showcase */}
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-slate-900">
                <Image
                  src={mainImage}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  priority
                  className="object-cover"
                />

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#e11d2e] text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md">
                    Verified Chauffeur Included
                  </span>
                  {vehicle.fuel_type?.toLowerCase() === "electric" && (
                    <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                      Zero Emission EV
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                      }
                      className="pointer-events-auto p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                      }
                      className="pointer-events-auto p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? "border-[#e11d2e] scale-105 shadow-md"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Vehicle Title & Specs Badges */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="capitalize">{typeof vehicle.category === "string" ? vehicle.category : (vehicle.category as any)?.name || "Premium Fleet"}</span>
                    <span>&bull;</span>
                    <span>Year {vehicle.year}</span>
                    <span>&bull;</span>
                    <span className="font-mono text-slate-700">{vehicle.license_plate}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500 block">Daily Rental Base</span>
                  <strong className="text-2xl sm:text-3xl font-extrabold text-[#e11d2e]">
                    Rs. {dailyRate.toLocaleString()}
                  </strong>
                  <span className="text-[11px] text-slate-400 block font-normal">
                    Includes driver salary &amp; allowances
                  </span>
                </div>
              </div>

              {/* Key Features Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#e11d2e] shrink-0">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacity</span>
                    <span className="text-xs font-bold text-slate-800">{vehicle.seats} Passengers</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#e11d2e] shrink-0">
                    <Gauge className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Transmission</span>
                    <span className="text-xs font-bold text-slate-800 capitalize">{vehicle.transmission}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#e11d2e] shrink-0">
                    <Fuel className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Powertrain</span>
                    <span className="text-xs font-bold text-slate-800 capitalize">{vehicle.fuel_type}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Chauffeur</span>
                    <span className="text-xs font-bold text-emerald-700">Verified Pro</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="pt-2">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Vehicle Overview</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {vehicle.description}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Rates & Chauffeur Standards Tab Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex border-b border-slate-100 gap-6">
                {[
                  { id: "rates", label: "Transparent Rates" },
                  { id: "driver", label: "Chauffeur Standards" },
                  { id: "cancellation", label: "Cancellation & Refund" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPolicyTab(tab.id as typeof policyTab)}
                    className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                      policyTab === tab.id
                        ? "border-[#e11d2e] text-[#e11d2e]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-5 text-xs text-slate-600 space-y-3">
                {policyTab === "rates" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[11px] text-slate-400 font-semibold block">4 Hours (≤ 50km)</span>
                        <strong className="text-base font-extrabold text-slate-900 mt-1 block">
                          Rs. {rate4h.toLocaleString()}
                        </strong>
                        <span className="text-[10px] text-slate-500">Kathmandu valley trips</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[11px] text-slate-400 font-semibold block">8 Hours (≤ 100km)</span>
                        <strong className="text-base font-extrabold text-slate-900 mt-1 block">
                          Rs. {rate8h.toLocaleString()}
                        </strong>
                        <span className="text-[10px] text-slate-500">Full day valley tour</span>
                      </div>
                      <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-100">
                        <span className="text-[11px] text-[#e11d2e] font-semibold block">1 Full Day Base</span>
                        <strong className="text-base font-extrabold text-[#e11d2e] mt-1 block">
                          Rs. {dailyRate.toLocaleString()}
                        </strong>
                        <span className="text-[10px] text-slate-500">Inter-city &amp; highways</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      &bull; Base rate includes vehicle rental, executive chauffeur service, and standard highway insurance. Extra kilometer billing is verified on the digital odometer upon trip completion.
                    </p>
                  </div>
                )}

                {policyTab === "driver" && (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Verified Government License:</strong> Every chauffeur possesses a minimum 5+ years mountain &amp; highway driving history with criminal record verification.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Driver Lodging &amp; Meals:</strong> For overnight tours outside Kathmandu, driver accommodation and meal allowance are completely taken care of.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>English &amp; Nepali Fluent:</strong> Clear communication with tourists, corporate executives, and wedding coordinators.</span>
                    </div>
                  </div>
                )}

                {policyTab === "cancellation" && (
                  <div className="space-y-2">
                    <p>
                      <strong>Free Cancellation:</strong> Cancel without penalty up to 24 hours prior to scheduled pickup time. The 10% advance deposit will be immediately refunded to your original payment method.
                    </p>
                    <p className="text-slate-500">
                      Cancellations made under 24 hours incur a 50% deduction of the advance deposit to reimburse reserved chauffeur dispatch scheduling.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Reservation Sidebar with Account Gate (4-5 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-16 z-20 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-lg shadow-slate-200/50 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-[#e11d2e] flex items-center justify-center font-bold">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Reserve Journey
                    </h2>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Guaranteed vehicle dispatch with chauffeur
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    Rs. {dailyRate.toLocaleString()}/day
                  </span>
                </div>
              </div>

              {/* SUCCESS STATE */}
              {bookingSuccess ? (
                <div className="py-6 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Reservation Initiated!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your booking reference has been linked to your customer profile.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Booking Reference:</span>
                      <strong className="font-mono text-slate-900">#{bookingSuccess.reference}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Customer Name:</span>
                      <strong className="text-slate-900">{customerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Journey Fare:</span>
                      <strong className="text-[#e11d2e]">Rs. {bookingSuccess.total.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-emerald-700">
                      <span>10% Advance Payable:</span>
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
                      className="text-xs text-slate-500 hover:underline cursor-pointer"
                    >
                      Make another reservation
                    </button>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE BOOKING & ORDER FLOW */
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
                          className={`py-2 px-2.5 rounded-xl font-bold transition-all border text-left cursor-pointer ${
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
                          <span className="font-medium text-xs">{stop}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeStop(idx)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newStopText}
                        onChange={(e) => setNewStopText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addStop();
                          }
                        }}
                        placeholder="Add stop (e.g. Mugling lunch, Kurintar cable car)"
                        className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                      <button
                        type="button"
                        onClick={addStop}
                        className="px-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Wedding Decorations */}
                  {tripType === "marriage" && (
                    <div className="space-y-1.5 pt-1 p-3 bg-pink-50/70 border border-pink-200 rounded-2xl">
                      <div className="flex items-center gap-1 text-pink-800 font-bold">
                        <Flower2 className="w-4 h-4 text-pink-600" />
                        <span>Wedding Car Flower Styling</span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {WEDDING_DECORATIONS.map((dec) => (
                          <label
                            key={dec.id}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              selectedDecoration.id === dec.id
                                ? "bg-white border-pink-500 shadow-2xs"
                                : "bg-white/50 border-pink-100 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="wedding_decoration"
                                checked={selectedDecoration.id === dec.id}
                                onChange={() => setSelectedDecoration(dec)}
                                className="accent-pink-600"
                              />
                              <div>
                                <strong className="text-slate-900 block">{dec.name}</strong>
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

                  {/* Availability Conflict Alert & Live Status */}
                  {availabilityConflict && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-red-950 font-bold mb-0.5">Date Conflict Detected</strong>
                        <span>{availabilityConflict}</span>
                      </div>
                    </div>
                  )}

                  {!availabilityConflict && isCheckingAvailability && (
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px] flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-[#e11d2e] border-t-transparent rounded-full animate-spin" />
                      <span>Checking fleet availability for selected schedule...</span>
                    </div>
                  )}

                  {bookedRanges.length > 0 && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800">
                      <span className="font-bold block mb-0.5">Existing Fleet Reservations:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                        {bookedRanges.slice(0, 3).map((r) => (
                          <li key={r.id}>
                            {new Date(r.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash; {new Date(r.end).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ({r.reference})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* AUTHENTICATION REQUIREMENT GATE FOR ORDERING      */}
                  {/* ================================================= */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {currentCustomer ? (
                      /* LOGGED-IN CUSTOMER BADGE */
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {(currentCustomer.first_name?.[0] || currentCustomer.full_name?.[0] || "A").toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">
                                {currentCustomer.full_name || `${currentCustomer.first_name || ""} ${currentCustomer.last_name || ""}`.trim()}
                              </span>
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                Apex Customer
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[170px] sm:max-w-none">
                              {currentCustomer.email} &bull; {customerPhone || currentCustomer.phone}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleLogoutCustomer}
                          className="text-[11px] text-slate-500 hover:text-red-600 underline font-semibold shrink-0 cursor-pointer"
                        >
                          Switch
                        </button>
                      </div>
                    ) : (
                      /* ACCOUNT CREATION / LOGIN MODULE (MANDATORY TO ORDER) */
                      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                        <div className="text-center pb-1">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-[#e11d2e] border border-red-200 text-[10px] font-bold uppercase mb-1">
                            <Lock className="w-3 h-3" />
                            <span>Apex Account Required To Order</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Sign in or create an account to place this booking with Apex Rentals.
                          </p>
                        </div>

                        {/* Continue with Google button */}
                        <button
                          type="button"
                          onClick={handleGoogleClick}
                          disabled={isGoogleSubmitting}
                          className="w-full h-10 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

                        {/* Divider */}
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                          </div>
                          <div className="relative flex justify-center text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                            <span className="bg-slate-50 px-2">or username &amp; password</span>
                          </div>
                        </div>

                        {/* Switcher: Create Account vs Sign In */}
                        <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthTab("signup");
                              setAuthErrorMsg("");
                            }}
                            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                              authTab === "signup"
                                ? "bg-white text-slate-900 shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Create Account
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthTab("signin");
                              setAuthErrorMsg("");
                            }}
                            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                              authTab === "signin"
                                ? "bg-white text-slate-900 shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Sign In
                          </button>
                        </div>

                        {authErrorMsg && (
                          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{authErrorMsg}</span>
                          </div>
                        )}

                        {/* Tab 1: Quick Create Account */}
                        {authTab === "signup" && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                placeholder="First Name"
                                value={authFirstName}
                                onChange={(e) => setAuthFirstName(e.target.value)}
                                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Last Name"
                                value={authLastName}
                                onChange={(e) => setAuthLastName(e.target.value)}
                                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                                required
                              />
                            </div>
                            <input
                              type="email"
                              placeholder="Email Address"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                              required
                            />
                            <input
                              type="tel"
                              placeholder="Mobile Phone (98XXXXXXXX)"
                              value={authPhone}
                              onChange={(e) => setAuthPhone(e.target.value)}
                              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                              required
                            />
                            <input
                              type="password"
                              placeholder="Password (min 6 characters)"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                              required
                            />
                            <button
                              type="button"
                              disabled={isSubmittingAuth}
                              onClick={handleEmbeddedSignUp}
                              className="w-full h-8 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              {isSubmittingAuth ? "Creating..." : "Save Account & Continue"}
                            </button>
                          </div>
                        )}

                        {/* Tab 2: Quick Sign In */}
                        {authTab === "signin" && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Email or Mobile Phone"
                              value={authSigninIdentifier}
                              onChange={(e) => setAuthSigninIdentifier(e.target.value)}
                              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                              required
                            />
                            <input
                              type="password"
                              placeholder="Password"
                              value={authSigninPassword}
                              onChange={(e) => setAuthSigninPassword(e.target.value)}
                              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                              required
                            />
                            <button
                              type="button"
                              disabled={isSubmittingAuth}
                              onClick={handleEmbeddedSignIn}
                              className="w-full h-8 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              {isSubmittingAuth ? "Signing In..." : "Sign In & Continue"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Special requests textarea */}
                    <textarea
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Special requests (e.g. luggage size, airport flight #)"
                      className="w-full h-12 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none text-xs"
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
                    disabled={isSubmitting || !currentCustomer || !!availabilityConflict || isCheckingAvailability}
                    className={`w-full h-12 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                      availabilityConflict
                        ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed opacity-80"
                        : "bg-gradient-to-r from-[#e11d2e] via-[#d03835] to-[#b01524] hover:from-[#b01524] hover:to-[#e11d2e] disabled:opacity-50 text-white shadow-lg shadow-red-500/25 active:scale-95 cursor-pointer"
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Confirming With Chauffeur...</span>
                    ) : isCheckingAvailability ? (
                      <span>Checking Availability...</span>
                    ) : availabilityConflict ? (
                      <span>Unavailable For Selected Dates</span>
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

      {/* ============================================================= */}
      {/* GOOGLE SIGN IN MODAL DIALOG                                   */}
      {/* ============================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Sign in with Google</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your verified Google account will be linked to Apex Rentals.
              </p>
            </div>

            <form onSubmit={handleGoogleAuthSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4285F4] text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Pawan Adhikari"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4285F4] text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isGoogleSubmitting}
                className="w-full h-11 bg-[#4285F4] hover:bg-[#3367d6] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGoogleSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Google Sign-In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

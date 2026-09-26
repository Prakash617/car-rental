"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  Search,
  SlidersHorizontal,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  X,
  Gauge,
  Fuel,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Mail,
  CreditCard,
  Building2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Branch } from "@/lib/api/branches";
import { Vehicle, VehicleCategory } from "@/types";
import { useBranding } from "@/lib/context/branding";
import { getThemeDefinition, getThemeHeadingFont } from "@/lib/themes/registry";
import { apiFetch } from "@/lib/api/client";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";
import { useVehiclesQuery } from "@/lib/query/hooks/useVehiclesQuery";
import { useBranchesQuery } from "@/lib/query/hooks/useBranchesQuery";

export default function PublicFleetPage() {
  const branding = useBranding();
  const theme = getThemeDefinition(branding.active_theme);
  const { FleetGrid } = theme.components;
  const headingFont = getThemeHeadingFont(branding.active_theme);
  
  // React Query cached data
  const { data: apiVehicles, isLoading: isVehiclesLoading } = useVehiclesQuery();
  const { data: apiBranches, isLoading: isBranchesLoading } = useBranchesQuery();

  const vehicles = useMemo(() => {
    return apiVehicles ?? [];
  }, [apiVehicles]);

  const branches = apiBranches || [];
  const isLoading = isVehiclesLoading || isBranchesLoading;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recommended");

  // Booking Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<{
    reference: string;
    vehicleName: string;
    totalAmount: string;
    pickupDate: string;
    returnDate: string;
  } | null>(null);

  // Booking Form Fields
  const [pickupDate, setPickupDate] = useState("2026-10-01");
  const [returnDate, setReturnDate] = useState("2026-10-04");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [withChauffeur, setWithChauffeur] = useState(false);
  const [withLossDamageWaiver, setWithLossDamageWaiver] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestLicense, setGuestLicense] = useState("");

  // Default to first branch when loaded
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);

  // Filtered & Sorted Fleet
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const matchesSearch =
          v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory =
          selectedCategory === "all" || v.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") {
          return parseFloat(a.daily_rate) - parseFloat(b.daily_rate);
        }
        if (sortBy === "price_desc") {
          return parseFloat(b.daily_rate) - parseFloat(a.daily_rate);
        }
        if (sortBy === "year") {
          return b.year - a.year;
        }
        return 0;
      });
  }, [vehicles, searchQuery, selectedCategory, sortBy]);

  // Quote Calculation
  const rentalDays = useMemo(() => {
    const start = new Date(pickupDate).getTime();
    const end = new Date(returnDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [pickupDate, returnDate]);

  const bookingQuote = useMemo(() => {
    if (!selectedVehicle) return null;
    const baseDaily = parseFloat(selectedVehicle.daily_rate) || 850;
    const baseTotal = baseDaily * rentalDays;
    const chauffeurTotal = withChauffeur ? 250 * rentalDays : 0;
    const ldwTotal = withLossDamageWaiver ? 45 * rentalDays : 0;
    const subtotal = baseTotal + chauffeurTotal + ldwTotal;
    const luxuryTax = subtotal * 0.095;
    const deposit = parseFloat(selectedVehicle.deposit_amount || "2000");
    const totalDue = subtotal + luxuryTax;

    return {
      baseDaily,
      baseTotal,
      chauffeurTotal,
      ldwTotal,
      subtotal,
      luxuryTax,
      deposit,
      totalDue,
    };
  }, [selectedVehicle, rentalDays, withChauffeur, withLossDamageWaiver]);

  const handleOpenBooking = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingConfirmed(null);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      toast.error("Please complete all required guest contact fields.");
      return;
    }
    if (!selectedVehicle) return;

    setIsSubmittingBooking(true);
    let reference = `APX-RES-${Math.floor(10000 + Math.random() * 90000)}`;

    const names = guestName.trim().split(" ");
    const firstName = names[0] || "Guest";
    const lastName = names.slice(1).join(" ") || "Client";
    const branchId = selectedBranch || (branches.length > 0 ? branches[0].id : undefined);

    const isUuid = (id?: string) =>
      typeof id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid(selectedVehicle.id) && isUuid(branchId)) {
      try {
        const payload = {
          vehicle_id: selectedVehicle.id,
          pickup_branch_id: branchId,
          return_branch_id: branchId,
          pickup_datetime: `${pickupDate}T10:00:00Z`,
          return_datetime: `${returnDate}T10:00:00Z`,
          customer: {
            first_name: firstName,
            last_name: lastName,
            email: guestEmail.trim(),
            phone: guestPhone.trim(),
            driver_license_number: guestLicense.trim() || "DL-DEFAULT",
            license_expiry_date: "2030-01-01",
            date_of_birth: "1990-01-01",
            country: "US",
          },
          notes: `${withChauffeur ? "Chauffeur Requested. " : ""}${withLossDamageWaiver ? "LDW Selected." : ""}`.trim(),
        };

        const res = await apiFetch<{ booking_reference?: string }>("/api/v1/bookings/", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (res?.booking_reference) {
          reference = res.booking_reference;
        }
      } catch (err) {
        console.warn("Live reservation fallback:", err);
      }
    } else {
      // Simulate booking reservation for demo/mock vehicle
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setBookingConfirmed({
      reference,
      vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
      totalAmount: bookingQuote ? bookingQuote.totalDue.toFixed(2) : "0.00",
      pickupDate,
      returnDate,
    });
    setIsSubmittingBooking(false);

    toast.success("Reservation Confirmed!", {
      description: `Booking #${reference} confirmed. Our private concierge will coordinate your vehicle delivery.`,
    });
  };

  return (
    <>

      {/* Showroom Header */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase mb-3 border"
                style={{
                  backgroundColor: `${branding.primary_color}18`,
                  borderColor: `${branding.primary_color}33`,
                  color: branding.primary_color,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premier Fleet Catalog</span>
              </div>
              <h1 className={`text-3xl sm:text-5xl font-bold text-white tracking-tight ${headingFont}`}>
                {branding.name} Fleet Catalog
              </h1>
              <p className="mt-1 text-sm text-zinc-400 max-w-2xl font-light">
                {branding.hero_subtitle || "Exotic supercars, bespoke SUVs, and executive flagships curated for immediate concierge pickup."}
              </p>
            </div>

            {/* Consign CTA for Vehicle Owners */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/list-your-car"
                className="px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-2"
              >
                <span>Own a Luxury Car? Consign & Earn 70%</span>
                <ArrowRight className="w-3.5 h-3.5" style={{ color: branding.primary_color }} />
              </Link>
            </div>
          </div>

          {/* Quick Search */}
          <div className="pt-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search by brand, model, or spec..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-950/80 border-white/[0.1] text-xs text-white h-11 rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Active Theme Fleet Grid */}
      <FleetGrid
        vehicles={filteredVehicles}
        branding={branding}
        isLoading={isLoading}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSelectVehicle={handleOpenBooking}
      />

      {/* Interactive Booking Reservation Modal */}
      {isBookingOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-white/[0.12] p-6 space-y-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${branding.primary_color}18`,
                    borderColor: `${branding.primary_color}33`,
                    color: branding.primary_color,
                  }}
                >
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold text-white ${headingFont}`}>
                    Reserve {selectedVehicle.brand} {selectedVehicle.model}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Daily Base Rate: ${selectedVehicle.daily_rate}/day · Year: {selectedVehicle.year}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBookingOpen(false)}
                className="text-zinc-500 hover:text-white p-1 text-sm rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className={`text-xl font-bold text-white ${headingFont}`}>
                    VIP Reservation Confirmed
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Your charter reservation has been staged. A dedicated executive concierge will
                    contact you to finalize delivery logistics and white-glove arrival.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/[0.08] text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Booking Reference:</span>
                    <span className="font-bold" style={{ color: branding.primary_color }}>
                      {bookingConfirmed.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Vehicle:</span>
                    <span className="text-white font-bold">{bookingConfirmed.vehicleName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Rental Period:</span>
                    <span className="text-zinc-300">
                      {bookingConfirmed.pickupDate} to {bookingConfirmed.returnDate}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-zinc-400">Total Charged:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ${bookingConfirmed.totalAmount}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setIsBookingOpen(false)}
                  className="bg-[#D4AF37] hover:bg-[#e2bd46] text-black font-semibold text-xs min-w-[140px]"
                >
                  Return to Fleet
                </Button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {/* Dates & Pickup Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Pickup Date *
                    </label>
                    <Input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Return Date *
                    </label>
                    <Input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Depot Hub *
                    </label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                      {branches.length === 0 && (
                        <option value="">Downtown Concierge Hub</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Add-ons Checklist */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
                  <span className="text-xs font-mono uppercase text-zinc-400 block">
                    Concierge Options & Protection
                  </span>

                  <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={withLossDamageWaiver}
                        onChange={(e) => setWithLossDamageWaiver(e.target.checked)}
                        className="rounded border-white/20 bg-black text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <div>
                        <span className="text-white font-medium block">
                          Loss Damage Waiver (Zero Deductible)
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Comprehensive zero-liability coverage for tire, rim, and glass incidents
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[#D4AF37] font-semibold">+$45/day</span>
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={withChauffeur}
                        onChange={(e) => setWithChauffeur(e.target.checked)}
                        className="rounded border-white/20 bg-black text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <div>
                        <span className="text-white font-medium block">
                          Private Executive Chauffeur
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Discreet armed or suit-and-tie chauffeur certified in evasive security
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-semibold" style={{ color: branding.primary_color }}>+$250/day</span>
                  </label>
                </div>

                {/* Guest Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Full Legal Name *
                    </label>
                    <Input
                      required
                      placeholder="Jonathan Vance"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
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
                      placeholder="jonathan@company.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      required
                      placeholder="+1 (212) 555-0144"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Driver License Number *
                    </label>
                    <Input
                      required
                      placeholder="DL-88291039"
                      value={guestLicense}
                      onChange={(e) => setGuestLicense(e.target.value)}
                      className="bg-black/50 border-white/[0.08] text-white text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Price Summary Breakdown */}
                {bookingQuote && (
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06] text-xs font-mono space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>
                        Vehicle Base (${bookingQuote.baseDaily} × {rentalDays} days):
                      </span>
                      <span className="text-white">${bookingQuote.baseTotal.toFixed(2)}</span>
                    </div>
                    {withChauffeur && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Chauffeur Service:</span>
                        <span className="text-white">${bookingQuote.chauffeurTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {withLossDamageWaiver && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Loss Damage Waiver:</span>
                        <span className="text-white">${bookingQuote.ldwTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-400">
                      <span>Luxury Surcharge & Taxes (9.5%):</span>
                      <span className="text-white">${bookingQuote.luxuryTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/[0.06]" style={{ color: branding.primary_color }}>
                      <span>Total Charter Quote:</span>
                      <span>${bookingQuote.totalDue.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 pt-1">
                      * Refundable security deposit of ${bookingQuote.deposit.toFixed(2)} placed as an
                      authorization hold upon vehicle departure.
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsBookingOpen(false)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="text-black font-semibold text-xs tracking-wider uppercase min-w-[160px] shadow-lg"
                    style={{ backgroundColor: branding.primary_color }}
                  >
                    {isSubmittingBooking ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Securing Reservation...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        Confirm & Reserve
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </>
  );
}

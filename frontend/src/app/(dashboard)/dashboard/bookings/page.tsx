"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  RefreshCw,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  X,
  Copy,
  Check,
  DollarSign,
  Sparkles,
  Fuel,
  Info,
  ChevronRight,
  Eye,
  Filter,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { useBranding } from "@/lib/context/branding";
import { useDashboardTheme } from "@/lib/context/dashboard-theme";
import {
  getBookings,
  cancelBooking,
  confirmBooking,
  activateBooking,
  completeBooking,
  assignDriverToBooking,
} from "@/lib/api/bookings";
import { Booking, Vehicle } from "@/types";
import { cn } from "@/lib/utils";

function getVehicleImageUrl(vehicle?: Vehicle): string | null {
  if (!vehicle?.images || vehicle.images.length === 0) return null;
  const first = vehicle.images[0];
  if (typeof first === "string") return first;
  if (typeof first === "object" && first?.url) return first.url;
  return null;
}

export default function BookingsManagementPage() {
  const { token } = useAuth();
  const { isLight } = useDashboardTheme();
  let currency = "Rs.";
  try {
    const branding = useBranding();
    if (branding?.currency) currency = branding.currency;
  } catch {
    // fallback
  }

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Dispatch / Assign Chauffeur modal state
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [assignDriverName, setAssignDriverName] = useState("");
  const [assignDriverPhone, setAssignDriverPhone] = useState("");
  const [assignDriverLicense, setAssignDriverLicense] = useState("");

  const handleAssignDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsProcessing(true);
    try {
      const updated = await assignDriverToBooking(
        selectedBooking.id,
        {
          driver_name: assignDriverName.trim(),
          driver_phone: assignDriverPhone.trim(),
          driver_license: assignDriverLicense.trim(),
        },
        token || undefined
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBooking.id ? { ...b, vehicle: updated.vehicle, notes: updated.notes } : b))
      );
      setSelectedBooking(updated);
      setShowAssignDriverModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign chauffeur";
      alert(`Failed to assign driver: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBookings(undefined, token || undefined);
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCopyRef = (ref: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to cancel reservation ${booking.booking_reference}?`)) return;
    setIsProcessing(true);
    try {
      await cancelBooking(booking.id, "Cancelled by tenant concierge", token || undefined);
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b))
      );
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cancellation failed";
      alert(`Failed to cancel booking: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBooking = async (booking: Booking) => {
    setIsProcessing(true);
    try {
      const updated = await confirmBooking(booking.id, token || undefined);
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: updated.status } : b))
      );
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Confirmation failed";
      alert(`Failed to confirm booking: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateBooking = async (booking: Booking) => {
    if (!confirm(`Dispatch vehicle and activate rental for reservation ${booking.booking_reference}?`)) return;
    setIsProcessing(true);
    try {
      const updated = await activateBooking(booking.id, token || undefined);
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: updated.status } : b))
      );
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Activation failed";
      alert(`Failed to activate booking: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteBooking = async (booking: Booking) => {
    if (!confirm(`Mark reservation ${booking.booking_reference} as completed and return vehicle to available fleet?`)) return;
    setIsProcessing(true);
    try {
      const updated = await completeBooking(booking.id, token || undefined);
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: updated.status } : b))
      );
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Completion failed";
      alert(`Failed to complete booking: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const vehicleText = b.vehicle
      ? `${b.vehicle.brand} ${b.vehicle.model} ${b.vehicle.license_plate} ${b.vehicle.year}`.toLowerCase()
      : "";
    const customerText = `${b.customer?.first_name || ""} ${b.customer?.last_name || ""} ${b.customer_name || ""} ${b.customer?.email || ""} ${b.customer?.phone || ""} ${b.customer_phone || ""}`.toLowerCase();
    const routeText = `${b.pickup_location || ""} ${b.destination_location || ""} ${b.trip_type || ""}`.toLowerCase();

    const matchesSearch =
      !q ||
      b.booking_reference.toLowerCase().includes(q) ||
      vehicleText.includes(q) ||
      customerText.includes(q) ||
      routeText.includes(q) ||
      (b.notes && b.notes.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick metrics
  const totalCount = bookings.length;
  const activeOrConfirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "active").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const totalVolume = bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const totalAdvance = bookings.reduce((sum, b) => sum + (Number(b.advance_amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 md:text-3xl">
            Reservations &amp; Booking Ledger
          </h1>
          <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">
            Real-time tenant reservations with vehicle telemetry, chauffeur dispatch, and deposit tracking.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadBookings}
          className="border dark:border-white/[0.08] border-slate-200 dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 dark:bg-white/[0.03] bg-white shadow-2xs"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="dark:bg-zinc-950/60 bg-white dark:border-white/[0.08] border-slate-200 shadow-2xs p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-zinc-400 text-slate-500">Total Bookings</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold dark:text-white text-slate-900 mt-2 font-mono">
            {totalCount}
          </div>
          <span className="text-[11px] dark:text-zinc-500 text-slate-400 mt-0.5 block">Lifetime bookings</span>
        </Card>

        <Card className="dark:bg-zinc-950/60 bg-white dark:border-white/[0.08] border-slate-200 shadow-2xs p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-zinc-400 text-slate-500">Confirmed &amp; Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500 mt-2 font-mono">
            {activeOrConfirmed}
          </div>
          <span className="text-[11px] dark:text-zinc-500 text-slate-400 mt-0.5 block">Ready or on road</span>
        </Card>

        <Card className="dark:bg-zinc-950/60 bg-white dark:border-white/[0.08] border-slate-200 shadow-2xs p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-zinc-400 text-slate-500">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500 mt-2 font-mono">
            {pendingCount}
          </div>
          <span className="text-[11px] dark:text-zinc-500 text-slate-400 mt-0.5 block">Requires confirmation</span>
        </Card>

        <Card className="dark:bg-zinc-950/60 bg-white dark:border-white/[0.08] border-slate-200 shadow-2xs p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-zinc-400 text-slate-500">Booking Volume</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-primary mt-2 font-mono truncate">
            {currency} {totalVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] dark:text-zinc-500 text-slate-400 mt-0.5 block truncate">
            Advance: {currency} {totalAdvance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <Input
              placeholder="Search by vehicle (BMW, Scorpio...), customer, phone, route, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 dark:bg-black/40 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-sm dark:text-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dark:bg-black/40 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-sm dark:text-white text-slate-900"
            >
              <option value="all">All Reservation Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active Rental</option>
              <option value="pending">Pending Confirmation</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-16 text-center">
              <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm font-semibold dark:text-white text-slate-800">No reservations found</p>
              <p className="text-xs dark:text-zinc-400 text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Try clearing your search query or filter to view all reservations."
                  : "Bookings created via the public storefront will appear right here with full car and customer details."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="dark:border-white/[0.06] border-slate-100 dark:hover:bg-transparent hover:bg-transparent bg-slate-50/60 dark:bg-white/[0.02]">
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Reference</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Booked Vehicle Details</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Customer / Renter</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Schedule &amp; Route</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Status</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Financials</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((b) => {
                  const vehicleImg = getVehicleImageUrl(b.vehicle);
                  const vehicleName = b.vehicle
                    ? `${b.vehicle.year ? b.vehicle.year + " " : ""}${b.vehicle.brand} ${b.vehicle.model}`
                    : "Car info loading...";
                  const custName =
                    b.customer?.first_name || b.customer_name
                      ? `${b.customer?.first_name || ""} ${b.customer?.last_name || ""}`.trim() || b.customer_name
                      : "Direct Customer";
                  const custPhone = b.customer?.phone || b.customer_phone || "";
                  const custEmail = b.customer?.email || b.customer_email || "";
                  const advance = Number(b.advance_amount) || 0;
                  const total = Number(b.total_price) || 0;
                  const remainingDue = Math.max(0, total - advance);

                  return (
                    <TableRow
                      key={b.id}
                      className="dark:border-white/[0.06] border-slate-100 dark:hover:bg-white/[0.02] hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => setSelectedBooking(b)}
                    >
                      {/* Booking Reference */}
                      <TableCell className="align-top py-3.5">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold dark:text-white text-slate-900 block">
                            {b.booking_reference}
                          </span>
                          <span className="text-[10px] dark:text-zinc-500 text-slate-400 block font-mono">
                            {new Date(b.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {b.trip_type && (
                            <span className="inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                              {b.trip_type}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Booked Vehicle Details */}
                      <TableCell className="align-top py-3.5">
                        <div className="flex items-start gap-3">
                          <div className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 dark:bg-zinc-900 bg-slate-100 border dark:border-white/[0.08] border-slate-200">
                            {vehicleImg ? (
                              <Image
                                src={vehicleImg}
                                alt={vehicleName}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-600">
                                <Car className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-bold dark:text-white text-slate-900 block leading-snug">
                              {vehicleName}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              {b.vehicle?.license_plate && (
                                <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  {b.vehicle.license_plate}
                                </span>
                              )}
                              {b.vehicle?.transmission && (
                                <span className="capitalize dark:text-zinc-400 text-slate-500">
                                  {b.vehicle.transmission}
                                </span>
                              )}
                              {b.vehicle?.category && (
                                <>
                                  <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                                  <span className="capitalize dark:text-zinc-400 text-slate-500">
                                    {b.vehicle.category}
                                  </span>
                                </>
                              )}
                            </div>
                            {b.vehicle?.driver_included && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <User className="w-3 h-3 shrink-0" />
                                <span>Driver: {b.vehicle.driver_name || "Included"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Customer / Renter */}
                      <TableCell className="align-top py-3.5">
                        <div className="space-y-1 text-xs">
                          <span className="font-semibold dark:text-white text-slate-900 block">
                            {custName}
                          </span>
                          {custPhone && (
                            <a
                              href={`tel:${custPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{custPhone}</span>
                            </a>
                          )}
                          {custEmail && (
                            <span className="text-[10px] dark:text-zinc-500 text-slate-400 block truncate max-w-[150px]">
                              {custEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Schedule & Route */}
                      <TableCell className="align-top py-3.5">
                        <div className="text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 dark:text-zinc-300 text-slate-700">
                            <Clock className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="text-[11px] font-mono">
                              {new Date(b.pickup_datetime).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 dark:text-zinc-400 text-slate-500">
                            <span className="text-slate-400 shrink-0 font-bold">→</span>
                            <span className="text-[11px] font-mono">
                              {new Date(b.return_datetime).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {(b.pickup_location || b.destination_location) && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 pt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {b.pickup_location || "Origin"} &rarr; {b.destination_location || "Destination"}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="align-top py-3.5">
                        <StatusBadge type="booking" status={b.status} />
                      </TableCell>

                      {/* Payment & Financials */}
                      <TableCell className="align-top py-3.5">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            {currency} {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {advance > 0 && (
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 block">
                              Adv: {currency} {advance.toLocaleString()}
                            </span>
                          )}
                          {remainingDue > 0 && (
                            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 block">
                              Due: {currency} {remainingDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                          <div className="pt-0.5">
                            <StatusBadge type="payment" status={b.payment_status} />
                          </div>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-top py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedBooking(b)}
                            className="h-7 px-2 text-[11px] dark:text-zinc-300 text-slate-700 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>

                          {b.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleConfirmBooking(b)}
                              className="h-6.5 px-2 text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                            >
                              Confirm
                            </Button>
                          )}
                          {b.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleActivateBooking(b)}
                              className="h-6.5 px-2 text-[10px] border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                            >
                              Dispatch
                            </Button>
                          )}
                          {b.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleCompleteBooking(b)}
                              className="h-6.5 px-2 text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal / Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8 dark:border-white/[0.12] border-slate-200 dark:bg-zinc-950 bg-white p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 dark:text-zinc-400 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Modal Title / Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b dark:border-white/[0.08] border-slate-200 pb-4 pr-8">
                <div>
                  <span className="text-xs uppercase font-mono dark:text-zinc-500 text-slate-500">
                    Booking Dossier
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-xl font-bold font-mono dark:text-white text-slate-900">
                      {selectedBooking.booking_reference}
                    </h3>
                    <button
                      onClick={() => handleCopyRef(selectedBooking.booking_reference)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-400 dark:text-zinc-400 transition-colors"
                      title="Copy reference code"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] dark:text-zinc-400 text-slate-500">
                    Created on {new Date(selectedBooking.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge type="booking" status={selectedBooking.status} />
                  <StatusBadge type="payment" status={selectedBooking.payment_status} />
                </div>
              </div>

              {/* 1. Booked Vehicle Details Section */}
              <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Car className="w-4 h-4" />
                    Booked Vehicle Specification
                  </span>
                  {selectedBooking.vehicle?.status && (
                    <StatusBadge type="vehicle" status={selectedBooking.vehicle.status} />
                  )}
                </div>

                {selectedBooking.vehicle ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Vehicle Photo */}
                    <div className="relative aspect-video sm:aspect-square rounded-lg overflow-hidden border dark:border-white/[0.08] border-slate-200 dark:bg-zinc-900 bg-white">
                      {getVehicleImageUrl(selectedBooking.vehicle) ? (
                        <Image
                          src={getVehicleImageUrl(selectedBooking.vehicle)!}
                          alt={`${selectedBooking.vehicle.brand} ${selectedBooking.vehicle.model}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Vehicle Specs */}
                    <div className="sm:col-span-2 space-y-2 text-xs">
                      <div>
                        <h4 className="text-base font-bold dark:text-white text-slate-900">
                          {selectedBooking.vehicle.year ? `${selectedBooking.vehicle.year} ` : ""}
                          {selectedBooking.vehicle.brand} {selectedBooking.vehicle.model}
                        </h4>
                        <p className="text-[11px] dark:text-zinc-400 text-slate-500">
                          {selectedBooking.vehicle.description || "Premium chauffeured rental vehicle"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded dark:bg-white/[0.03] bg-white border dark:border-white/[0.06] border-slate-200">
                          <span className="text-[10px] text-slate-400 block">License Plate</span>
                          <span className="font-bold text-amber-500">
                            {selectedBooking.vehicle.license_plate || "N/A"}
                          </span>
                        </div>
                        <div className="p-2 rounded dark:bg-white/[0.03] bg-white border dark:border-white/[0.06] border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Transmission</span>
                          <span className="capitalize dark:text-white text-slate-900">
                            {selectedBooking.vehicle.transmission || "Automatic"}
                          </span>
                        </div>
                        <div className="p-2 rounded dark:bg-white/[0.03] bg-white border dark:border-white/[0.06] border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Category</span>
                          <span className="capitalize dark:text-white text-slate-900">
                            {selectedBooking.vehicle.category || "Sedan"}
                          </span>
                        </div>
                        <div className="p-2 rounded dark:bg-white/[0.03] bg-white border dark:border-white/[0.06] border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Fuel / Energy</span>
                          <span className="capitalize dark:text-white text-slate-900">
                            {selectedBooking.vehicle.fuel_type || "Petrol"}
                          </span>
                        </div>
                        <div className="p-2 rounded dark:bg-white/[0.03] bg-white border dark:border-white/[0.06] border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Seating</span>
                          <span className="dark:text-white text-slate-900">
                            {selectedBooking.vehicle.seats || 5} Passengers
                          </span>
                        </div>
                        <div className="p-2 rounded dark:bg-white/[0.03] bg-white border dark:border-white/[0.06] border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Daily Rate</span>
                          <span className="font-bold text-emerald-500">
                            {currency} {selectedBooking.vehicle.daily_rate}
                          </span>
                        </div>
                      </div>

                      {/* Driver Information */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                        <div className="text-[11px] leading-tight">
                          <span className="font-bold">
                            {selectedBooking.vehicle.driver_included ? "Chauffeur Included" : "Self-Drive Rental"}
                          </span>
                          {selectedBooking.vehicle.driver_included && selectedBooking.vehicle.driver_name && (
                            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                              Assigned Driver: {selectedBooking.vehicle.driver_name} ({selectedBooking.vehicle.driver_experience || "Verified"})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No vehicle attached to this reservation.</p>
                )}
              </div>

              {/* 2. Customer & Route Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Dossier */}
                <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50/70 p-4 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Customer Dossier
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Full Name:</span>
                      <span className="font-semibold dark:text-white text-slate-900">
                        {selectedBooking.customer?.first_name || selectedBooking.customer_name
                          ? `${selectedBooking.customer?.first_name || ""} ${selectedBooking.customer?.last_name || ""}`.trim() || selectedBooking.customer_name
                          : "Direct Booking"}
                      </span>
                    </div>
                    {(selectedBooking.customer?.phone || selectedBooking.customer_phone) && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <a
                          href={`tel:${selectedBooking.customer?.phone || selectedBooking.customer_phone}`}
                          className="font-mono text-primary hover:underline font-semibold"
                        >
                          {selectedBooking.customer?.phone || selectedBooking.customer_phone}
                        </a>
                      </div>
                    )}
                    {(selectedBooking.customer?.email || selectedBooking.customer_email) && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <a
                          href={`mailto:${selectedBooking.customer?.email || selectedBooking.customer_email}`}
                          className="font-mono text-slate-600 dark:text-zinc-300 hover:underline truncate max-w-[170px]"
                        >
                          {selectedBooking.customer?.email || selectedBooking.customer_email}
                        </a>
                      </div>
                    )}
                    {selectedBooking.customer?.driver_license_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">License No:</span>
                        <span className="font-mono text-[11px] dark:text-zinc-300 text-slate-700">
                          {selectedBooking.customer.driver_license_number}
                        </span>
                      </div>
                    )}
                    {selectedBooking.customer?.country && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Country:</span>
                        <span className="uppercase font-mono text-[11px] dark:text-zinc-300 text-slate-700">
                          {selectedBooking.customer.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route & Itinerary */}
                <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50/70 p-4 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Trip Itinerary &amp; Route
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trip Type:</span>
                      <span className="font-semibold capitalize text-purple-600 dark:text-purple-400">
                        {selectedBooking.trip_type || "Standard Rental"}
                      </span>
                    </div>
                    {selectedBooking.pickup_location && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pickup Location:</span>
                        <span className="font-semibold dark:text-white text-slate-900 text-right">
                          {selectedBooking.pickup_location}
                        </span>
                      </div>
                    )}
                    {selectedBooking.destination_location && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Destination:</span>
                        <span className="font-semibold dark:text-white text-slate-900 text-right">
                          {selectedBooking.destination_location}
                        </span>
                      </div>
                    )}
                    {selectedBooking.stops && selectedBooking.stops.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Waypoints:</span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-300 text-right">
                          {selectedBooking.stops.join(" &bull; ")}
                        </span>
                      </div>
                    )}
                    {selectedBooking.decoration_name && (
                      <div className="flex justify-between pt-1 border-t dark:border-white/[0.06] border-slate-200 text-pink-600 dark:text-pink-400 font-medium">
                        <span>Wedding Decor:</span>
                        <span>{selectedBooking.decoration_name} (+{currency} {selectedBooking.decoration_price})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Schedule Dates Card */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50/70 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pickup Schedule</span>
                  <span className="text-xs font-bold dark:text-white text-slate-900 mt-0.5 block">
                    {new Date(selectedBooking.pickup_datetime).toLocaleString()}
                  </span>
                  {selectedBooking.pickup_branch?.name && (
                    <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                      Branch: {selectedBooking.pickup_branch.name}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Return Schedule</span>
                  <span className="text-xs font-bold dark:text-white text-slate-900 mt-0.5 block">
                    {new Date(selectedBooking.return_datetime).toLocaleString()}
                  </span>
                  {selectedBooking.return_branch?.name && (
                    <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                      Branch: {selectedBooking.return_branch.name}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Financial Ledger Breakdown */}
              <div className="rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border dark:border-white/[0.08] border-slate-200 p-4 text-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Financial Ledger &amp; Deposit
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Rental Rate:</span>
                  <span className="font-mono dark:text-white text-slate-900 font-semibold">{currency} {selectedBooking.base_price}</span>
                </div>
                {Number(selectedBooking.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-{currency} {selectedBooking.discount_amount}</span>
                  </div>
                )}
                {Number(selectedBooking.tax_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">VAT / Tax:</span>
                    <span className="font-mono dark:text-white text-slate-900">{currency} {selectedBooking.tax_amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Deposit Held:</span>
                  <span className="font-mono dark:text-white text-slate-900 font-semibold">{currency} {selectedBooking.deposit_amount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t dark:border-white/[0.08] border-slate-200 text-sm font-bold">
                  <span className="dark:text-white text-slate-900">Total Charged:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{currency} {Number(selectedBooking.total_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                {/* Advance vs Remaining */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-white/[0.08] border-slate-200 text-[11px] font-mono">
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <span className="block text-[10px] uppercase">Advance Deposit Paid</span>
                    <span className="font-bold text-xs">{currency} {Number(selectedBooking.advance_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <span className="block text-[10px] uppercase">Balance Due to Collect</span>
                    <span className="font-bold text-xs">
                      {currency} {Math.max(0, Number(selectedBooking.total_price) - Number(selectedBooking.advance_amount || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Notes */}
              {selectedBooking.notes && (
                <div className="text-xs space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-mono block">VIP Concierge / Customer Notes:</span>
                  <p className="rounded-lg dark:bg-black/40 bg-slate-50 border dark:border-white/[0.08] border-slate-200 p-3 text-slate-700 dark:text-zinc-300 font-mono text-[11px] leading-relaxed">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* 6. Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t dark:border-white/[0.08] border-slate-200">
                {selectedBooking.status === "pending" && (
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleConfirmBooking(selectedBooking)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-semibold"
                  >
                    Confirm Reservation
                  </Button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleActivateBooking(selectedBooking)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-xs font-semibold"
                  >
                    Dispatch Vehicle
                  </Button>
                )}
                {selectedBooking.status === "active" && (
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleCompleteBooking(selectedBooking)}
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-xs font-semibold"
                  >
                    Complete &amp; Return Vehicle
                  </Button>
                )}
                {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleCancelBooking(selectedBooking)}
                    className="text-xs font-semibold"
                  >
                    Cancel Reservation
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => {
                    setAssignDriverName(selectedBooking.vehicle?.driver_name || "");
                    setAssignDriverPhone((selectedBooking.vehicle as any)?.driver_phone || "");
                    setAssignDriverLicense("");
                    setShowAssignDriverModal(true);
                  }}
                  className="text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold"
                >
                  Assign Chauffeur
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                  className="text-xs dark:border-white/[0.1] border-slate-200 dark:text-zinc-300 text-slate-700"
                >
                  Close Dossier
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Assign Driver Modal Dialog */}
      {showAssignDriverModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold dark:text-white text-slate-900">
                  Assign / Dispatch Chauffeur
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Reservation {selectedBooking.booking_reference} &bull; {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignDriverModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignDriverSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Chauffeur Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Rohan Kharel"
                  value={assignDriverName}
                  onChange={(e) => setAssignDriverName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Chauffeur Contact Phone
                </label>
                <Input
                  placeholder="e.g. +977 9841234567"
                  value={assignDriverPhone}
                  onChange={(e) => setAssignDriverPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  License Number / Badge ID
                </label>
                <Input
                  placeholder="e.g. DL-01-998822"
                  value={assignDriverLicense}
                  onChange={(e) => setAssignDriverLicense(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssignDriverModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing || !assignDriverName.trim()}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {isProcessing ? "Assigning..." : "Confirm Chauffeur Dispatch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

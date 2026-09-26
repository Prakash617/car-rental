"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Clock,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getBookings,
  cancelBooking,
  confirmBooking,
  activateBooking,
  completeBooking,
} from "@/lib/api/bookings";
import { Booking } from "@/types";

export default function BookingsManagementPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const loadBookings = useCallback(async () => {
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

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to cancel reservation ${booking.booking_reference}?`)) return;
    setIsProcessing(true);
    try {
      const updated = await cancelBooking(booking.id, "Cancelled by tenant concierge", token || undefined);
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
    const matchesSearch =
      b.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Reservations Ledger
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Audit customer check-ins, security deposits, and contract scheduling.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadBookings}
          className="border-white/[0.08] text-zinc-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by reference (e.g. BK-APEX-8801) or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/40 border-white/[0.08] text-sm text-white"
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/40 border-white/[0.08] text-sm text-white"
            >
              <option value="all">All Reservation Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active Rental</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No reservations found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs">Reference</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Pickup / Return Schedule</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Rental Status</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Payment Ledger</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Total Amount</TableHead>
                  <TableHead className="text-zinc-400 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((b) => (
                  <TableRow
                    key={b.id}
                    className="border-white/[0.06] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => setSelectedBooking(b)}
                  >
                    {/* Booking Reference */}
                    <TableCell>
                      <div>
                        <span className="font-mono text-xs font-bold text-white block">
                          {b.booking_reference}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Created {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>

                    {/* Schedule */}
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Clock className="h-3 w-3 text-emerald-400" />
                          <span>
                            {new Date(b.pickup_datetime).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                          <span className="text-zinc-600">→</span>
                          <span>
                            {new Date(b.return_datetime).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge type="booking" status={b.status} />
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <div className="space-y-1">
                        <StatusBadge type="payment" status={b.payment_status} />
                        <span className="text-[10px] text-zinc-500 block">
                          Deposit: ${Number(b.deposit_amount).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>

                    {/* Total Price */}
                    <TableCell>
                      <span className="font-mono text-sm font-bold text-emerald-400 block">
                        ${Number(b.total_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Base: ${b.base_price}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() => handleConfirmBooking(b)}
                            className="h-7 px-2 text-[11px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
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
                            className="h-7 px-2 text-[11px] border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
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
                            className="h-7 px-2 text-[11px] border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                          >
                            Return
                          </Button>
                        )}
                        {(b.status === "pending" || b.status === "confirmed") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isProcessing}
                            onClick={() => handleCancelBooking(b)}
                            className="h-7 px-2 text-[11px] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full border-white/[0.12] bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase font-mono text-zinc-500">Reservation Details</span>
                <h3 className="text-xl font-bold font-mono text-white">
                  {selectedBooking.booking_reference}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/[0.08]">
                <div>
                  <span className="text-zinc-500 block">Rental Status</span>
                  <div className="mt-1">
                    <StatusBadge type="booking" status={selectedBooking.status} />
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block">Payment Status</span>
                  <div className="mt-1">
                    <StatusBadge type="payment" status={selectedBooking.payment_status} />
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block">Pickup Date & Time</span>
                  <span className="font-mono text-zinc-200 mt-1 block">
                    {new Date(selectedBooking.pickup_datetime).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Return Date & Time</span>
                  <span className="font-mono text-zinc-200 mt-1 block">
                    {new Date(selectedBooking.return_datetime).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Base Rental Rate:</span>
                  <span className="font-mono text-white">${selectedBooking.base_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Security Deposit:</span>
                  <span className="font-mono text-white">${selectedBooking.deposit_amount}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/[0.06] font-bold">
                  <span className="text-zinc-300">Total Charged:</span>
                  <span className="font-mono text-emerald-400">${selectedBooking.total_price}</span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="text-xs">
                  <span className="text-zinc-500 block mb-1">VIP Concierge Notes:</span>
                  <p className="rounded bg-black/40 border border-white/[0.08] p-2.5 text-zinc-300 font-mono text-[11px]">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                {selectedBooking.status === "pending" && (
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleConfirmBooking(selectedBooking)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Confirm Reservation
                  </Button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleActivateBooking(selectedBooking)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Dispatch Vehicle
                  </Button>
                )}
                {selectedBooking.status === "active" && (
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleCompleteBooking(selectedBooking)}
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    Complete & Return
                  </Button>
                )}
                {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleCancelBooking(selectedBooking)}
                    className="text-xs"
                  >
                    Cancel Booking
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                  className="text-xs border-white/[0.1] text-zinc-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

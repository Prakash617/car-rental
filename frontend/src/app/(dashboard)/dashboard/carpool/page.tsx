"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Route,
  Search,
  RefreshCw,
  Plus,
  Users,
  MapPin,
  Calendar,
  Clock,
  Car,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
  Check,
  X,
  Share2,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { useDashboardTheme } from "@/lib/context/dashboard-theme";
import {
  getCarpoolRides,
  getCarpoolRequests,
  getCarpoolSubscriptions,
  updateCarpoolRequestStatus,
  updateCarpoolRideStatus,
  deleteCarpoolRide,
  publishCarpoolRide,
} from "@/lib/api/carpool";
import { CarpoolRide, CarpoolBookingRequest, CarpoolAlertSubscription } from "@/types";
import { cn } from "@/lib/utils";

export default function CarpoolDashboardPage() {
  const { token } = useAuth();
  const { isLight } = useDashboardTheme();

  const [activeTab, setActiveTab] = useState<"rides" | "requests" | "subscriptions">("rides");

  // State
  const [rides, setRides] = useState<CarpoolRide[]>([]);
  const [requests, setRequests] = useState<CarpoolBookingRequest[]>([]);
  const [subscriptions, setSubscriptions] = useState<CarpoolAlertSubscription[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Publish Modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({
    origin_city: "Kathmandu",
    origin_point: "Kalanki Chowk",
    destination_city: "Pokhara",
    destination_point: "Prithvi Chowk / Lakeside",
    departure_datetime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    vehicle_model: "Toyota EV HiAce Super Long",
    vehicle_type: "EV Hiace",
    total_seats: 11,
    price_per_seat: 950,
    driver_name: "Rameshwor Thapa",
    driver_phone: "+977 9841238910",
    features: "AC, Direct Route, EV Zero Emission, USB Chargers",
    notes: "Comfortable air-conditioned intercity transit.",
  });
  const [publishSuccess, setPublishSuccess] = useState("");
  const [publishError, setPublishError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ridesData, requestsData, subsData] = await Promise.all([
        getCarpoolRides({ all: true }, token || undefined).catch(() => []),
        getCarpoolRequests({}, token || undefined).catch(() => []),
        getCarpoolSubscriptions(token || undefined).catch(() => []),
      ]);
      setRides(ridesData);
      setRequests(requestsData);
      setSubscriptions(subsData);
    } catch (err) {
      console.error("Failed to load carpool dashboard data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Status changes for requests
  const handleRequestStatusChange = async (
    reqId: string,
    newStatus: "pending" | "approved" | "rejected" | "cancelled"
  ) => {
    setActionLoadingId(reqId);
    try {
      const updated = await updateCarpoolRequestStatus(reqId, newStatus, token || undefined);
      setRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: updated.status } : r)));
      // Re-fetch rides to sync seat counts
      const freshRides = await getCarpoolRides({ all: true }, token || undefined);
      setRides(freshRides);
    } catch (err) {
      console.error("Error updating request status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Status changes for rides
  const handleRideStatusChange = async (
    rideId: string,
    newStatus: "active" | "full" | "completed" | "cancelled"
  ) => {
    setActionLoadingId(rideId);
    try {
      const updated = await updateCarpoolRideStatus(rideId, newStatus, token || undefined);
      setRides((prev) => prev.map((r) => (r.id === rideId ? { ...r, status: updated.status } : r)));
    } catch (err) {
      console.error("Error updating ride status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete ride
  const handleDeleteRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to delete this carpool departure?")) return;
    setActionLoadingId(rideId);
    try {
      await deleteCarpoolRide(rideId, token || undefined);
      setRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (err) {
      console.error("Error deleting ride:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle publishing a new ride
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishError("");
    setPublishSuccess("");

    try {
      const featArray = publishForm.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const created = await publishCarpoolRide(
        {
          origin_city: publishForm.origin_city.trim(),
          origin_point: publishForm.origin_point.trim(),
          destination_city: publishForm.destination_city.trim(),
          destination_point: publishForm.destination_point.trim(),
          departure_datetime: new Date(publishForm.departure_datetime).toISOString(),
          vehicle_model: publishForm.vehicle_model.trim(),
          vehicle_type: publishForm.vehicle_type.trim(),
          total_seats: Number(publishForm.total_seats) || 4,
          available_seats: Number(publishForm.total_seats) || 4,
          price_per_seat: Number(publishForm.price_per_seat) || 1000,
          driver_name: publishForm.driver_name.trim(),
          driver_phone: publishForm.driver_phone.trim(),
          features: featArray,
          notes: publishForm.notes.trim(),
        },
        token || undefined
      );

      setRides((prev) => [created, ...prev]);
      setPublishSuccess("Shared ride published successfully!");
      setTimeout(() => {
        setShowPublishModal(false);
        setPublishSuccess("");
      }, 1500);
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish departure.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Pre-fill from subscription
  const handlePrefillFromSub = (sub: CarpoolAlertSubscription) => {
    setPublishForm((prev) => ({
      ...prev,
      origin_city: sub.origin_city,
      origin_point: `${sub.origin_city} Main Station`,
      destination_city: sub.destination_city,
      destination_point: `${sub.destination_city} Central`,
      departure_datetime: sub.preferred_date
        ? `${sub.preferred_date}T07:00`
        : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    }));
    setShowPublishModal(true);
  };

  // Filtering
  const filteredRides = rides.filter((r) => {
    const matchesSearch =
      r.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driver_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequests = requests.filter((req) => {
    return (
      req.passenger_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.passenger_phone.includes(searchQuery) ||
      (req.passenger_email && req.passenger_email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredSubs = subscriptions.filter((sub) => {
    return (
      sub.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.destination_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.phone.includes(searchQuery)
    );
  });

  const activeRidesCount = rides.filter((r) => r.status === "active").length;
  const pendingRequestsCount = requests.filter((r) => r.status === "approved" || r.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 md:text-3xl">
              Carpool &amp; Shared Rides
            </h1>
            <span className="rounded-md border dark:border-emerald-500/30 border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Sajilo Engine
            </span>
          </div>
          <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">
            Dispatch Nepal intercity shared routes, monitor passenger seat bookings, and fulfill route alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-100 dark:text-zinc-300 text-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setShowPublishModal(true)}
            className="bg-primary text-black font-semibold hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Publish Departure
          </Button>

          <Link href="/carpool" target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Live Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="dark:border-white/[0.08] border-slate-200 p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              title="Active Departures"
              value={activeRidesCount}
              subtitle={`${rides.length} total rides scheduled`}
              icon={Route}
              highlight
            />
            <MetricCard
              title="Seat Bookings"
              value={requests.length}
              subtitle={`${pendingRequestsCount} active passenger reservations`}
              icon={Users}
            />
            <MetricCard
              title="Route Alert Subscriptions"
              value={subscriptions.length}
              subtitle="Demand awaiting vehicle dispatch"
              icon={Compass}
            />
            <MetricCard
              title="Verified Drivers"
              value={new Set(rides.map((r) => r.driver_name)).size}
              subtitle="Nepal highway certified hosts"
              icon={ShieldCheck}
            />
          </>
        )}
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b dark:border-white/[0.08] border-slate-200 pb-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("rides")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors",
              activeTab === "rides"
                ? "bg-primary text-black shadow-xs"
                : "dark:text-zinc-400 text-slate-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
            )}
          >
            <Route className="h-4 w-4" />
            <span>Departures</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-black/15 text-black font-mono">
              {rides.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors",
              activeTab === "requests"
                ? "bg-primary text-black shadow-xs"
                : "dark:text-zinc-400 text-slate-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Seat Requests</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-black/15 text-black font-mono">
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("subscriptions")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors",
              activeTab === "subscriptions"
                ? "bg-primary text-black shadow-xs"
                : "dark:text-zinc-400 text-slate-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
            )}
          >
            <Compass className="h-4 w-4" />
            <span>Route Alerts</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-black/15 text-black font-mono">
              {subscriptions.length}
            </span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route, city, name..."
              className="pl-9 h-9 text-xs dark:bg-white/[0.03] bg-white dark:border-white/[0.08] border-slate-200"
            />
          </div>

          {activeTab === "rides" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md text-xs px-2.5 border dark:border-white/[0.08] border-slate-200 dark:bg-zinc-900 bg-white dark:text-zinc-300 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="full">Full</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. DEPARTURES TABLE */}
      {activeTab === "rides" && (
        <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold dark:text-white text-slate-900">
              Published Intercity Departures
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                No carpool departures found matching criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-white/[0.06] border-slate-100 hover:bg-transparent bg-slate-50/70 dark:bg-white/[0.02]">
                    <TableHead className="text-xs font-semibold">Route &amp; Points</TableHead>
                    <TableHead className="text-xs font-semibold">Departure Time</TableHead>
                    <TableHead className="text-xs font-semibold">Vehicle &amp; Driver</TableHead>
                    <TableHead className="text-xs font-semibold">Seat Occupancy</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Fare / Seat</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRides.map((ride) => (
                    <TableRow key={ride.id} className="dark:border-white/[0.06] border-slate-100">
                      <TableCell>
                        <div className="font-semibold text-xs dark:text-white text-slate-900 flex items-center gap-1.5">
                          <span>{ride.origin_city}</span>
                          <span className="text-primary font-mono">→</span>
                          <span>{ride.destination_city}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-xs mt-0.5">
                          {ride.origin_point} → {ride.destination_point}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono dark:text-zinc-300 text-slate-700 whitespace-nowrap">
                        {new Date(ride.departure_datetime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(ride.departure_datetime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium dark:text-zinc-200 text-slate-800">
                          {ride.vehicle_model}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <span>{ride.driver_name}</span>
                          <span>•</span>
                          <span className="font-mono">{ride.driver_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-mono font-semibold dark:text-white text-slate-900">
                            {ride.available_seats} / {ride.total_seats} left
                          </div>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold",
                              ride.available_seats === 0
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-emerald-500/10 text-emerald-500"
                            )}
                          >
                            {ride.available_seats === 0 ? "Full" : "Available"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        NPR {Number(ride.price_per_seat).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize",
                            ride.status === "active" && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                            ride.status === "full" && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                            ride.status === "completed" && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                            ride.status === "cancelled" && "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          )}
                        >
                          {ride.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ride.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRideStatusChange(ride.id, "full")}
                              disabled={actionLoadingId === ride.id}
                              className="h-7 text-[11px] px-2 text-amber-600 border-amber-500/20 hover:bg-amber-500/10"
                            >
                              Mark Full
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRideStatusChange(ride.id, "active")}
                              disabled={actionLoadingId === ride.id}
                              className="h-7 text-[11px] px-2 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10"
                            >
                              Activate
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRideStatusChange(ride.id, "completed")}
                            disabled={actionLoadingId === ride.id || ride.status === "completed"}
                            className="h-7 text-[11px] px-2 text-blue-600 border-blue-500/20 hover:bg-blue-500/10"
                          >
                            Complete
                          </Button>

                          <button
                            onClick={() => handleDeleteRide(ride.id)}
                            disabled={actionLoadingId === ride.id}
                            title="Delete departure"
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2. SEAT BOOKING REQUESTS TABLE */}
      {activeTab === "requests" && (
        <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold dark:text-white text-slate-900">
              Passenger Seat Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                No passenger seat booking requests recorded.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-white/[0.06] border-slate-100 hover:bg-transparent bg-slate-50/70 dark:bg-white/[0.02]">
                    <TableHead className="text-xs font-semibold">Passenger</TableHead>
                    <TableHead className="text-xs font-semibold">Route &amp; Departure</TableHead>
                    <TableHead className="text-xs font-semibold">Pickup / Dropoff</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Seats</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total Fare</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id} className="dark:border-white/[0.06] border-slate-100">
                      <TableCell>
                        <div className="font-semibold text-xs dark:text-white text-slate-900">
                          {req.passenger_name}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${req.passenger_phone}`} className="hover:text-primary">
                            {req.passenger_phone}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {req.ride_details ? (
                          <>
                            <div className="text-xs font-medium dark:text-zinc-200 text-slate-800">
                              {req.ride_details.origin_city} → {req.ride_details.destination_city}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {new Date(req.ride_details.departure_datetime).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              {new Date(req.ride_details.departure_datetime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-400 font-mono">Ride #{req.ride.slice(0, 8)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-600 dark:text-zinc-300">
                        <div>
                          <span className="text-zinc-400 font-medium">From:</span> {req.pickup_point || "Central"}
                        </div>
                        <div>
                          <span className="text-zinc-400 font-medium">To:</span> {req.dropoff_point || "Central"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs dark:text-white text-slate-900">
                        {req.seats_requested}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        NPR {Number(req.total_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize",
                            req.status === "approved" && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                            req.status === "pending" && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                            req.status === "cancelled" && "bg-rose-500/10 text-rose-500 border border-rose-500/20",
                            req.status === "rejected" && "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          )}
                        >
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestStatusChange(req.id, "approved")}
                              disabled={actionLoadingId === req.id}
                              className="h-7 text-[11px] px-2 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10"
                            >
                              Approve
                            </Button>
                          )}
                          {req.status !== "cancelled" && req.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestStatusChange(req.id, "cancelled")}
                              disabled={actionLoadingId === req.id}
                              className="h-7 text-[11px] px-2 text-rose-600 border-rose-500/20 hover:bg-rose-500/10"
                            >
                              Cancel
                            </Button>
                          )}
                          <a
                            href={`https://wa.me/${req.passenger_phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. ROUTE ALERT SUBSCRIPTIONS TABLE */}
      {activeTab === "subscriptions" && (
        <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold dark:text-white text-slate-900">
              Customer Route Alert Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredSubs.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                No route alert subscriptions on file.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-white/[0.06] border-slate-100 hover:bg-transparent bg-slate-50/70 dark:bg-white/[0.02]">
                    <TableHead className="text-xs font-semibold">Desired Route</TableHead>
                    <TableHead className="text-xs font-semibold">Preferred Date</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Seats Needed</TableHead>
                    <TableHead className="text-xs font-semibold">Contact Info</TableHead>
                    <TableHead className="text-xs font-semibold">Subscribed At</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubs.map((sub) => (
                    <TableRow key={sub.id} className="dark:border-white/[0.06] border-slate-100">
                      <TableCell>
                        <div className="font-semibold text-xs dark:text-white text-slate-900 flex items-center gap-1.5">
                          <span>{sub.origin_city}</span>
                          <span className="text-primary font-mono">→</span>
                          <span>{sub.destination_city}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono dark:text-zinc-300 text-slate-700">
                        {sub.preferred_date || "Flexible / Any Date"}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs dark:text-white text-slate-900">
                        {sub.passenger_count}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono dark:text-zinc-200 text-slate-800">
                          <a href={`tel:${sub.phone}`} className="hover:text-primary">
                            {sub.phone}
                          </a>
                        </div>
                        {sub.email && (
                          <div className="text-[11px] text-zinc-500 truncate max-w-xs">{sub.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-zinc-500">
                        {new Date(sub.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handlePrefillFromSub(sub)}
                          className="h-7 text-[11px] px-2.5 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Publish For This Route
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* PUBLISH DEPARTURE MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border dark:border-white/[0.1] border-slate-200 dark:bg-zinc-950 bg-white p-6 shadow-2xl my-8">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold dark:text-white text-slate-900">
                Publish New Intercity Departure
              </h2>
              <p className="text-xs dark:text-zinc-400 text-slate-500 mt-0.5">
                Post an official shared travel ride available for booking across Nepal.
              </p>
            </div>

            {publishSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{publishSuccess}</span>
              </div>
            )}

            {publishError && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{publishError}</span>
              </div>
            )}

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Origin City
                  </label>
                  <Input
                    value={publishForm.origin_city}
                    onChange={(e) => setPublishForm({ ...publishForm, origin_city: e.target.value })}
                    required
                    placeholder="Kathmandu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Origin Pickup Point
                  </label>
                  <Input
                    value={publishForm.origin_point}
                    onChange={(e) => setPublishForm({ ...publishForm, origin_point: e.target.value })}
                    required
                    placeholder="Kalanki Chowk / Ring Road"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Destination City
                  </label>
                  <Input
                    value={publishForm.destination_city}
                    onChange={(e) => setPublishForm({ ...publishForm, destination_city: e.target.value })}
                    required
                    placeholder="Pokhara"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Destination Dropoff Point
                  </label>
                  <Input
                    value={publishForm.destination_point}
                    onChange={(e) => setPublishForm({ ...publishForm, destination_point: e.target.value })}
                    required
                    placeholder="Prithvi Chowk / Lakeside"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Departure Date &amp; Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={publishForm.departure_datetime}
                    onChange={(e) => setPublishForm({ ...publishForm, departure_datetime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Price per Seat (NPR)
                  </label>
                  <Input
                    type="number"
                    value={publishForm.price_per_seat}
                    onChange={(e) => setPublishForm({ ...publishForm, price_per_seat: Number(e.target.value) })}
                    required
                    placeholder="950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Vehicle Model
                  </label>
                  <Input
                    value={publishForm.vehicle_model}
                    onChange={(e) => setPublishForm({ ...publishForm, vehicle_model: e.target.value })}
                    required
                    placeholder="Toyota EV HiAce Super Long"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Total Available Seats
                  </label>
                  <Input
                    type="number"
                    value={publishForm.total_seats}
                    onChange={(e) => setPublishForm({ ...publishForm, total_seats: Number(e.target.value) })}
                    required
                    placeholder="11"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Driver Full Name
                  </label>
                  <Input
                    value={publishForm.driver_name}
                    onChange={(e) => setPublishForm({ ...publishForm, driver_name: e.target.value })}
                    required
                    placeholder="Rameshwor Thapa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Driver Phone Number
                  </label>
                  <Input
                    value={publishForm.driver_phone}
                    onChange={(e) => setPublishForm({ ...publishForm, driver_phone: e.target.value })}
                    required
                    placeholder="+977 9841238910"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Features (comma separated)
                </label>
                <Input
                  value={publishForm.features}
                  onChange={(e) => setPublishForm({ ...publishForm, features: e.target.value })}
                  placeholder="AC, EV Zero Emission, USB Chargers, Fast Route"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Trip Notes / Pickup Instructions
                </label>
                <Input
                  value={publishForm.notes}
                  onChange={(e) => setPublishForm({ ...publishForm, notes: e.target.value })}
                  placeholder="Report 15 minutes before departure. Baggage included."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-white/[0.08] border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPublishModal(false)}
                  disabled={isPublishing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPublishing}
                  className="bg-primary text-black font-semibold hover:bg-primary/90"
                >
                  {isPublishing ? "Publishing..." : "Publish Departure"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

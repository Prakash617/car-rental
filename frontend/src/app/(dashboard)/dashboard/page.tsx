"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  DollarSign,
  CalendarCheck,
  Wrench,
  ArrowUpRight,
  RefreshCw,
  Palette,
  ExternalLink,
  ShieldCheck,
  Route,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { getDashboardOverview } from "@/lib/api/dashboard";
import { getBookings } from "@/lib/api/bookings";
import { getVehicles } from "@/lib/api/vehicles";
import { Booking, DashboardOverview, Vehicle } from "@/types";

export default function DashboardOverviewPage() {
  const { token, tenantDomain } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Resolve active tenant domain
  let queryTenant: string | null = null;
  if (typeof window !== "undefined") {
    queryTenant = new URLSearchParams(window.location.search).get("tenant");
  }
  const activeTenant = queryTenant || tenantDomain || "superbang.localhost";
  const cleanDomain = activeTenant.replace(/:\d+$/, "");
  const tenantHost = `${cleanDomain}:3000`;
  const storefrontUrl = `http://${cleanDomain}:3000`;

  const loadData = useCallback(async () => {
    try {
      const [overviewData, bookingsData, vehiclesData] = await Promise.all([
        getDashboardOverview(token || undefined, tenantHost).catch(() => null),
        getBookings(undefined, token || undefined, tenantHost).catch(() => []),
        getVehicles(undefined, token || undefined, tenantHost).catch(() => []),
      ]);

      if (overviewData) setOverview(overviewData);
      setRecentBookings(bookingsData.slice(0, 5));
      setVehicles(vehiclesData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, tenantHost]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const totalFleet = overview?.fleet_total ?? vehicles.length;
  const availableFleet = overview?.fleet_available ?? vehicles.filter(v => v.status === "available").length;
  const rentedFleet = overview?.fleet_rented ?? 0;
  const maintenanceFleet = overview?.fleet_in_maintenance ?? 0;
  const monthlyRevenue = overview?.revenue_this_month !== undefined ? Number(overview.revenue_this_month) : 0;
  const activeBookings = overview?.bookings_active ?? recentBookings.length;
  const pendingBookings = overview?.bookings_pending ?? 0;
  const carpoolRoutes = overview?.carpool_active_rides ?? 0;
  const carpoolRequests = overview?.carpool_total_requests ?? 0;

  return (
    <div className="space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 md:text-3xl">
              Operations Control
            </h1>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-500 font-medium">
              {cleanDomain}
            </span>
          </div>
          <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">
            Real-time fleet telemetry, bookings ledger, and schema-isolated multi-tenant operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-100 dark:text-zinc-300 text-slate-700 dark:hover:bg-white/[0.06] hover:bg-slate-200 dark:hover:text-white hover:text-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href={`/dashboard/theme?tenant=${cleanDomain}`}>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Palette className="h-3.5 w-3.5 mr-1.5" />
              Theme Engine
            </Button>
          </Link>

          <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-primary text-black font-semibold hover:bg-primary/90">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View Storefront
            </Button>
          </a>
        </div>
      </div>

      {/* Host Vehicle Approvals Alert Banner */}
      {(() => {
        const pendingHost = vehicles.filter(
          (v) => v.status === "pending_approval" || v.is_verified === false
        );
        if (pendingHost.length === 0) return null;

        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border dark:border-amber-500/30 border-amber-300 dark:bg-amber-500/10 bg-amber-50 p-4 dark:text-amber-200 text-amber-950 shadow-md dark:shadow-amber-500/5 shadow-amber-500/10">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl dark:bg-amber-500/20 bg-amber-100 text-amber-600 dark:text-amber-400 shrink-0 border dark:border-amber-500/30 border-amber-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm dark:text-white text-slate-900">
                    {pendingHost.length} Host Vehicle Application{pendingHost.length > 1 ? "s" : ""} Awaiting Review &amp; Approval
                  </p>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full dark:bg-amber-500/20 bg-amber-200 dark:text-amber-300 text-amber-900 border dark:border-amber-500/30 border-amber-300 uppercase">
                    Review Required
                  </span>
                </div>
                <p className="text-xs dark:text-amber-300/80 text-amber-900/80 mt-0.5">
                  Vehicles submitted by owners on your public portal require your verification and approval before going live in the fleet.
                </p>
              </div>
            </div>
            <Link href={`/dashboard/fleet?status=pending_approval&tenant=${cleanDomain}`}>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shrink-0 shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Review Submissions ({pendingHost.length})
              </Button>
            </Link>
          </div>
        );
      })()}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              title="Fleet Size"
              value={totalFleet}
              subtitle={`${availableFleet} available for dispatch`}
              icon={Car}
              highlight
            />
            <MetricCard
              title="Monthly Revenue"
              value={`$${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              subtitle="From verified bookings"
              icon={DollarSign}
              trend={{ value: "+0.0%", isPositive: true }}
            />
            <MetricCard
              title="Active Bookings"
              value={activeBookings}
              subtitle={`${pendingBookings} pending check-in`}
              icon={CalendarCheck}
            />
            <MetricCard
              title="Carpool Routes"
              value={carpoolRoutes}
              subtitle={`${carpoolRequests} seat requests`}
              icon={Route}
            />
            <MetricCard
              title="Fleet Health"
              value={`${totalFleet - maintenanceFleet}/${totalFleet || 1}`}
              subtitle="0 overdue maintenance jobs"
              icon={Wrench}
            />
          </>
        )}
      </div>

      {/* Middle Two-Column Grid: Reservations & Fleet Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Recent Bookings Table (2 cols) */}
        <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs backdrop-blur-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold dark:text-white text-slate-900">
                Recent Reservations
              </CardTitle>
              <p className="text-xs dark:text-zinc-400 text-slate-500 mt-0.5">
                Current bookings managed across all tenant depot hubs.
              </p>
            </div>
            <Link
              href={`/dashboard/bookings?tenant=${cleanDomain}`}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No active bookings found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-white/[0.06] border-slate-100 hover:bg-transparent bg-slate-50/70 dark:bg-white/[0.02]">
                    <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Reference</TableHead>
                    <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Dates</TableHead>
                    <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Status</TableHead>
                    <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Payment</TableHead>
                    <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((bk) => (
                    <TableRow key={bk.id} className="dark:border-white/[0.06] border-slate-100 dark:hover:bg-white/[0.02] hover:bg-slate-50/80">
                      <TableCell className="font-mono text-xs font-semibold dark:text-white text-slate-900">
                        {bk.booking_reference}
                      </TableCell>
                      <TableCell className="text-xs dark:text-zinc-300 text-slate-700 font-mono">
                        {new Date(bk.pickup_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" → "}
                        {new Date(bk.return_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="booking" status={bk.status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="payment" status={bk.payment_status} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ${Number(bk.total_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Right: Fleet Health & Quick Controls */}
        <div className="space-y-6">
          {/* Fleet Status Breakdown */}
          <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold dark:text-white text-slate-900">
                Fleet Distribution
              </CardTitle>
              <p className="text-xs dark:text-zinc-400 text-slate-500 mt-0.5">
                Real-time allocation across tenant branches.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="dark:text-zinc-300 text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Available Fleet
                  </span>
                  <span className="font-mono dark:text-white text-slate-900 font-semibold">{availableFleet}</span>
                </div>
                <div className="h-1.5 w-full rounded-full dark:bg-zinc-800 bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(availableFleet / totalFleet) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="dark:text-zinc-300 text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    On Active Rental
                  </span>
                  <span className="font-mono dark:text-white text-slate-900 font-semibold">{rentedFleet}</span>
                </div>
                <div className="h-1.5 w-full rounded-full dark:bg-zinc-800 bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(rentedFleet / totalFleet) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="dark:text-zinc-300 text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Service &amp; Inspection
                  </span>
                  <span className="font-mono dark:text-white text-slate-900 font-semibold">{maintenanceFleet}</span>
                </div>
                <div className="h-1.5 w-full rounded-full dark:bg-zinc-800 bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(maintenanceFleet / totalFleet) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t dark:border-white/[0.08] border-slate-100">
                <Link href={`/dashboard/fleet?tenant=${cleanDomain}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs dark:border-white/[0.08] border-slate-200 dark:hover:bg-white/[0.05] hover:bg-slate-100 dark:text-zinc-300 text-slate-700">
                    Manage Fleet Inventory
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold dark:text-white text-slate-900">
                Tenant Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/fleet?tenant=${cleanDomain}`} className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg border dark:border-white/[0.06] border-slate-200 dark:bg-white/[0.02] bg-slate-50 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Car className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium dark:text-zinc-200 text-slate-800">Switch Vehicle Status</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </Link>

              <Link href={`/dashboard/carpool?tenant=${cleanDomain}`} className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg border dark:border-white/[0.06] border-slate-200 dark:bg-white/[0.02] bg-slate-50 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Route className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium dark:text-zinc-200 text-slate-800">Manage Carpool &amp; Rides</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </Link>

              <Link href={`/dashboard/theme?tenant=${cleanDomain}`} className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg border dark:border-white/[0.06] border-slate-200 dark:bg-white/[0.02] bg-slate-50 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-medium dark:text-zinc-200 text-slate-800">Live Branding Engine</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </Link>

              <Link href={`/dashboard/customers?tenant=${cleanDomain}`} className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg border dark:border-white/[0.06] border-slate-200 dark:bg-white/[0.02] bg-slate-50 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium dark:text-zinc-200 text-slate-800">Verify Driver Licenses</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

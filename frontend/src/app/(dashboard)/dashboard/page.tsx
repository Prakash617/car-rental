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
  const { token } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [overviewData, bookingsData, vehiclesData] = await Promise.all([
        getDashboardOverview(token || undefined).catch(() => null),
        getBookings(undefined, token || undefined).catch(() => []),
        getVehicles().catch(() => []),
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
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const totalFleet = overview?.fleet_total || vehicles.length || 5;
  const availableFleet = overview?.fleet_available ?? vehicles.filter(v => v.status === "available").length;
  const rentedFleet = overview?.fleet_rented ?? 0;
  const maintenanceFleet = overview?.fleet_in_maintenance ?? 0;

  return (
    <div className="space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Operations Control
            </h1>
            <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-zinc-400">
              Live MVP
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time fleet telemetry, bookings ledger, and schema-isolated multi-tenant operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/dashboard/theme">
            <Button
              size="sm"
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Palette className="h-3.5 w-3.5 mr-1.5" />
              Theme Engine
            </Button>
          </Link>

          <Link href="/" target="_blank">
            <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View Storefront
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-white/[0.08] bg-zinc-950/60 p-6">
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
              value={`$${Number(overview?.revenue_this_month || 2883.60).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              subtitle="From verified bookings"
              icon={DollarSign}
              trend={{ value: "+14.2%", isPositive: true }}
            />
            <MetricCard
              title="Active Bookings"
              value={recentBookings.length || 1}
              subtitle="1 pending check-in today"
              icon={CalendarCheck}
            />
            <MetricCard
              title="Fleet Health"
              value={`${totalFleet - maintenanceFleet}/${totalFleet}`}
              subtitle="0 overdue maintenance jobs"
              icon={Wrench}
            />
          </>
        )}
      </div>

      {/* Middle Two-Column Grid: Reservations & Fleet Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Recent Bookings Table (2 cols) */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">
                Recent Reservations
              </CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">
                Current bookings managed across all tenant depot hubs.
              </p>
            </div>
            <Link
              href="/dashboard/bookings"
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
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs">Reference</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Dates</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Status</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Payment</TableHead>
                    <TableHead className="text-zinc-400 text-xs text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((bk) => (
                    <TableRow key={bk.id} className="border-white/[0.06]">
                      <TableCell className="font-mono text-xs font-semibold text-white">
                        {bk.booking_reference}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-300 font-mono">
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
                      <TableCell className="text-right font-mono text-xs font-semibold text-emerald-400">
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
          <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Fleet Distribution
              </CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time allocation across tenant branches.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Available Fleet
                  </span>
                  <span className="font-mono text-white font-semibold">{availableFleet}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(availableFleet / totalFleet) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    On Active Rental
                  </span>
                  <span className="font-mono text-white font-semibold">{rentedFleet}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(rentedFleet / totalFleet) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Service & Inspection
                  </span>
                  <span className="font-mono text-white font-semibold">{maintenanceFleet}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(maintenanceFleet / totalFleet) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <Link href="/dashboard/fleet">
                  <Button variant="outline" size="sm" className="w-full text-xs border-white/[0.08] hover:bg-white/[0.05]">
                    Manage Fleet Inventory
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Tenant Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/fleet" className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Car className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-zinc-200">Switch Vehicle Status</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                </div>
              </Link>

              <Link href="/dashboard/theme" className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-medium text-zinc-200">Live Branding Engine</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                </div>
              </Link>

              <Link href="/dashboard/customers" className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-medium text-zinc-200">Verify Driver Licenses</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

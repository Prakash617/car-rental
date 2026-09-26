"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Wrench,
  ClipboardCheck,
  Activity,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Fuel,
  Battery,
  ShieldCheck,
  Building2,
  DollarSign,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  fetchFleetHealthOverview,
  fetchMaintenanceRecords,
  scheduleMaintenance,
  startMaintenance,
  completeMaintenance,
  fetchInspections,
  createInspection,
  fetchTelemetry,
  FleetHealthOverview,
  MaintenanceRecord,
  VehicleInspection,
  TelemetryRecord,
  ScheduleMaintenancePayload,
  CreateInspectionPayload,
} from "@/lib/api/maintenance";
import { fetchVehicles } from "@/lib/api/vehicles";
import { Vehicle } from "@/types";

type ActiveTab = "records" | "inspections" | "telemetry";

export default function FleetMaintenancePage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("records");
  const [overview, setOverview] = useState<FleetHealthOverview | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState<ScheduleMaintenancePayload>(() => ({
    vehicle: "",
    service_type: "Routine Oil & Multi-Point Inspection",
    scheduled_start: "2026-10-01T09:00",
    scheduled_end: "2026-10-02T18:00",
    service_center: "Apex Official Service Center",
    notes: "",
  }));

  const [inspectionForm, setInspectionForm] = useState<CreateInspectionPayload>({
    vehicle_id: "",
    inspection_type: "check_out",
    odometer: 15000,
    fuel_percentage: 100,
    battery_percentage: 95,
    exterior_condition: "excellent",
    interior_condition: "excellent",
    has_new_damage: false,
    damage_description: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [ov, recs, insps, tels, vechs] = await Promise.all([
        fetchFleetHealthOverview(token || undefined).catch(() => null),
        fetchMaintenanceRecords(undefined, token || undefined).catch(() => []),
        fetchInspections(undefined, token || undefined).catch(() => []),
        fetchTelemetry(token || undefined).catch(() => []),
        fetchVehicles(undefined, token || undefined).catch(() => []),
      ]);
      setOverview(ov);
      setRecords(recs);
      setInspections(insps);
      setTelemetry(tels);
      setVehicles(vechs);

      if (vechs.length > 0) {
        setScheduleForm((prev) => (prev.vehicle ? prev : { ...prev, vehicle: vechs[0].id }));
        setInspectionForm((prev) => (prev.vehicle_id ? prev : { ...prev, vehicle_id: vechs[0].id }));
      }
    } catch (err) {
      console.error("Failed to load maintenance data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartService = async (recordId: string) => {
    setIsProcessing(true);
    try {
      const updated = await startMaintenance(recordId, token || undefined);
      setRecords((prev) => prev.map((r) => (r.id === recordId ? updated : r)));
      toast.success("Service status updated to IN PROGRESS");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start service";
      toast.error("Service transition failed", { description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteService = async (recordId: string) => {
    const costStr = prompt("Enter final service invoice cost ($):", "450.00");
    if (costStr === null) return;
    const notes = prompt("Enter mechanic service notes:", "All systems cleared and verified.");

    setIsProcessing(true);
    try {
      const updated = await completeMaintenance(
        recordId,
        {
          cost: costStr,
          mechanic_notes: notes || undefined,
          actual_completion: new Date().toISOString(),
        },
        token || undefined
      );
      setRecords((prev) => prev.map((r) => (r.id === recordId ? updated : r)));
      toast.success("Maintenance service completed and vehicle restored to available");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete service";
      toast.error("Completion failed", { description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.vehicle) {
      toast.error("Please select a vehicle to service");
      return;
    }
    setIsProcessing(true);
    try {
      const created = await scheduleMaintenance(scheduleForm, token || undefined);
      setRecords((prev) => [created, ...prev]);
      setShowScheduleModal(false);
      toast.success("Maintenance window scheduled", {
        description: `Service booked for vehicle at ${created.service_center}`,
      });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to schedule service";
      toast.error("Scheduling failed", { description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionForm.vehicle_id) {
      toast.error("Please select a vehicle to inspect");
      return;
    }
    setIsProcessing(true);
    try {
      const created = await createInspection(inspectionForm, token || undefined);
      setInspections((prev) => [created, ...prev]);
      setShowInspectionModal(false);
      toast.success("Inspection log recorded", {
        description: `${created.inspection_type.toUpperCase()} recorded with condition ${created.exterior_condition}`,
      });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record inspection";
      toast.error("Inspection recording failed", { description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Fleet Maintenance & Telemetry Hub
            </h1>
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-400">
              Operational Safety
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Track service intervals, pre/post trip digital inspections, and real-time vehicle diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-white/[0.08] text-zinc-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowInspectionModal(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-white/[0.1]"
          >
            <ClipboardCheck className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
            Digital Inspection
          </Button>
          <Button
            size="sm"
            onClick={() => setShowScheduleModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Schedule Service
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Fleet Inventory</span>
            <Car className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {overview?.fleet_size ?? vehicles.length}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {overview?.available ?? 0} available for dispatch
          </span>
        </Card>

        <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">In Maintenance</span>
            <Wrench className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {overview?.in_maintenance ?? 0}
          </div>
          <span className="text-[11px] text-amber-500/80 font-mono">
            {overview?.active_maintenance_jobs ?? records.filter((r) => r.status === "in_progress").length} active service orders
          </span>
        </Card>

        <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Monthly Expense</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            ${Number(overview?.monthly_maintenance_cost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Billed repairs this month</span>
        </Card>

        <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Health Status</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            98.5%
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Fleet uptime compliance</span>
        </Card>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/[0.08]">
        <button
          onClick={() => setActiveTab("records")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === "records"
              ? "border-amber-400 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Wrench className="h-4 w-4 text-amber-400" />
          Service Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab("inspections")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === "inspections"
              ? "border-amber-400 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ClipboardCheck className="h-4 w-4 text-blue-400" />
          Digital Inspections ({inspections.length})
        </button>
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === "telemetry"
              ? "border-amber-400 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Activity className="h-4 w-4 text-emerald-400" />
          Live Diagnostics ({telemetry.length})
        </button>
      </div>

      {/* TAB 1: Service Records */}
      {activeTab === "records" && (
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                No maintenance service records found. Click &quot;Schedule Service&quot; to book an order.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs">Vehicle</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Service Type</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Status</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Schedule Window</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Service Center</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Invoice Cost</TableHead>
                    <TableHead className="text-zinc-400 text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell>
                        <div>
                          <span className="font-bold text-white text-xs block">
                            {r.vehicle_brand} {r.vehicle_model}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-500">
                            {r.vehicle_plate}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-zinc-200">{r.service_type}</span>
                        {r.notes && (
                          <span className="block text-[11px] text-zinc-500 truncate max-w-xs">
                            {r.notes}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                            r.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : r.status === "in_progress"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : r.status === "scheduled"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-zinc-400 space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            {new Date(r.scheduled_start).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-zinc-300">
                          {r.service_center || "In-House Concierge"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-emerald-400">
                          {r.cost ? `$${Number(r.cost).toLocaleString()}` : "—"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === "scheduled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleStartService(r.id)}
                              className="h-7 px-2 text-[11px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            >
                              Start Service
                            </Button>
                          )}
                          {r.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleCompleteService(r.id)}
                              className="h-7 px-2 text-[11px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              Complete
                            </Button>
                          )}
                          {r.status === "completed" && (
                            <span className="text-[11px] font-mono text-zinc-500">Concluded</span>
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
      )}

      {/* TAB 2: Digital Inspections */}
      {activeTab === "inspections" && (
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ) : inspections.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                No inspection reports logged. Click &quot;Digital Inspection&quot; to record check-in/out condition.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs">Vehicle Plate</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Inspection Type</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Odometer</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Fuel / Battery</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Condition (Ext/Int)</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Damage Alert</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((insp) => (
                    <TableRow key={insp.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-white">
                          {insp.vehicle_plate}
                        </span>
                        {insp.booking_reference && (
                          <span className="block font-mono text-[10px] text-zinc-500">
                            Ref: {insp.booking_reference}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs uppercase font-mono text-zinc-300">
                          {insp.inspection_type.replace("_", " ")}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs text-zinc-200">
                          {Number(insp.odometer).toLocaleString()} mi
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Fuel className="h-3 w-3" />
                            {insp.fuel_percentage}%
                          </span>
                          {insp.battery_percentage !== undefined && insp.battery_percentage !== null && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Battery className="h-3 w-3" />
                              {insp.battery_percentage}%
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-mono text-zinc-300 capitalize">
                          {insp.exterior_condition} / {insp.interior_condition}
                        </span>
                      </TableCell>

                      <TableCell>
                        {insp.has_new_damage ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="h-3 w-3" />
                            {insp.damage_description || "Damage Recorded"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Pristine
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {new Date(insp.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Telemetry */}
      {activeTab === "telemetry" && (
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardContent className="p-0">
            {telemetry.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                No active IoT telemetry signals currently streaming. Vehicles emit beacons during active trips.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs">Vehicle Plate</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Engine State</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Speed</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Fuel / Battery</TableHead>
                    <TableHead className="text-zinc-400 text-xs">GPS Coordinates</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Last Signal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {telemetry.map((t) => (
                    <TableRow key={t.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-white">
                          {t.vehicle_plate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                          {t.engine_status?.toUpperCase() || "IDLE"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-zinc-300">
                          {t.speed ? `${t.speed} mph` : "0 mph"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-amber-400">
                          {t.fuel_level ? `${t.fuel_level}%` : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] text-zinc-400">
                          {t.latitude && t.longitude ? `${t.latitude}, ${t.longitude}` : "Locked in Depot"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {new Date(t.timestamp).toLocaleTimeString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* SCHEDULE SERVICE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full border-white/[0.12] bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Schedule Fleet Service</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Target Vehicle *</label>
                <Select
                  value={scheduleForm.vehicle}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, vehicle: e.target.value })}
                  className="bg-black/40 border-white/[0.08] text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.license_plate})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Service Order Type *</label>
                <Input
                  value={scheduleForm.service_type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, service_type: e.target.value })}
                  placeholder="e.g. Brake Pad Replacement, 20K Service"
                  className="bg-black/40 border-white/[0.08] text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Scheduled Start *</label>
                  <Input
                    type="datetime-local"
                    value={scheduleForm.scheduled_start}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_start: e.target.value })}
                    className="bg-black/40 border-white/[0.08] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Scheduled End *</label>
                  <Input
                    type="datetime-local"
                    value={scheduleForm.scheduled_end}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_end: e.target.value })}
                    className="bg-black/40 border-white/[0.08] text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Certified Service Center</label>
                <Input
                  value={scheduleForm.service_center}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, service_center: e.target.value })}
                  placeholder="e.g. Official Dealer Service Hub"
                  className="bg-black/40 border-white/[0.08] text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Concierge Notes</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-white/[0.08] bg-black/40 p-2 text-white font-mono text-xs focus:outline-none"
                  placeholder="Mechanic instructions or warranty policy ID..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                  className="border-white/[0.1] text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Book Service Order
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* INSPECTION MODAL */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full border-white/[0.12] bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInspectionModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Record Digital Vehicle Inspection</h3>
            <form onSubmit={handleInspectionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Vehicle *</label>
                <Select
                  value={inspectionForm.vehicle_id}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, vehicle_id: e.target.value })}
                  className="bg-black/40 border-white/[0.08] text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.license_plate})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Inspection Type</label>
                  <Select
                    value={inspectionForm.inspection_type}
                    onChange={(e) =>
                      setInspectionForm({
                        ...inspectionForm,
                        inspection_type: e.target.value as CreateInspectionPayload["inspection_type"],
                      })
                    }
                    className="bg-black/40 border-white/[0.08] text-white"
                  >
                    <option value="check_out">Check-Out (Pre-Trip)</option>
                    <option value="check_in">Check-In (Post-Trip)</option>
                    <option value="routine">Routine Safety Check</option>
                  </Select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Odometer (mi) *</label>
                  <Input
                    type="number"
                    value={inspectionForm.odometer}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, odometer: Number(e.target.value) })}
                    className="bg-black/40 border-white/[0.08] text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Fuel Level (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={inspectionForm.fuel_percentage}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, fuel_percentage: Number(e.target.value) })}
                    className="bg-black/40 border-white/[0.08] text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Exterior State</label>
                  <Select
                    value={inspectionForm.exterior_condition}
                    onChange={(e) =>
                      setInspectionForm({
                        ...inspectionForm,
                        exterior_condition: e.target.value as CreateInspectionPayload["exterior_condition"],
                      })
                    }
                    className="bg-black/40 border-white/[0.08] text-white"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Damaged</option>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inspectionForm.has_new_damage}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, has_new_damage: e.target.checked })}
                    className="rounded border-white/[0.2] bg-black text-amber-500"
                  />
                  <span>Report New Scratch / Dent / Body Damage</span>
                </label>
                {inspectionForm.has_new_damage && (
                  <textarea
                    value={inspectionForm.damage_description}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, damage_description: e.target.value })}
                    rows={2}
                    placeholder="Describe location and severity of damage..."
                    className="mt-2 w-full rounded border border-rose-500/40 bg-black/40 p-2 text-white font-mono text-xs"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInspectionModal(false)}
                  className="border-white/[0.1] text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Inspection Record
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

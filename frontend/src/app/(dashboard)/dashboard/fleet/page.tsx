"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  RefreshCw,
  Gauge,
  CheckCircle2,
  Search,
  Plus,
  Car,
  X,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { getVehicles, createVehicle, CreateVehiclePayload } from "@/lib/api/vehicles";
import { fetchBranches, Branch } from "@/lib/api/branches";
import { updateVehicleStatus } from "@/lib/api/dashboard";
import { getSafeImageUrl } from "@/lib/utils";
import { Vehicle, VehicleCategory, VehicleStatus } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const IMAGE_PRESETS = [
  {
    label: "Ferrari 296 GTB",
    url: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Porsche 911 GT3",
    url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Lamborghini Huracán",
    url: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Range Rover Autobiography",
    url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Mercedes-AMG GT",
    url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Rolls-Royce Ghost",
    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
  },
];

export default function FleetManagementPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add Vehicle Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateVehiclePayload>({
    branch: "",
    brand: "Ferrari",
    model: "296 GTB Assetto",
    year: 2025,
    license_plate: "LUX-296",
    category: "sports",
    transmission: "automatic",
    fuel_type: "hybrid",
    seats: 2,
    doors: 2,
    mileage: 1200,
    color: "Rosso Corsa",
    status: "available",
    daily_rate: "1450.00",
    deposit_amount: "3000.00",
    description: "Plug-in hybrid V6 twin-turbo supercar delivering 819 horsepower with instant throttle response.",
    images: [
      {
        url: IMAGE_PRESETS[0].url,
        is_primary: true,
        caption: "Front three-quarter view",
      },
    ],
  });

  const openAddModal = () => {
    const randomPlate = `LUX-${Math.floor(100 + Math.random() * 900)}`;
    setFormData((prev) => ({
      ...prev,
      branch: prev.branch || (branches.length > 0 ? branches[0].id : ""),
      license_plate: randomPlate,
    }));
    setModalError(null);
    setShowAddModal(true);
  };

  const loadFleet = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fleetData, branchData] = await Promise.all([
        getVehicles(),
        fetchBranches().catch(() => []),
      ]);
      setVehicles(fleetData);
      setBranches(branchData);
      if (branchData.length > 0) {
        setFormData((prev) => ({ ...prev, branch: branchData[0].id }));
      }
    } catch (err) {
      console.error("Failed to load fleet:", err);
      toast.error("Failed to retrieve fleet catalog", {
        description: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  const handleStatusChange = async (vehicleId: string, newStatus: VehicleStatus) => {
    setUpdatingId(vehicleId);
    try {
      await updateVehicleStatus(vehicleId, newStatus, token || undefined);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, status: newStatus } : v))
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success("Vehicle status updated", {
        description: `Status changed to ${newStatus.toUpperCase()}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unauthorized";
      toast.error("Status update failed", {
        description: msg,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const branchId = formData.branch || (branches.length > 0 ? branches[0].id : "");
    if (!branchId) {
      const msg = "Please select a depot branch for this vehicle.";
      setModalError(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        branch: branchId,
      };
      const created = await createVehicle(payload, token || undefined);
      setVehicles((prev) => [created, ...prev]);
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success(`Vehicle ${created.brand} ${created.model} added to fleet!`, {
        description: `License Plate: ${created.license_plate} · Daily Rate: $${created.daily_rate}/day`,
      });
      setShowAddModal(false);
      // Reset form with a fresh random license plate
      const nextPlate = `LUX-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        branch: branches[0]?.id || "",
        brand: "",
        model: "",
        year: 2025,
        license_plate: nextPlate,
        category: "luxury",
        transmission: "automatic",
        fuel_type: "petrol",
        seats: 4,
        doors: 4,
        mileage: 0,
        color: "Obsidian Black",
        status: "available",
        daily_rate: "850.00",
        deposit_amount: "2000.00",
        description: "",
        images: [{ url: IMAGE_PRESETS[1].url, is_primary: true }],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create vehicle";
      setModalError(msg);
      toast.error("Failed to create vehicle", {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-2.5">
            <span>Fleet Inventory</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400">
              {vehicles.length} Vehicles
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Control vehicle availability, telemetry, and service scheduling across depot branches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadFleet}
            className="border-white/[0.08] text-zinc-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            onClick={openAddModal}
            className="bg-[#D4AF37] hover:bg-[#e2bd46] text-black font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle to Fleet
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by brand, model, or plate (e.g. Porsche, LUX-911)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/40 border-white/[0.08] text-sm text-white"
            />
          </div>

          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-black/40 border-white/[0.08] text-sm text-white"
            >
              <option value="all">All Categories</option>
              <option value="luxury">Luxury Flagship</option>
              <option value="sports">Exotic Sports</option>
              <option value="suv">Premium SUV</option>
              <option value="sedan">Executive Sedan</option>
              <option value="electric">Electric / EV</option>
            </Select>
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/40 border-white/[0.08] text-sm text-white"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Vehicle Inventory Table */}
      <Card className="border-white/[0.08] bg-zinc-950/60 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02] border-b border-white/[0.06]">
            <TableRow className="border-none hover:bg-transparent text-[11px] font-mono uppercase text-zinc-400">
              <TableHead className="w-[100px]">Asset</TableHead>
              <TableHead>Vehicle Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Depot Branch</TableHead>
              <TableHead>Daily Rate</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Operational Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-white/[0.04]">
                  <TableCell><Skeleton className="h-14 w-20 rounded-lg bg-white/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36 mb-2 bg-white/[0.04]" /><Skeleton className="h-3 w-20 bg-white/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-white/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-white/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-white/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-white/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full bg-white/[0.04]" /></TableCell>
                </TableRow>
              ))
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Car className="h-8 w-8 text-zinc-600" />
                    <p className="text-sm font-medium text-zinc-400">No vehicles match criteria</p>
                    <p className="text-xs text-zinc-600">Click &quot;Add Vehicle to Fleet&quot; to register a new automobile.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => {
                const rawUrl =
                  vehicle.images && vehicle.images.length > 0
                    ? vehicle.images[0].url
                    : IMAGE_PRESETS[1].url;
                const img = getSafeImageUrl(rawUrl, IMAGE_PRESETS[1].url);

                return (
                  <TableRow
                    key={vehicle.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Thumbnail */}
                    <TableCell>
                      <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-zinc-900 border border-white/[0.08]">
                        <Image
                          src={img}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          fill
                          sizes="80px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    </TableCell>

                    {/* Make & Model */}
                    <TableCell>
                      <div className="font-semibold text-white">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-white">
                          {vehicle.license_plate}
                        </span>
                        <span>&middot;</span>
                        <span>{vehicle.year}</span>
                        <span>&middot;</span>
                        <span className="capitalize">{vehicle.transmission}</span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="text-xs uppercase tracking-wider font-mono text-zinc-300">
                        {vehicle.category}
                      </span>
                    </TableCell>

                    {/* Branch */}
                    <TableCell className="text-xs text-zinc-300">
                      {vehicle.branch_name || "Downtown Hub"}
                    </TableCell>

                    {/* Rate */}
                    <TableCell className="font-mono font-medium text-white">
                      ${vehicle.daily_rate}
                      <span className="text-[11px] text-zinc-500 font-normal"> /day</span>
                    </TableCell>

                    {/* Mileage */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                        <Gauge className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{vehicle.mileage.toLocaleString()} mi</span>
                      </div>
                    </TableCell>

                    {/* Quick Status Control */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="vehicle" status={vehicle.status} />
                        <select
                          aria-label="Change vehicle status"
                          value={vehicle.status}
                          disabled={updatingId === vehicle.id}
                          onChange={(e) =>
                            handleStatusChange(vehicle.id, e.target.value as VehicleStatus)
                          }
                          className="text-[11px] font-mono bg-black/60 border border-white/[0.08] rounded px-2 py-1 text-zinc-300 focus:outline-none cursor-pointer hover:border-white/20 transition-colors"
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="rented">Rented</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="inactive">Decommission</option>
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-white/[0.12] p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Add Vehicle to Fleet Catalog
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Register a new asset with telemetry, pricing, and high-definition imagery.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white p-1 text-sm rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              {/* Row 1: Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Brand / Make *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Porsche"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Model *
                  </label>
                  <Input
                    required
                    placeholder="e.g. 911 GT3 RS"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Year, License Plate, Color */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Year *
                  </label>
                  <Input
                    required
                    type="number"
                    min="1990"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2025 })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-300">
                      License Plate *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPlate = `LUX-${Math.floor(100 + Math.random() * 900)}`;
                        setFormData((prev) => ({ ...prev, license_plate: randomPlate }));
                        setModalError(null);
                      }}
                      className="text-[10px] font-mono text-[#D4AF37] hover:underline"
                    >
                      Generate New
                    </button>
                  </div>
                  <Input
                    required
                    placeholder="LUX-911"
                    value={formData.license_plate}
                    onChange={(e) => {
                      setFormData({ ...formData, license_plate: e.target.value.toUpperCase() });
                      setModalError(null);
                    }}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Exterior Color
                  </label>
                  <Input
                    placeholder="Carrara White"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
              </div>

              {/* Row 3: Category, Transmission, Fuel Type */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as VehicleCategory })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                  >
                    <option value="sports">Exotic Sports</option>
                    <option value="luxury">Luxury Flagship</option>
                    <option value="suv">Premium SUV</option>
                    <option value="sedan">Executive Sedan</option>
                    <option value="electric">Electric / EV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Transmission *
                  </label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value as "automatic" | "manual" })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Fuel Type *
                  </label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value as "petrol" | "diesel" | "hybrid" | "electric" })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                  >
                    <option value="petrol">Petrol / Gas</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Depot Branch, Daily Rate, Security Deposit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Depot Branch *
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                    {branches.length === 0 && <option value="">Loading branches...</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Daily Rate ($) *
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="1200.00"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Security Deposit ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="2500.00"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Initial Image Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Primary Display Photo</span>
                  <span className="text-[11px] text-zinc-500 font-mono">Select preset or paste URL</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          images: [{ url: preset.url, is_primary: true, caption: preset.label }],
                        })
                      }
                      className={`relative aspect-[16/10] rounded-lg overflow-hidden border transition-all ${
                        formData.images?.[0]?.url === preset.url
                          ? "ring-2 ring-[#D4AF37] border-transparent scale-102"
                          : "border-white/[0.08] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={preset.url} alt={preset.label} fill sizes="100px" className="object-cover" />
                    </button>
                  ))}
                </div>
                <Input
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.images?.[0]?.url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      images: [{ url: e.target.value, is_primary: true }],
                    })
                  }
                  className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                />
              </div>

              {/* Row 6: Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Concierge Fleet Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief vehicle orientation highlights, interior specification, performance notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md bg-black/50 border border-white/[0.08] p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Modal Error Banner */}
              {modalError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block text-rose-200 mb-0.5">Registration Failed</span>
                    <span className="text-rose-300/90 leading-relaxed">{modalError}</span>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D4AF37] hover:bg-[#e2bd46] text-black font-semibold text-xs min-w-[130px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Registering Asset...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Add to Fleet
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

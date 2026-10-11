"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Settings2,
  Pencil,
  Trash2,
  UploadCloud,
  ShieldCheck,
  Eye,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Check,
  ExternalLink,
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
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImage,
  approveHostVehicle,
  rejectHostVehicle,
  UploadImageResult,
  CreateVehiclePayload,
} from "@/lib/api/vehicles";
import { fetchBranches, createBranch, Branch } from "@/lib/api/branches";
import { fetchCategories, CategoryItem } from "@/lib/api/categories";
import { fetchTransmissions, TransmissionItem } from "@/lib/api/transmissions";
import { updateVehicleStatus } from "@/lib/api/dashboard";
import { getSafeImageUrl, getCurrencySymbol } from "@/lib/utils";
import { useBranding } from "@/lib/context/branding";
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
  const { token, tenantDomain } = useAuth();
  const queryClient = useQueryClient();

  let queryTenant: string | null = null;
  if (typeof window !== "undefined") {
    queryTenant = new URLSearchParams(window.location.search).get("tenant");
  }
  const activeTenant = queryTenant || tenantDomain || "superbang.localhost";
  const cleanDomain = activeTenant.replace(/:\d+$/, "");
  const tenantHost = `${cleanDomain}:3000`;

  let currencySymbol = "Rs.";
  try {
    const branding = useBranding();
    currencySymbol = getCurrencySymbol(branding?.currency);
  } catch {
    currencySymbol = "Rs.";
  }

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transmissions, setTransmissions] = useState<TransmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // View Tab: "all" or "pending" (Host Approvals)
  const [activeViewTab, setActiveViewTab] = useState<"all" | "pending">("all");

  // Host Vehicle Review Modal State
  const [reviewingVehicle, setReviewingVehicle] = useState<Vehicle | null>(null);
  const [reviewDailyRate, setReviewDailyRate] = useState<string>("");
  const [reviewCategory, setReviewCategory] = useState<string>("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const spStatus = new URLSearchParams(window.location.search).get("status");
      if (spStatus === "pending_approval") {
        setStatusFilter("pending_approval");
        setActiveViewTab("pending");
      }
    }
  }, []);

  const parseHostDetails = (desc?: string) => {
    if (!desc) return null;
    const ownerMatch = desc.match(/Owner:\s*([^(]+)\s*\(([^,]+),\s*([^)]+)\)/i);
    const locationMatch = desc.match(/Location:\s*([^\n]+)/i);
    const driverMatch = desc.match(/Driver:\s*([^(]+)\s*\(Phone:\s*([^,]+),\s*License:\s*([^)]+)\)/i);
    const smokingMatch = desc.match(/Smoking Allowed:\s*([^\n]+)/i);
    const refMatch = desc.match(/Host Vehicle Registration \((HOST-[A-Z0-9]+)\)/i);

    return {
      referenceId: refMatch ? refMatch[1] : null,
      ownerName: ownerMatch ? ownerMatch[1].trim() : null,
      ownerPhone: ownerMatch ? ownerMatch[2].trim() : null,
      ownerEmail: ownerMatch ? ownerMatch[3].trim() : null,
      location: locationMatch ? locationMatch[1].trim() : null,
      driverName: driverMatch ? driverMatch[1].trim() : null,
      driverPhone: driverMatch ? driverMatch[2].trim() : null,
      licenseNumber: driverMatch ? driverMatch[3].trim() : null,
      smokingAllowed: smokingMatch ? smokingMatch[1].trim() : null,
    };
  };

  const openReviewModal = (vehicle: Vehicle) => {
    setReviewingVehicle(vehicle);
    setReviewDailyRate(vehicle.daily_rate);
    setReviewCategory(vehicle.category);
    setPreviewImage(null);
  };

  const handleApproveVehicle = async () => {
    if (!reviewingVehicle) return;
    setIsReviewSubmitting(true);
    try {
      const updated = await approveHostVehicle(
        reviewingVehicle.id,
        {
          daily_rate: reviewDailyRate || reviewingVehicle.daily_rate,
          category: reviewCategory || reviewingVehicle.category,
        },
        token || undefined,
        tenantHost
      );
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success(`Vehicle "${updated.brand} ${updated.model}" approved!`, {
        description: `License Plate: ${updated.license_plate} is now LIVE in your fleet and available for client booking.`,
      });
      setReviewingVehicle(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve vehicle";
      toast.error("Approval failed", { description: msg });
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleRejectVehicle = async () => {
    if (!reviewingVehicle) return;
    const reason = prompt(
      "Enter reason for declining this vehicle host application (optional):",
      "Documentation incomplete or vehicle does not meet fleet criteria."
    );
    if (reason === null) return;

    setIsReviewSubmitting(true);
    try {
      const updated = await rejectHostVehicle(
        reviewingVehicle.id,
        reason || undefined,
        token || undefined,
        tenantHost
      );
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.info(`Vehicle "${updated.brand} ${updated.model}" host submission declined.`, {
        description: `Status changed to Inactive.`,
      });
      setReviewingVehicle(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject vehicle";
      toast.error("Action failed", { description: msg });
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Edit / Delete Vehicle State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add Vehicle Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showNewBranchForm, setShowNewBranchForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCity, setNewBranchCity] = useState("");
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);

  // Photo Upload & Compression State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadImageResult | null>(null);
  const [photoSourceTab, setPhotoSourceTab] = useState<"upload" | "presets">("upload");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select an image file (JPEG, PNG, WebP, AVIF, HEIC).",
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum vehicle photo size is 25 MB.",
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const result = await uploadVehicleImage(file, { is_primary: true }, token || undefined);
      setUploadStats(result);
      setFormData((prev) => ({
        ...prev,
        images: [{ url: result.url, is_primary: true, caption: `${prev.brand} ${prev.model}` }],
      }));
      toast.success("Photo compressed & saved!", {
        description: `Reduced by ${result.reduction_percentage}% (${Math.round(result.original_size / 1024)} KB → ${Math.round(result.compressed_size / 1024)} KB WebP)`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload and compress photo";
      toast.error("Upload failed", { description: msg });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

  const handleQuickCreateBranch = async () => {
    if (!newBranchName.trim()) {
      toast.error("Please enter a branch name");
      return;
    }
    setIsCreatingBranch(true);
    try {
      const created = await createBranch(
        {
          name: newBranchName.trim(),
          city: newBranchCity.trim() || "Metropolis",
        },
        token || undefined
      );
      setBranches((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, branch: created.id }));
      setNewBranchName("");
      setNewBranchCity("");
      setShowNewBranchForm(false);
      toast.success(`Branch "${created.name}" created and selected!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create branch";
      toast.error(msg);
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const openAddModal = () => {
    const randomPlate = `LUX-${Math.floor(100 + Math.random() * 900)}`;
    setFormData((prev) => ({
      ...prev,
      branch: prev.branch || (branches.length > 0 ? branches[0].id : ""),
      category: prev.category || (categories.length > 0 ? categories[0].slug : "sports"),
      transmission: prev.transmission || (transmissions.length > 0 ? transmissions[0].slug : "automatic"),
      license_plate: randomPlate,
    }));
    setShowNewBranchForm(false);
    setNewBranchName("");
    setNewBranchCity("");
    setModalError(null);
    setUploadStats(null);
    setPhotoSourceTab("upload");
    setShowAddModal(true);
  };

  const closeVehicleModal = () => {
    setShowAddModal(false);
    setEditingVehicle(null);
    setModalError(null);
    setUploadStats(null);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      branch: vehicle.branch || vehicle.branch_id || (branches.length > 0 ? branches[0].id : ""),
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
      category: vehicle.category,
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuel_type,
      seats: vehicle.seats,
      doors: vehicle.doors,
      mileage: vehicle.mileage,
      color: vehicle.color,
      status: vehicle.status,
      daily_rate: vehicle.daily_rate,
      deposit_amount: vehicle.deposit_amount || "0.00",
      description: vehicle.description || "",
      images:
        vehicle.images && vehicle.images.length > 0
          ? vehicle.images.map((img, idx) => ({
              url: typeof img === "string" ? img : img.url,
              is_primary: idx === 0,
              caption: typeof img === "string" ? "" : img.caption,
            }))
          : [{ url: IMAGE_PRESETS[1].url, is_primary: true }],
    });
    setShowNewBranchForm(false);
    setModalError(null);
    setUploadStats(null);
    setPhotoSourceTab(vehicle.images && vehicle.images.length > 0 ? "upload" : "presets");
    setShowAddModal(true);
  };

  const loadFleet = useCallback(async () => {
    setIsLoading(true);
    let queryTenant: string | null = null;
    if (typeof window !== "undefined") {
      queryTenant = new URLSearchParams(window.location.search).get("tenant");
    }
    const activeTenant = queryTenant || tenantDomain || "superbang.localhost";
    const cleanDomain = activeTenant.replace(/:\d+$/, "");
    const tenantHost = `${cleanDomain}:3000`;

    try {
      const [fleetData, branchData, categoryData, transmissionData] = await Promise.all([
        getVehicles(undefined, token || undefined, tenantHost),
        fetchBranches(token || undefined, tenantHost).catch(() => []),
        fetchCategories(tenantHost).catch(() => []),
        fetchTransmissions(tenantHost).catch(() => []),
      ]);
      setVehicles(fleetData);
      setBranches(branchData);
      setCategories(categoryData);
      setTransmissions(transmissionData);
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
  }, [token, tenantDomain]);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  const handleStatusChange = async (vehicleId: string, newStatus: VehicleStatus) => {
    setUpdatingId(vehicleId);
    try {
      await updateVehicleStatus(vehicleId, newStatus, token || undefined, tenantHost);
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

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const isEdit = Boolean(editingVehicle);
    let branchId = formData.branch || (branches.length > 0 ? branches[0].id : "");
    if (!branchId && !isEdit) {
      try {
        const autoBranch = await createBranch(
          { name: "Main Headquarters", city: "Metropolis" },
          token || undefined
        );
        setBranches((prev) => [...prev, autoBranch]);
        branchId = autoBranch.id;
      } catch {
        // Fallback to backend serializer auto-creation
      }
    }

    setIsSubmitting(true);
    try {
      const payload: CreateVehiclePayload = {
        ...formData,
        ...(branchId ? { branch: branchId } : {}),
        deposit_amount: formData.deposit_amount || "0.00",
      };

      if (editingVehicle) {
        const updated = await updateVehicle(editingVehicle.id, payload, token || undefined);
        setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
        toast.success(`Vehicle ${updated.brand} ${updated.model} updated!`, {
          description: `License Plate: ${updated.license_plate} · Daily Rate: ${currencySymbol} ${updated.daily_rate}/day`,
        });
        closeVehicleModal();
        return;
      }

      const created = await createVehicle(payload, token || undefined);
      setVehicles((prev) => [created, ...prev]);
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success(`Vehicle ${created.brand} ${created.model} added to fleet!`, {
        description: `License Plate: ${created.license_plate} · Daily Rate: ${currencySymbol} ${created.daily_rate}/day`,
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
      const fallback = isEdit ? "Failed to update vehicle" : "Failed to create vehicle";
      const msg = err instanceof Error ? err.message : fallback;
      setModalError(msg);
      toast.error(fallback, {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (
      !confirm(
        `Are you sure you want to delete "${vehicle.brand} ${vehicle.model}" (${vehicle.license_plate}) from the fleet?`
      )
    ) {
      return;
    }
    setDeletingId(vehicle.id);
    try {
      await deleteVehicle(vehicle.id, token || undefined);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success(`Vehicle ${vehicle.brand} ${vehicle.model} deleted.`, {
        description: `License Plate: ${vehicle.license_plate} removed from fleet inventory.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete vehicle";
      toast.error("Failed to delete vehicle", {
        description: msg,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const pendingVehicles = vehicles.filter(
    (v) => v.status === "pending_approval" || v.is_verified === false
  );
  const activeFleetVehicles = vehicles.filter(
    (v) => v.status !== "pending_approval" && v.is_verified !== false
  );

  const filteredVehicles = (activeViewTab === "pending" ? pendingVehicles : activeFleetVehicles).filter((v) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description ? v.description.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    const matchesStatus =
      activeViewTab === "pending"
        ? statusFilter === "all" || statusFilter === "pending_approval" || v.status === statusFilter
        : statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 md:text-3xl flex items-center gap-2.5">
            <span>Fleet Inventory</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full dark:bg-white/[0.05] bg-slate-100 border dark:border-white/[0.08] border-slate-200 dark:text-zinc-400 text-slate-600">
              {vehicles.length} Total Vehicles
            </span>
          </h1>
          <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">
            Control vehicle availability, telemetry, and review host applications across depot branches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <Button
              variant="outline"
              size="sm"
              className="dark:border-white/[0.08] border-slate-200 dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100"
            >
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              Branches &amp; Settings
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={loadFleet}
            className="dark:border-white/[0.08] border-slate-200 dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100"
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

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b dark:border-white/[0.08] border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveViewTab("all");
            setStatusFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeViewTab === "all"
              ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
              : "dark:text-zinc-400 text-slate-600 dark:hover:bg-white/[0.05] hover:bg-slate-100"
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Active Fleet ({activeFleetVehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveViewTab("pending");
            setStatusFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
            activeViewTab === "pending"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "dark:text-zinc-400 text-slate-600 dark:hover:bg-white/[0.05] hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Host Applications ({pendingVehicles.length})</span>
          {pendingVehicles.length > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Pending Applications Alert Banner */}
      {pendingVehicles.length > 0 && activeViewTab === "all" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border dark:border-amber-500/30 border-amber-300 dark:bg-amber-500/10 bg-amber-50 p-4 dark:text-amber-200 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg dark:bg-amber-500/20 bg-amber-100 text-amber-600 dark:text-amber-400 shrink-0 border dark:border-amber-500/30 border-amber-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm dark:text-white text-slate-900">
                {pendingVehicles.length} Host Vehicle Application{pendingVehicles.length > 1 ? "s" : ""} Awaiting Review &amp; Approval
              </p>
              <p className="text-xs dark:text-amber-300/80 text-amber-900/80 mt-0.5">
                Vehicle owners registered vehicles from your public storefront. Review their registration docs, bluebook, driver license, and approve them to enter live fleet.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setActiveViewTab("pending");
              setStatusFilter("all");
            }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shrink-0"
          >
            Review Submissions ({pendingVehicles.length})
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-zinc-500 text-slate-400" />
            <Input
              placeholder="Search by brand, model, or plate (e.g. Porsche, LUX-911)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 dark:bg-black/40 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-sm dark:text-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="dark:bg-black/40 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-sm dark:text-white text-slate-900"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
              {categories.length === 0 && (
                <>
                  <option value="luxury">Luxury Flagship</option>
                  <option value="sports">Exotic Sports</option>
                  <option value="suv">Premium SUV</option>
                  <option value="sedan">Executive Sedan</option>
                  <option value="electric">Electric / EV</option>
                </>
              )}
            </Select>
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dark:bg-black/40 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-sm dark:text-white text-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="pending_approval">Pending Host Review</option>
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
      <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="dark:bg-white/[0.02] bg-slate-50/70 border-b dark:border-white/[0.06] border-slate-200">
            <TableRow className="border-none hover:bg-transparent text-[11px] font-mono uppercase dark:text-zinc-400 text-slate-500">
              <TableHead className="w-[100px]">Asset</TableHead>
              <TableHead>Vehicle Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Depot Branch</TableHead>
              <TableHead>Daily Rate</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Operational Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell><Skeleton className="h-6 w-16 rounded-lg bg-white/[0.04]" /></TableCell>
                </TableRow>
              ))
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Car className="h-8 w-8 text-zinc-600" />
                    <p className="text-sm font-medium text-zinc-400">No vehicles match criteria</p>
                    <p className="text-xs text-zinc-600">Click &quot;Add Vehicle to Fleet&quot; to register a new automobile.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => {
                const firstImg = vehicle.images?.[0];
                const rawUrl =
                  typeof firstImg === "string"
                    ? firstImg
                    : firstImg?.url || IMAGE_PRESETS[1].url;
                const img = getSafeImageUrl(rawUrl, IMAGE_PRESETS[1].url);

                return (
                  <TableRow
                    key={vehicle.id}
                    className="border-b dark:border-white/[0.04] border-slate-100 dark:hover:bg-white/[0.02] hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Thumbnail */}
                    <TableCell>
                      <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-zinc-900 border dark:border-white/[0.08] border-slate-200">
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
                      <div className="font-semibold dark:text-white text-slate-900">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div className="flex items-center gap-2 text-xs dark:text-zinc-400 text-slate-500 font-mono mt-0.5">
                        <span className="px-1.5 py-0.2 rounded dark:bg-white/[0.06] bg-slate-100 dark:text-white text-slate-800">
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
                      <span className="text-xs uppercase tracking-wider font-mono dark:text-zinc-300 text-slate-600 font-medium">
                        {vehicle.category}
                      </span>
                    </TableCell>

                    {/* Branch */}
                    <TableCell className="text-xs dark:text-zinc-300 text-slate-600">
                      {vehicle.branch_name || "Downtown Hub"}
                    </TableCell>

                    {/* Rate */}
                    <TableCell className="font-mono font-medium dark:text-white text-slate-900">
                      {currencySymbol} {Number(vehicle.daily_rate).toLocaleString()}
                      <span className="text-[11px] dark:text-zinc-500 text-slate-400 font-normal"> /day</span>
                    </TableCell>

                    {/* Mileage */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs dark:text-zinc-400 text-slate-500 font-mono">
                        <Gauge className="h-3.5 w-3.5 dark:text-zinc-500 text-slate-400" />
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
                          className="text-[11px] font-mono dark:bg-black/60 bg-white border dark:border-white/[0.08] border-slate-200 rounded px-2 py-1 dark:text-zinc-300 text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-colors"
                        >
                          <option value="pending_approval">Pending Review</option>
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="rented">Rented</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="inactive">Decommission</option>
                        </select>
                      </div>
                    </TableCell>

                    {/* Row Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(vehicle.status === "pending_approval" || vehicle.is_verified === false) && (
                          <Button
                            size="sm"
                            onClick={() => openReviewModal(vehicle)}
                            className="h-7 px-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(vehicle)}
                          className="h-7 px-2 dark:text-zinc-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === vehicle.id || updatingId === vehicle.id}
                          onClick={() => handleDeleteVehicle(vehicle)}
                          className="h-7 px-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          {deletingId === vehicle.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
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
          <div className="relative w-full max-w-2xl rounded-2xl dark:bg-zinc-950 bg-white border dark:border-white/[0.12] border-slate-200 p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b dark:border-white/[0.08] border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold dark:text-white text-slate-900 font-serif">
                    {editingVehicle ? "Edit Vehicle" : "Add Vehicle to Fleet Catalog"}
                  </h3>
                  <p className="text-xs dark:text-zinc-400 text-slate-500">
                    {editingVehicle
                      ? "Update specifications, pricing, depot assignment, and imagery."
                      : "Register a new asset with telemetry, pricing, and high-definition imagery."}
                  </p>
                </div>
              </div>

              <button
                onClick={closeVehicleModal}
                className="dark:text-zinc-500 text-slate-400 dark:hover:text-white hover:text-slate-800 p-1 text-sm rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-300">
                      Category *
                    </label>
                    <Link
                      href="/dashboard/settings?tab=categories"
                      target="_blank"
                      className="text-[10px] text-[#D4AF37] hover:underline font-mono"
                    >
                      Manage
                    </Link>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as VehicleCategory })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="sports">Exotic Sports</option>
                        <option value="luxury">Luxury Flagship</option>
                        <option value="suv">Premium SUV</option>
                        <option value="sedan">Executive Sedan</option>
                        <option value="electric">Electric / EV</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-300">
                      Transmission *
                    </label>
                    <Link
                      href="/dashboard/settings?tab=transmissions"
                      target="_blank"
                      className="text-[10px] text-[#D4AF37] hover:underline font-mono"
                    >
                      Manage
                    </Link>
                  </div>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value as "automatic" | "manual" })}
                    className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5"
                  >
                    {transmissions.map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                    {transmissions.length === 0 && (
                      <>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </>
                    )}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-300">
                      Depot Branch *
                    </label>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/dashboard/settings?tab=branches"
                        target="_blank"
                        className="text-[10px] text-zinc-400 hover:text-white font-mono"
                      >
                        Manage
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowNewBranchForm(!showNewBranchForm)}
                        className="text-[10px] text-[#D4AF37] hover:underline font-mono"
                      >
                        {showNewBranchForm ? "Cancel" : "+ New Branch"}
                      </button>
                    </div>
                  </div>
                  {showNewBranchForm ? (
                    <div className="space-y-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1]">
                      <Input
                        placeholder="Branch Name (e.g. Airport Hub)"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        className="bg-black/50 border-white/[0.08] text-white text-xs h-7"
                      />
                      <Input
                        placeholder="City (e.g. Los Angeles)"
                        value={newBranchCity}
                        onChange={(e) => setNewBranchCity(e.target.value)}
                        className="bg-black/50 border-white/[0.08] text-white text-xs h-7"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={isCreatingBranch}
                        onClick={handleQuickCreateBranch}
                        className="w-full h-7 text-xs bg-[#D4AF37] text-black font-semibold hover:bg-amber-400"
                      >
                        {isCreatingBranch ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : null}
                        <span>Save &amp; Select Branch</span>
                      </Button>
                    </div>
                  ) : (
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full h-9 rounded-md bg-black/50 border border-white/[0.08] text-xs text-white px-2.5 focus:border-[#D4AF37] focus:outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                      {branches.length === 0 && (
                        <option value="">Main Depot (Auto-created)</option>
                      )}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Daily Rate ({currencySymbol}) *
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
                    Security Deposit ({currencySymbol})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Photo Upload & Compression / Preset Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-zinc-300">
                    Vehicle Photography *
                  </label>
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/[0.08] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab("upload")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        photoSourceTab === "upload"
                          ? "bg-[#D4AF37] text-black font-semibold shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Upload &amp; Compress
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab("presets")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        photoSourceTab === "presets"
                          ? "bg-[#D4AF37] text-black font-semibold shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Presets &amp; URL
                    </button>
                  </div>
                </div>

                {photoSourceTab === "upload" ? (
                  <div className="space-y-3">
                    {/* Upload Drop Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        isUploadingPhoto
                          ? "border-[#D4AF37] bg-[#D4AF37]/5 pointer-events-none"
                          : "border-white/[0.15] bg-black/40 hover:border-[#D4AF37]/60 hover:bg-black/60 group"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {isUploadingPhoto ? (
                        <div className="flex flex-col items-center gap-2 py-3 text-center">
                          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                          <span className="text-xs font-semibold text-white">
                            Uploading &amp; Compressing via Backend...
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Auto-transposing EXIF, downscaling to 1080p, converting to WebP
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform group-hover:border-[#D4AF37]/40">
                            <UploadCloud className="w-5 h-5 text-[#D4AF37]" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                              Click or drop vehicle photo to upload
                            </span>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              Supports JPG, PNG, WebP up to 25MB. Backend automatically compresses into lightweight WebP.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compressed Photo Preview & Savings Metadata */}
                    {formData.images?.[0]?.url && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-white/[0.1]">
                          <Image
                            src={getSafeImageUrl(formData.images[0].url)}
                            alt="Vehicle Preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white truncate">
                              {uploadStats?.original_name || "Active Vehicle Photo"}
                            </span>
                            {uploadStats ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                {uploadStats.reduction_percentage}% compressed
                              </span>
                            ) : formData.images[0].url.startsWith("/media/") ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Server Compressed
                              </span>
                            ) : null}
                          </div>

                          {uploadStats ? (
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-1">
                              <span>{(uploadStats.original_size / 1024).toFixed(0)} KB</span>
                              <span>&rarr;</span>
                              <span className="text-emerald-300 font-semibold">
                                {(uploadStats.compressed_size / 1024).toFixed(0)} KB ({uploadStats.format})
                              </span>
                              <span>&middot;</span>
                              <span>{uploadStats.width}&times;{uploadStats.height}px</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                              {formData.images[0].url}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors"
                        >
                          Replace
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setUploadStats(null);
                            setFormData({
                              ...formData,
                              images: [{ url: preset.url, is_primary: true, caption: preset.label }],
                            });
                          }}
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
                      placeholder="https://images.unsplash.com/... or /media/vehicles/..."
                      value={formData.images?.[0]?.url || ""}
                      onChange={(e) => {
                        setUploadStats(null);
                        setFormData({
                          ...formData,
                          images: [{ url: e.target.value, is_primary: true }],
                        });
                      }}
                      className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                    />
                  </div>
                )}
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
                    <span className="font-semibold block text-rose-200 mb-0.5">
                      {editingVehicle ? "Update Failed" : "Registration Failed"}
                    </span>
                    <span className="text-rose-300/90 leading-relaxed">{modalError}</span>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeVehicleModal}
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
                      {editingVehicle ? "Saving Changes..." : "Registering Asset..."}
                    </span>
                  ) : editingVehicle ? (
                    <span className="flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      Save Changes
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

      {/* Host Vehicle Review & Approval Modal */}
      {reviewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl dark:bg-zinc-950 bg-white border dark:border-white/[0.12] border-slate-200 p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b dark:border-white/[0.08] border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold dark:text-white text-slate-900 font-serif">
                      Review Host Vehicle Application
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                      Awaiting Owner Approval
                    </span>
                  </div>
                  <p className="text-xs dark:text-zinc-400 text-slate-500 mt-0.5">
                    {reviewingVehicle.brand} {reviewingVehicle.model} ({reviewingVehicle.year}) &middot; License Plate: <span className="font-mono text-amber-400 font-semibold">{reviewingVehicle.license_plate}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewingVehicle(null)}
                className="text-zinc-400 hover:text-white rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Parsed Details Body */}
            {(() => {
              const hostMeta = parseHostDetails(reviewingVehicle.description);
              const allImages = Array.isArray(reviewingVehicle.images) ? reviewingVehicle.images : [];

              return (
                <div className="space-y-6">
                  {/* Host Owner & Driver Info Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Owner Card */}
                    <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                        <User className="h-4 w-4" />
                        <span>Vehicle Owner Details (गाडी धनी)</span>
                      </div>
                      <div className="text-xs space-y-1.5 dark:text-zinc-300 text-slate-700">
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Owner Name:</span>
                          <span className="font-semibold dark:text-white text-slate-900">{hostMeta?.ownerName || "Registered Partner"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Phone:</span>
                          <span className="font-mono dark:text-white text-slate-900">{hostMeta?.ownerPhone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Email:</span>
                          <span className="font-mono dark:text-white text-slate-900">{hostMeta?.ownerEmail || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Location:</span>
                          <span className="dark:text-white text-slate-900">{hostMeta?.location || "Kathmandu"}</span>
                        </div>
                        {hostMeta?.referenceId && (
                          <div className="flex justify-between pt-1 border-t dark:border-white/[0.05] border-slate-200">
                            <span className="dark:text-zinc-500 text-slate-500">Reference ID:</span>
                            <span className="font-mono font-bold text-amber-400">{hostMeta.referenceId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Driver Card */}
                    <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        <Car className="h-4 w-4" />
                        <span>Assigned Chauffeur / Driver</span>
                      </div>
                      <div className="text-xs space-y-1.5 dark:text-zinc-300 text-slate-700">
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Driver Name:</span>
                          <span className="font-semibold dark:text-white text-slate-900">{hostMeta?.driverName || reviewingVehicle.driver_name || "Self-Driven"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Driver Phone:</span>
                          <span className="font-mono dark:text-white text-slate-900">{hostMeta?.driverPhone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Driving License:</span>
                          <span className="font-mono dark:text-white text-slate-900">{hostMeta?.licenseNumber || "Verified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-zinc-500 text-slate-500">Smoking Allowed:</span>
                          <span className="dark:text-white text-slate-900">{hostMeta?.smokingAllowed || "No"}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t dark:border-white/[0.05] border-slate-200">
                          <span className="dark:text-zinc-500 text-slate-500">Driver Included:</span>
                          <span className="font-semibold text-emerald-400">Yes (With Vehicle)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Technical Specifications */}
                  <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider dark:text-zinc-400 text-slate-500">
                      <Gauge className="h-4 w-4 text-primary" />
                      <span>Vehicle Specifications</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Make &amp; Model</span>
                        <span className="font-medium dark:text-white text-slate-900">{reviewingVehicle.brand} {reviewingVehicle.model}</span>
                      </div>
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Year</span>
                        <span className="font-mono dark:text-white text-slate-900">{reviewingVehicle.year}</span>
                      </div>
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Transmission</span>
                        <span className="capitalize dark:text-white text-slate-900">{reviewingVehicle.transmission}</span>
                      </div>
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Fuel Type</span>
                        <span className="capitalize dark:text-white text-slate-900">{reviewingVehicle.fuel_type}</span>
                      </div>
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Seats / Doors</span>
                        <span className="dark:text-white text-slate-900">{reviewingVehicle.seats} Seats &middot; {reviewingVehicle.doors} Doors</span>
                      </div>
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Color</span>
                        <span className="dark:text-white text-slate-900">{reviewingVehicle.color}</span>
                      </div>
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Depot Branch</span>
                        <span className="dark:text-white text-slate-900">{reviewingVehicle.branch_name || "Main Branch"}</span>
                      </div>
                      <div>
                        <span className="dark:text-zinc-500 text-slate-500 block text-[11px]">Review Status</span>
                        <span className="text-amber-400 font-semibold uppercase text-[10px]">Awaiting Approval</span>
                      </div>
                    </div>

                    {/* Features Badges */}
                    {Array.isArray(reviewingVehicle.features) && reviewingVehicle.features.length > 0 && (
                      <div className="pt-2 border-t dark:border-white/[0.05] border-slate-200 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] dark:text-zinc-500 text-slate-500 mr-1">Features:</span>
                        {reviewingVehicle.features.map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md dark:bg-white/[0.05] bg-slate-100 dark:text-zinc-300 text-slate-700 border dark:border-white/[0.08] border-slate-200"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Uploaded Documents & Media Gallery */}
                  <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider dark:text-zinc-400 text-slate-500">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <span>Uploaded Documents &amp; Vehicle Media ({allImages.length} Files)</span>
                      </div>
                      <span className="text-[11px] dark:text-zinc-500 text-slate-500">Click any image to enlarge</span>
                    </div>

                    {allImages.length === 0 ? (
                      <p className="text-xs dark:text-zinc-500 text-slate-400 py-3 text-center">No images uploaded.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {allImages.map((imgItem, idx) => {
                          const imgUrl = typeof imgItem === "string" ? imgItem : imgItem.url;
                          const isBluebook = idx === 4 || idx === 5 || imgUrl.includes("bluebook");
                          const isInsurance = idx === 6 || imgUrl.includes("insurance");
                          const label = isBluebook
                            ? `Bluebook Doc #${idx - 3}`
                            : isInsurance
                            ? "Insurance Certificate"
                            : `Vehicle Angle #${idx + 1}`;

                          return (
                            <div
                              key={idx}
                              onClick={() => setPreviewImage(imgUrl)}
                              className="group relative cursor-pointer overflow-hidden rounded-xl border dark:border-white/[0.08] border-slate-200 bg-black/40 hover:border-primary/50 transition-all aspect-video flex flex-col justify-end p-2"
                            >
                              <img
                                src={imgUrl}
                                alt={label}
                                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                              <div className="relative z-10 flex items-center justify-between">
                                <span className="text-[10px] font-medium text-white truncate max-w-[120px] drop-shadow-sm">
                                  {label}
                                </span>
                                <Eye className="h-3.5 w-3.5 text-zinc-300 group-hover:text-primary transition-colors shrink-0" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Approval Controls: Rate and Category */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span>Fleet Operator Pricing &amp; Category Settings</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs dark:text-zinc-300 text-slate-700 block mb-1">
                          Approved Daily Rental Base Rate ({currencySymbol} / day) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={reviewDailyRate}
                          onChange={(e) => setReviewDailyRate(e.target.value)}
                          className="dark:bg-black/60 bg-white dark:border-white/[0.1] border-slate-200 dark:text-white text-slate-900 font-mono"
                          placeholder="e.g. 75.00"
                        />
                        <p className="text-[11px] dark:text-zinc-500 text-slate-500 mt-1">
                          You can adjust the rental rate charged to clients on your storefront.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs dark:text-zinc-300 text-slate-700 block mb-1">
                          Fleet Category Assignment
                        </label>
                        <Select
                          value={reviewCategory}
                          onChange={(e) => setReviewCategory(e.target.value)}
                          className="dark:bg-black/60 bg-white dark:border-white/[0.1] border-slate-200 dark:text-white text-slate-900"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                          {categories.length === 0 && (
                            <>
                              <option value="sedan">Executive Sedan</option>
                              <option value="suv">Premium SUV</option>
                              <option value="luxury">Luxury Flagship</option>
                              <option value="sports">Exotic Sports</option>
                              <option value="van">Van / Minivan</option>
                              <option value="electric">Electric / EV</option>
                            </>
                          )}
                        </Select>
                        <p className="text-[11px] dark:text-zinc-500 text-slate-500 mt-1">
                          Category will determine storefront filtering and search groupings.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t dark:border-white/[0.08] border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReviewingVehicle(null)}
                      className="w-full sm:w-auto text-xs dark:border-white/[0.1] border-slate-300 dark:text-zinc-400 text-slate-600"
                    >
                      Close Window
                    </Button>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isReviewSubmitting}
                        onClick={handleRejectVehicle}
                        className="flex-1 sm:flex-initial text-xs bg-rose-600/90 hover:bg-rose-700 text-white"
                      >
                        {isReviewSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <X className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Reject Submission
                      </Button>

                      <Button
                        type="button"
                        disabled={isReviewSubmitting}
                        onClick={handleApproveVehicle}
                        className="flex-1 sm:flex-initial text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                      >
                        {isReviewSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Approve &amp; Activate to Fleet
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Full-size Image Lightbox Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white text-xs font-mono bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-md"
            >
              Close (ESC)
            </button>
            <img
              src={previewImage}
              alt="Document Preview"
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}

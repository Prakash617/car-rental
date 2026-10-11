"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Tag,
  Settings2,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Phone,
  Mail,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  Branch,
  CreateBranchPayload,
} from "@/lib/api/branches";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryItem,
  CategoryPayload,
} from "@/lib/api/categories";
import {
  fetchTransmissions,
  createTransmission,
  updateTransmission,
  deleteTransmission,
  TransmissionItem,
  TransmissionPayload,
} from "@/lib/api/transmissions";

type ActiveTab = "branches" | "categories" | "transmissions";

function SettingsPageContent() {
  const { token, tenantDomain } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTab) || "branches";
  const tenantParam = searchParams.get("tenant");
  const activeTenant = tenantParam || tenantDomain || "superbang.localhost";
  const cleanDomain = activeTenant.replace(/:\d+$/, "");
  const tenantHost = `${cleanDomain}:3000`;

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transmissions, setTransmissions] = useState<TransmissionItem[]>([]);

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<CreateBranchPayload & { is_active: boolean }>({
    name: "",
    code: "",
    city: "",
    address_line1: "",
    phone: "",
    email: "",
    is_active: true,
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryPayload>({
    name: "",
    slug: "",
    description: "",
  });

  // Transmission Modal State
  const [isTransmissionModalOpen, setIsTransmissionModalOpen] = useState(false);
  const [editingTransmission, setEditingTransmission] = useState<TransmissionItem | null>(null);
  const [transmissionForm, setTransmissionForm] = useState<TransmissionPayload>({
    name: "",
    slug: "",
    description: "",
  });

  // Submit / Delete loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [branchData, catData, transData] = await Promise.all([
        fetchBranches(token || undefined, tenantHost).catch(() => []),
        fetchCategories(tenantHost).catch(() => []),
        fetchTransmissions(tenantHost).catch(() => []),
      ]);
      setBranches(branchData);
      setCategories(catData);
      setTransmissions(transData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load settings data";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token, tenantHost]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // BRANCH HANDLERS
  // ==========================================
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: "",
      code: "",
      city: "",
      address_line1: "",
      phone: "",
      email: "",
      is_active: true,
    });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchForm({
      name: b.name,
      code: b.code,
      city: b.city || "",
      address_line1: b.address_line1 || "",
      phone: b.phone || "",
      email: b.email || "",
      is_active: b.is_active,
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) {
      toast.error("Please provide a branch name");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingBranch) {
        const updated = await updateBranch(editingBranch.id, branchForm, token || undefined);
        setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        toast.success(`Branch "${updated.name}" updated successfully!`);
      } else {
        const created = await createBranch(branchForm, token || undefined);
        setBranches((prev) => [...prev, created]);
        toast.success(`Branch "${created.name}" created successfully!`);
      }
      setIsBranchModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save branch";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    if (!confirm(`Are you sure you want to delete branch "${branch.name}"?`)) return;
    setDeletingId(branch.id);
    try {
      await deleteBranch(branch.id, token || undefined);
      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
      toast.success(`Branch "${branch.name}" deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete branch";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // CATEGORY HANDLERS
  // ==========================================
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", description: "" });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (c: CategoryItem) => {
    setEditingCategory(c);
    setCategoryForm({ name: c.name, slug: c.slug, description: c.description || "" });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error("Please provide a category name");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, categoryForm, token || undefined);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success(`Category "${updated.name}" updated!`);
      } else {
        const created = await createCategory(categoryForm, token || undefined);
        setCategories((prev) => [...prev, created]);
        toast.success(`Category "${created.name}" created!`);
      }
      setIsCategoryModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id, token || undefined);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success(`Category "${cat.name}" deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // TRANSMISSION HANDLERS
  // ==========================================
  const handleOpenAddTransmission = () => {
    setEditingTransmission(null);
    setTransmissionForm({ name: "", slug: "", description: "" });
    setIsTransmissionModalOpen(true);
  };

  const handleOpenEditTransmission = (t: TransmissionItem) => {
    setEditingTransmission(t);
    setTransmissionForm({ name: t.name, slug: t.slug, description: t.description || "" });
    setIsTransmissionModalOpen(true);
  };

  const handleSaveTransmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transmissionForm.name.trim()) {
      toast.error("Please provide a transmission name");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingTransmission) {
        const updated = await updateTransmission(
          editingTransmission.id,
          transmissionForm,
          token || undefined
        );
        setTransmissions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success(`Transmission "${updated.name}" updated!`);
      } else {
        const created = await createTransmission(transmissionForm, token || undefined);
        setTransmissions((prev) => [...prev, created]);
        toast.success(`Transmission "${created.name}" created!`);
      }
      setIsTransmissionModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save transmission";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransmission = async (trans: TransmissionItem) => {
    if (!confirm(`Are you sure you want to delete transmission "${trans.name}"?`)) return;
    setDeletingId(trans.id);
    try {
      await deleteTransmission(trans.id, token || undefined);
      setTransmissions((prev) => prev.filter((t) => t.id !== trans.id));
      toast.success(`Transmission "${trans.name}" deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete transmission";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // Filters
  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransmissions = transmissions.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 md:text-3xl">
              Fleet Settings &amp; Branches
            </h1>
            <span className="rounded-md border dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.04] bg-slate-100 px-2.5 py-0.5 text-xs font-mono dark:text-zinc-400 text-slate-600">
              Taxonomy &amp; Depots
            </span>
          </div>
          <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">
            Configure depot branches, vehicle classification categories, and gearbox transmission types.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="dark:border-white/[0.08] border-slate-200 dark:bg-white/[0.02] bg-slate-100 dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {activeTab === "branches" && (
            <Button
              size="sm"
              onClick={handleOpenAddBranch}
              className="bg-[#D4AF37] text-black font-semibold hover:bg-amber-400 shadow-md shadow-amber-500/20"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Branch
            </Button>
          )}

          {activeTab === "categories" && (
            <Button
              size="sm"
              onClick={handleOpenAddCategory}
              className="bg-[#D4AF37] text-black font-semibold hover:bg-amber-400 shadow-md shadow-amber-500/20"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Category
            </Button>
          )}

          {activeTab === "transmissions" && (
            <Button
              size="sm"
              onClick={handleOpenAddTransmission}
              className="bg-[#D4AF37] text-black font-semibold hover:bg-amber-400 shadow-md shadow-amber-500/20"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Transmission
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b dark:border-white/[0.08] border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => {
            setActiveTab("branches");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "branches"
              ? "border-[#D4AF37] dark:text-white text-slate-900 dark:bg-white/[0.03] bg-slate-100/70"
              : "border-transparent dark:text-zinc-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/20 hover:border-slate-300"
          }`}
        >
          <Building2 className="w-4 h-4 text-[#D4AF37]" />
          <span>Branches</span>
          <span className="ml-1 rounded-full dark:bg-white/[0.08] bg-slate-200/80 px-2 py-0.2 text-[10px] font-mono">
            {branches.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("categories");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "border-[#D4AF37] dark:text-white text-slate-900 dark:bg-white/[0.03] bg-slate-100/70"
              : "border-transparent dark:text-zinc-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/20 hover:border-slate-300"
          }`}
        >
          <Tag className="w-4 h-4 text-[#D4AF37]" />
          <span>Vehicle Categories</span>
          <span className="ml-1 rounded-full dark:bg-white/[0.08] bg-slate-200/80 px-2 py-0.2 text-[10px] font-mono">
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("transmissions");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "transmissions"
              ? "border-[#D4AF37] dark:text-white text-slate-900 dark:bg-white/[0.03] bg-slate-100/70"
              : "border-transparent dark:text-zinc-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:border-white/20 hover:border-slate-300"
          }`}
        >
          <Settings2 className="w-4 h-4 text-[#D4AF37]" />
          <span>Transmissions</span>
          <span className="ml-1 rounded-full dark:bg-white/[0.08] bg-slate-200/80 px-2 py-0.2 text-[10px] font-mono">
            {transmissions.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 dark:text-zinc-500 text-slate-400" />
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 dark:bg-black/50 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-xs dark:text-white text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BRANCHES TABLE                                    */}
      {/* ======================================================== */}
      {activeTab === "branches" && (
        <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="dark:bg-white/[0.02] bg-slate-50/70 border-b dark:border-white/[0.08] border-slate-200">
              <TableRow className="dark:border-white/[0.08] border-slate-100 hover:bg-transparent">
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Branch Name &amp; Code</TableHead>
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Location</TableHead>
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Contact</TableHead>
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Status</TableHead>
                <TableHead className="text-right dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
                    <span className="text-xs font-mono mt-2 block">Loading depot branches...</span>
                  </TableCell>
                </TableRow>
              ) : filteredBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-zinc-500">
                    <Building2 className="w-8 h-8 mx-auto dark:text-zinc-600 text-slate-400 mb-2" />
                    <p className="text-sm font-medium dark:text-zinc-400 text-slate-600">No branches found</p>
                    <p className="text-xs dark:text-zinc-600 text-slate-400 mt-1">
                      Click &quot;Add Branch&quot; to register your first vehicle depot.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBranches.map((branch) => (
                  <TableRow key={branch.id} className="dark:border-white/[0.06] border-slate-100 dark:hover:bg-white/[0.02] hover:bg-slate-50/80">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg dark:bg-white/[0.04] bg-slate-100 border dark:border-white/[0.08] border-slate-200 flex items-center justify-center text-[#D4AF37]">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold dark:text-white text-slate-900 text-xs block">
                            {branch.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">
                            {branch.code}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs dark:text-zinc-300 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 dark:text-zinc-500 text-slate-400" />
                          <span>{branch.city || "Metropolis"}</span>
                        </div>
                        {branch.address_line1 && (
                          <span className="text-[11px] dark:text-zinc-500 text-slate-400 block">
                            {branch.address_line1}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs dark:text-zinc-400 text-slate-500">
                        {branch.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 dark:text-zinc-500 text-slate-400" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 dark:text-zinc-500 text-slate-400" />
                            <span>{branch.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                          branch.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "dark:bg-zinc-500/10 bg-slate-100 dark:text-zinc-400 text-slate-500 border-slate-200 dark:border-zinc-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${branch.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {branch.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditBranch(branch)}
                          className="h-7 px-2 dark:text-zinc-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === branch.id}
                          onClick={() => handleDeleteBranch(branch)}
                          className="h-7 px-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          {deletingId === branch.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CATEGORIES TABLE                                  */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* TAB 2: CATEGORIES TABLE                                  */}
      {/* ======================================================== */}
      {activeTab === "categories" && (
        <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="dark:bg-white/[0.02] bg-slate-50/70 border-b dark:border-white/[0.08] border-slate-200">
              <TableRow className="dark:border-white/[0.08] border-slate-100 hover:bg-transparent">
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Category Name &amp; Slug</TableHead>
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Description</TableHead>
                <TableHead className="text-right dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
                    <span className="text-xs font-mono mt-2 block">Loading categories...</span>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-zinc-500">
                    <Tag className="w-8 h-8 mx-auto dark:text-zinc-600 text-slate-400 mb-2" />
                    <p className="text-sm font-medium dark:text-zinc-400 text-slate-600">No categories found</p>
                    <p className="text-xs dark:text-zinc-600 text-slate-400 mt-1">
                      Click &quot;Add Category&quot; to create a new vehicle class.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="dark:border-white/[0.06] border-slate-100 dark:hover:bg-white/[0.02] hover:bg-slate-50/80">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold dark:text-white text-slate-900 text-xs block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-mono dark:text-zinc-400 text-slate-500 dark:bg-white/[0.04] bg-slate-100 px-1.5 py-0.5 rounded border dark:border-white/[0.08] border-slate-200">
                            slug: {cat.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs dark:text-zinc-400 text-slate-500 max-w-lg leading-relaxed">
                        {cat.description || "Standard vehicle catalog classification tier."}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="h-7 px-2 dark:text-zinc-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === cat.id}
                          onClick={() => handleDeleteCategory(cat)}
                          className="h-7 px-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TRANSMISSIONS TABLE                               */}
      {/* ======================================================== */}
      {activeTab === "transmissions" && (
        <div className="rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="dark:bg-white/[0.02] bg-slate-50/70 border-b dark:border-white/[0.08] border-slate-200">
              <TableRow className="dark:border-white/[0.08] border-slate-100 hover:bg-transparent">
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Transmission Name &amp; Slug</TableHead>
                <TableHead className="dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Description</TableHead>
                <TableHead className="text-right dark:text-zinc-400 text-slate-500 font-mono text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
                    <span className="text-xs font-mono mt-2 block">Loading transmissions...</span>
                  </TableCell>
                </TableRow>
              ) : filteredTransmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-zinc-500">
                    <Settings2 className="w-8 h-8 mx-auto dark:text-zinc-600 text-slate-400 mb-2" />
                    <p className="text-sm font-medium dark:text-zinc-400 text-slate-600">No transmissions found</p>
                    <p className="text-xs dark:text-zinc-600 text-slate-400 mt-1">
                      Click &quot;Add Transmission&quot; to configure gearbox specifications.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransmissions.map((trans) => (
                  <TableRow key={trans.id} className="dark:border-white/[0.06] border-slate-100 dark:hover:bg-white/[0.02] hover:bg-slate-50/80">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Settings2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold dark:text-white text-slate-900 text-xs block">
                            {trans.name}
                          </span>
                          <span className="text-[10px] font-mono dark:text-zinc-400 text-slate-500 dark:bg-white/[0.04] bg-slate-100 px-1.5 py-0.5 rounded border dark:border-white/[0.08] border-slate-200">
                            slug: {trans.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs dark:text-zinc-400 text-slate-500 max-w-lg leading-relaxed">
                        {trans.description || "Gearbox and powertrain transmission configuration."}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditTransmission(trans)}
                          className="h-7 px-2 dark:text-zinc-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === trans.id}
                          onClick={() => handleDeleteTransmission(trans)}
                          className="h-7 px-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          {deletingId === trans.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT BRANCH                               */}
      {/* ======================================================== */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-white/[0.12] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white font-serif">
                  {editingBranch ? "Edit Branch" : "Add Depot Branch"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Branch Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Airport VIP Terminal"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="bg-black/50 border-white/[0.08] text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Branch Code
                  </label>
                  <Input
                    placeholder="e.g. AIR-01"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    City
                  </label>
                  <Input
                    placeholder="e.g. Los Angeles"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Physical Address
                </label>
                <Input
                  placeholder="e.g. 100 World Way, Suite 400"
                  value={branchForm.address_line1}
                  onChange={(e) => setBranchForm({ ...branchForm, address_line1: e.target.value })}
                  className="bg-black/50 border-white/[0.08] text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone
                  </label>
                  <Input
                    placeholder="+1 (800) 555-0199"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="airport@fleet.local"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={branchForm.is_active}
                  onChange={(e) => setBranchForm({ ...branchForm, is_active: e.target.checked })}
                  className="rounded border-white/20 bg-black text-[#D4AF37]"
                />
                <span>Active Branch (Available for vehicle bookings)</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#D4AF37] text-black font-semibold hover:bg-amber-400"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Check className="w-4 h-4 mr-1.5" />
                  )}
                  {editingBranch ? "Save Changes" : "Create Branch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT CATEGORY                             */}
      {/* ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-white/[0.12] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white font-serif">
                  {editingCategory ? "Edit Category" : "Add Vehicle Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Exotic Supercars"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                    setCategoryForm({
                      ...categoryForm,
                      name,
                      slug: editingCategory ? categoryForm.slug : autoSlug,
                    });
                  }}
                  className="bg-black/50 border-white/[0.08] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Identifier Slug
                </label>
                <Input
                  placeholder="e.g. exotic-supercars"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase() })}
                  className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="High-performance exotic supercars with track capabilities..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-black/50 border border-white/[0.08] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#D4AF37] text-black font-semibold hover:bg-amber-400"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Check className="w-4 h-4 mr-1.5" />
                  )}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD / EDIT TRANSMISSION                         */}
      {/* ======================================================== */}
      {isTransmissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-white/[0.12] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white font-serif">
                  {editingTransmission ? "Edit Transmission" : "Add Transmission Type"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTransmissionModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Transmission Name *
                </label>
                <Input
                  required
                  placeholder="e.g. 7-Speed Dual-Clutch"
                  value={transmissionForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                    setTransmissionForm({
                      ...transmissionForm,
                      name,
                      slug: editingTransmission ? transmissionForm.slug : autoSlug,
                    });
                  }}
                  className="bg-black/50 border-white/[0.08] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Identifier Slug
                </label>
                <Input
                  placeholder="e.g. 7-speed-dual-clutch"
                  value={transmissionForm.slug}
                  onChange={(e) => setTransmissionForm({ ...transmissionForm, slug: e.target.value.toLowerCase() })}
                  className="bg-black/50 border-white/[0.08] text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Seamless dual-clutch transmission with lightning fast paddle shifts..."
                  value={transmissionForm.description}
                  onChange={(e) => setTransmissionForm({ ...transmissionForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-black/50 border border-white/[0.08] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTransmissionModalOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#D4AF37] text-black font-semibold hover:bg-amber-400"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Check className="w-4 h-4 mr-1.5" />
                  )}
                  {editingTransmission ? "Save Changes" : "Create Transmission"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FleetSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}

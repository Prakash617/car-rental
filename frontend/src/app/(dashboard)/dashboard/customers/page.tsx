"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { getCustomers, createCustomer, verifyCustomerKyc, CreateCustomerPayload } from "@/lib/api/dashboard";
import { Customer } from "@/types";
import { Plus, ShieldCheck, ShieldAlert, FileText, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export default function CustomersDirectoryPage() {
  const { token, tenantDomain } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingKyc, setIsVerifyingKyc] = useState(false);
  const [kycNotes, setKycNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  let queryTenant: string | null = null;
  if (typeof window !== "undefined") {
    queryTenant = new URLSearchParams(window.location.search).get("tenant");
  }
  const activeTenant = queryTenant || tenantDomain || "superbang.localhost";
  const cleanDomain = activeTenant.replace(/:\d+$/, "");
  const tenantHost = `${cleanDomain}:3000`;

  const [customerForm, setCustomerForm] = useState<CreateCustomerPayload>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    driver_license_number: "",
    license_expiry_date: "2029-12-31",
    date_of_birth: "1992-06-15",
    country: "US",
  });

  const loadCustomers = useCallback(async () => {
    try {
      const data = await getCustomers(token || undefined, tenantHost);
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, tenantHost]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await createCustomer(customerForm, token || undefined);
      setCustomers((prev) => [created, ...prev]);
      setShowAddModal(false);
      setCustomerForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        driver_license_number: "",
        license_expiry_date: "2029-12-31",
        date_of_birth: "1992-06-15",
        country: "US",
      });
      alert(`Customer ${created.first_name} ${created.last_name} registered successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register customer";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyKyc = async (status: "verified" | "rejected") => {
    if (!selectedCustomer) return;
    setIsVerifyingKyc(true);
    try {
      const updated = await verifyCustomerKyc(
        selectedCustomer.id,
        status,
        kycNotes || undefined,
        token || undefined
      );
      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setSelectedCustomer((prev) => (prev ? { ...prev, ...updated } : null));
      alert(`Customer KYC verification status set to ${status.toUpperCase()}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update customer KYC status";
      alert(msg);
    } finally {
      setIsVerifyingKyc(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(term) ||
      c.last_name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.driver_license_number.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 md:text-3xl">
            Customer Directory
          </h1>
          <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">
            Verify driver credentials, contact profiles, and rental eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCustomers}
            className="dark:border-white/[0.08] border-slate-200 dark:text-zinc-300 text-slate-700 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Register Customer
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white p-4 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-zinc-500 text-slate-400" />
          <Input
            placeholder="Search by customer name, email, or driver license (e.g. Bruce, DL-GOTHAM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 dark:bg-black/40 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-sm dark:text-white text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="dark:border-white/[0.08] border-slate-200 dark:bg-zinc-950/60 bg-white shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No registered customers found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="dark:border-white/[0.06] border-slate-100 hover:bg-transparent bg-slate-50/70 dark:bg-white/[0.02]">
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Customer</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Contact Info</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Driver License</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">License Expiry</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold">Status</TableHead>
                  <TableHead className="dark:text-zinc-400 text-slate-500 text-xs font-semibold text-right">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((c) => (
                  <TableRow
                    key={c.id}
                    className="dark:border-white/[0.06] border-slate-100 dark:hover:bg-white/[0.02] hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full dark:bg-white/[0.05] bg-slate-100 border dark:border-white/[0.08] border-slate-200 font-bold text-xs dark:text-white text-slate-800">
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <div>
                          <span className="font-semibold dark:text-white text-slate-900 text-sm block">
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="text-[11px] dark:text-zinc-500 text-slate-400 font-mono">
                            Country: {c.country}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 dark:text-zinc-300 text-slate-700">
                          <Mail className="h-3 w-3 dark:text-zinc-500 text-slate-400" />
                          <a href={`mailto:${c.email}`} className="hover:underline">
                            {c.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 dark:text-zinc-400 text-slate-500 font-mono text-[11px]">
                          <Phone className="h-3 w-3 dark:text-zinc-500 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Driver License */}
                    <TableCell>
                      <span className="inline-block px-2.5 py-1 rounded dark:bg-black/60 bg-slate-100 border dark:border-white/[0.12] border-slate-200 font-mono text-xs font-semibold dark:text-zinc-200 text-slate-800">
                        {c.driver_license_number}
                      </span>
                    </TableCell>

                    {/* Expiry */}
                    <TableCell>
                      <span className="font-mono text-xs dark:text-zinc-300 text-slate-700">
                        {c.license_expiry_date}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge type="customer" status={c.kyc_status || (c.is_verified ? "verified" : "unverified")} />
                    </TableCell>

                    {/* Registration Date */}
                    <TableCell className="text-right font-mono text-xs dark:text-zinc-400 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CUSTOMER DETAIL MODAL WITH KYC VERIFICATION */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="max-w-lg w-full dark:border-white/[0.12] border-slate-200 dark:bg-zinc-950 bg-white p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-4 top-4 dark:text-zinc-400 text-slate-400 dark:hover:text-white hover:text-slate-800"
            >
              ✕
            </button>
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 font-bold text-base text-amber-400">
                  {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold dark:text-white text-slate-900">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="dark:text-zinc-500 text-slate-400 font-mono text-[11px]">
                      ID: {selectedCustomer.id}
                    </span>
                    <StatusBadge type="customer" status={selectedCustomer.kyc_status || (selectedCustomer.is_verified ? "verified" : "unverified")} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t dark:border-white/[0.08] border-slate-100">
                <div>
                  <span className="dark:text-zinc-500 text-slate-500 block">Email Address</span>
                  <span className="dark:text-zinc-200 text-slate-800 font-mono mt-0.5 block">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="dark:text-zinc-500 text-slate-500 block">Phone</span>
                  <span className="dark:text-zinc-200 text-slate-800 font-mono mt-0.5 block">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="dark:text-zinc-500 text-slate-500 block">Driver License</span>
                  <span className="dark:text-zinc-200 text-slate-800 font-mono mt-0.5 block">{selectedCustomer.driver_license_number}</span>
                </div>
                <div>
                  <span className="dark:text-zinc-500 text-slate-500 block">Citizenship / National ID</span>
                  <span className="dark:text-zinc-200 text-slate-800 font-mono mt-0.5 block">{selectedCustomer.id_card_number || "Not provided"}</span>
                </div>
                <div>
                  <span className="dark:text-zinc-500 text-slate-500 block">License Expiry</span>
                  <span className="dark:text-zinc-200 text-slate-800 font-mono mt-0.5 block">{selectedCustomer.license_expiry_date || "—"}</span>
                </div>
                <div>
                  <span className="dark:text-zinc-500 text-slate-500 block">Country</span>
                  <span className="dark:text-zinc-200 text-slate-800 font-mono mt-0.5 block">{selectedCustomer.country}</span>
                </div>
              </div>

              {/* KYC Document Previews */}
              <div className="pt-3 border-t dark:border-white/[0.08] border-slate-100 space-y-2">
                <span className="dark:text-zinc-400 text-slate-600 font-semibold block">KYC Document Records</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl dark:bg-white/[0.03] bg-slate-50 border dark:border-white/[0.08] border-slate-200">
                    <span className="dark:text-zinc-400 text-slate-500 text-[11px] block">Driver&apos;s License</span>
                    {selectedCustomer.driver_license_image ? (
                      <a
                        href={selectedCustomer.driver_license_image}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center gap-1.5 text-blue-500 hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic mt-1 block">No file uploaded</span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl dark:bg-white/[0.03] bg-slate-50 border dark:border-white/[0.08] border-slate-200">
                    <span className="dark:text-zinc-400 text-slate-500 text-[11px] block">National ID / Passport</span>
                    {selectedCustomer.citizenship_image ? (
                      <a
                        href={selectedCustomer.citizenship_image}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center gap-1.5 text-blue-500 hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic mt-1 block">No file uploaded</span>
                    )}
                  </div>
                </div>

                {selectedCustomer.kyc_notes && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px]">
                    <span className="font-semibold block">Previous Audit Note:</span>
                    <p className="mt-0.5">{selectedCustomer.kyc_notes}</p>
                  </div>
                )}
              </div>

              {/* Staff KYC Review Controls */}
              <div className="pt-3 border-t dark:border-white/[0.08] border-slate-100 space-y-2">
                <span className="dark:text-zinc-400 text-slate-600 font-semibold block">Staff KYC Review Decision</span>
                <Input
                  value={kycNotes}
                  onChange={(e) => setKycNotes(e.target.value)}
                  placeholder="Verification note (e.g. License verified with Nagarik App / blur document)..."
                  className="dark:bg-black/40 bg-slate-50 dark:border-white/[0.08] border-slate-200 text-xs"
                />

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    disabled={isVerifyingKyc}
                    onClick={() => handleVerifyKyc("verified")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve KYC
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isVerifyingKyc}
                    onClick={() => handleVerifyKyc("rejected")}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject KYC
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t dark:border-white/[0.08] border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                  className="border-white/[0.1] text-zinc-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* REGISTER CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full border-white/[0.12] bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Register New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">First Name *</label>
                  <Input
                    value={customerForm.first_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, first_name: e.target.value })}
                    required
                    className="bg-black/40 border-white/[0.08] text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Last Name *</label>
                  <Input
                    value={customerForm.last_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, last_name: e.target.value })}
                    required
                    className="bg-black/40 border-white/[0.08] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Email Address *</label>
                  <Input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    required
                    className="bg-black/40 border-white/[0.08] text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Phone Number *</label>
                  <Input
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    required
                    className="bg-black/40 border-white/[0.08] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Driver License Number *</label>
                <Input
                  value={customerForm.driver_license_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, driver_license_number: e.target.value })}
                  placeholder="e.g. DL-CALIFORNIA-9988"
                  required
                  className="bg-black/40 border-white/[0.08] text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">License Expiry *</label>
                  <Input
                    type="date"
                    value={customerForm.license_expiry_date}
                    onChange={(e) => setCustomerForm({ ...customerForm, license_expiry_date: e.target.value })}
                    required
                    className="bg-black/40 border-white/[0.08] text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Birth Date *</label>
                  <Input
                    type="date"
                    value={customerForm.date_of_birth}
                    onChange={(e) => setCustomerForm({ ...customerForm, date_of_birth: e.target.value })}
                    required
                    className="bg-black/40 border-white/[0.08] text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Country</label>
                  <Input
                    value={customerForm.country}
                    onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                    className="bg-black/40 border-white/[0.08] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="border-white/[0.1] text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Create Customer
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

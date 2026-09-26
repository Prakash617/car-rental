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
import { getCustomers, createCustomer, CreateCustomerPayload } from "@/lib/api/dashboard";
import { Customer } from "@/types";
import { Plus } from "lucide-react";

export default function CustomersDirectoryPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      const data = await getCustomers(token || undefined);
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

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
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Customer Directory
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Verify driver credentials, contact profiles, and rental eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCustomers}
            className="border-white/[0.08] text-zinc-300 hover:text-white"
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
      <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by customer name, email, or driver license (e.g. Bruce, DL-GOTHAM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-black/40 border-white/[0.08] text-sm text-white"
          />
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
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
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs">Customer</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Contact Info</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Driver License</TableHead>
                  <TableHead className="text-zinc-400 text-xs">License Expiry</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Status</TableHead>
                  <TableHead className="text-zinc-400 text-xs text-right">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-white/[0.06] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08] font-bold text-xs text-white">
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm block">
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            Country: {c.country}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Mail className="h-3 w-3 text-zinc-500" />
                          <a href={`mailto:${c.email}`} className="hover:underline">
                            {c.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-zinc-500" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Driver License */}
                    <TableCell>
                      <span className="inline-block px-2.5 py-1 rounded bg-black/60 border border-white/[0.12] font-mono text-xs font-semibold text-zinc-200">
                        {c.driver_license_number}
                      </span>
                    </TableCell>

                    {/* Expiry */}
                    <TableCell>
                      <span className="font-mono text-xs text-zinc-300">
                        {c.license_expiry_date}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge type="customer" status={c.is_verified ? "verified" : "pending"} />
                    </TableCell>

                    {/* Registration Date */}
                    <TableCell className="text-right font-mono text-xs text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full border-white/[0.12] bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 font-bold text-base text-amber-400">
                  {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h3>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    ID: {selectedCustomer.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
                <div>
                  <span className="text-zinc-500 block">Email Address</span>
                  <span className="text-zinc-200 font-mono mt-0.5 block">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Phone</span>
                  <span className="text-zinc-200 font-mono mt-0.5 block">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Driver License</span>
                  <span className="text-zinc-200 font-mono mt-0.5 block">{selectedCustomer.driver_license_number}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">License Expiry</span>
                  <span className="text-zinc-200 font-mono mt-0.5 block">{selectedCustomer.license_expiry_date}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Date of Birth</span>
                  <span className="text-zinc-200 font-mono mt-0.5 block">{selectedCustomer.date_of_birth}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Country</span>
                  <span className="text-zinc-200 font-mono mt-0.5 block">{selectedCustomer.country}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block">Verification Status</span>
                  <div className="mt-1">
                    <StatusBadge type="customer" status={selectedCustomer.is_verified ? "verified" : "pending"} />
                  </div>
                </div>
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

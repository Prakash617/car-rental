"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Globe,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  fetchTenantDomains,
  addCustomDomain,
  verifyCustomDomain,
  TenantDomain,
} from "@/lib/api/domains";

export default function CustomDomainsPage() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  const loadDomains = useCallback(async () => {
    try {
      const data = await fetchTenantDomains(token || undefined);
      setDomains(data);
    } catch (err) {
      console.error("Failed to load domains:", err);
      toast.error("Failed to load custom domains");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    setIsProcessing(true);
    try {
      const created = await addCustomDomain(newDomain.trim(), token || undefined);
      setDomains((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewDomain("");
      toast.success("Domain registered", {
        description: `Domain '${created.domain}' added. Please configure DNS CNAME record.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add domain";
      toast.error("Domain addition failed", { description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setIsProcessing(true);
    try {
      const updated = await verifyCustomDomain(domainId, token || undefined);
      setDomains((prev) => prev.map((d) => (d.id === domainId ? updated : d)));
      toast.success("Domain verified!", {
        description: `Domain '${updated.domain}' verified with active Let's Encrypt TLS 1.3 certificate!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "DNS verification failed";
      toast.error("Verification failed", { description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard", { description: text });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Custom Domains & SSL
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-mono text-cyan-400">
              Edge Routing
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Connect white-label custom domains with automated Let&apos;s Encrypt TLS certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDomains}
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
            Add Custom Domain
          </Button>
        </div>
      </div>


      {/* DNS Configuration Guide */}
      <Card className="border-white/[0.08] bg-zinc-950/60 p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Globe className="h-4 w-4 text-cyan-400" />
          DNS Record Configuration Instructions
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          To connect a custom domain or subdomain (e.g. <code className="text-zinc-200">rentals.yourbrand.com</code>), create the following CNAME record at your DNS provider:
        </p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg border border-white/[0.06] bg-black/40 p-3 text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block">Record Type</span>
            <span className="text-emerald-400 font-bold">CNAME</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block">Host / Name</span>
            <span className="text-zinc-200">rentals (or your subdomain)</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 block">Points To (Target)</span>
              <span className="text-cyan-400">cname.apex-platform.com</span>
            </div>
            <button
              onClick={() => copyToClipboard("cname.apex-platform.com")}
              className="text-zinc-400 hover:text-white p-1"
              title="Copy CNAME target"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Domains Table */}
      <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : domains.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No domains configured for this tenant.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs">Hostname</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Role</TableHead>
                  <TableHead className="text-zinc-400 text-xs">DNS Verification</TableHead>
                  <TableHead className="text-zinc-400 text-xs">SSL Certificate</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Target CNAME</TableHead>
                  <TableHead className="text-zinc-400 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-zinc-400" />
                        <span className="font-mono text-xs font-bold text-white">
                          {d.domain}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {d.is_primary ? (
                        <span className="inline-block rounded bg-primary/20 border border-primary/30 px-2 py-0.5 text-[10px] font-mono font-medium text-primary">
                          PRIMARY
                        </span>
                      ) : (
                        <span className="inline-block rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                          CUSTOM
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {d.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                          <Clock className="h-3.5 w-3.5" />
                          Pending CNAME
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {d.ssl_certificate.type}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-[11px] text-zinc-400">
                        {d.target_cname}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      {!d.is_verified ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() => handleVerify(d.id)}
                          className="h-7 px-2.5 text-[11px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                        >
                          Verify DNS
                        </Button>
                      ) : (
                        <a
                          href={`http://${d.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ADD CUSTOM DOMAIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full border-white/[0.12] bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Connect Custom Domain</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your custom domain or subdomain. You will need to add a CNAME record at your DNS provider pointing to <code className="text-cyan-400">cname.apex-platform.com</code>.
            </p>

            <form onSubmit={handleAddDomain} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Domain Hostname *</label>
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. rentals.apex-motors.com"
                  className="bg-black/40 border-white/[0.08] text-white font-mono"
                  required
                />
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
                  disabled={isProcessing}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Add Domain
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

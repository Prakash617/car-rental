"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Clock,
  UserCheck,
  FileCode2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchAuditLogs, AuditLogItem } from "@/lib/api/audit";

export default function AuditTrailPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchAuditLogs(token || undefined);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.actor_email.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.resource_type.toLowerCase().includes(q) ||
      log.resource_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Audit Trail & Security Logs
            </h1>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
              Immutable
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Cryptographically sealed timeline of staff actions, reservation changes, and fleet events.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadLogs}
          className="border-white/[0.08] text-zinc-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-white/[0.08] bg-zinc-950/60 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by actor email, action (e.g. CREATE_VEHICLE, CANCEL_BOOKING), or resource ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-black/40 border-white/[0.08] text-sm text-white"
          />
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No audit logs recorded yet. Changes to vehicles, reservations, and maintenance will appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs">Timestamp</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Actor Email</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Action Type</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Resource Target</TableHead>
                  <TableHead className="text-zinc-400 text-xs text-right">Event Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-white/[0.06] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-white">
                        <UserCheck className="h-3 w-3 text-zinc-400" />
                        <span className="font-mono">{log.actor_email}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-400">
                        {log.action}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="text-zinc-200 font-semibold">{log.resource_type}</span>
                        {log.resource_id && (
                          <span className="block text-[10px] font-mono text-zinc-500 truncate max-w-[140px]">
                            {log.resource_id}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                      >
                        <FileCode2 className="h-3.5 w-3.5 mr-1" />
                        View Diff
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* PAYLOAD INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full border-white/[0.12] bg-zinc-950 p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Immutable Event Payload</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-white/[0.08] pt-2">
                <div>
                  <span className="text-zinc-500 block">Actor:</span>
                  <span className="text-zinc-200">{selectedLog.actor_email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Action:</span>
                  <span className="text-amber-400 font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Resource:</span>
                  <span className="text-zinc-200">{selectedLog.resource_type} ({selectedLog.resource_id})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Timestamp:</span>
                  <span className="text-zinc-200">{new Date(selectedLog.timestamp).toISOString()}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1 text-[11px] font-semibold uppercase">Captured Event State (JSON):</span>
                <pre className="max-h-60 overflow-y-auto rounded bg-black/80 border border-white/[0.1] p-3 text-[11px] font-mono text-emerald-400">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/[0.08]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                  className="border-white/[0.1] text-zinc-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  type: "vehicle" | "booking" | "payment" | "customer";
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  if (type === "vehicle") {
    switch (normalized) {
      case "available":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", className)}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case "rented":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20", className)}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            On Rental
          </span>
        );
      case "maintenance":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20", className)}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Maintenance
          </span>
        );
      case "reserved":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20", className)}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Reserved
          </span>
        );
      default:
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20", className)}>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Inactive
          </span>
        );
    }
  }

  if (type === "booking") {
    switch (normalized) {
      case "confirmed":
        return (
          <Badge variant="outline" className={cn("border-emerald-500/30 bg-emerald-500/10 text-emerald-400", className)}>
            Confirmed
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className={cn("border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold", className)}>
            Active Rental
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className={cn("border-amber-500/30 bg-amber-500/10 text-amber-400", className)}>
            Pending Approval
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className={cn("border-zinc-500/30 bg-zinc-500/10 text-zinc-400", className)}>
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className={cn("bg-rose-500/15 text-rose-400 border border-rose-500/30", className)}>
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  if (type === "payment") {
    switch (normalized) {
      case "paid":
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", className)}>
            PAID
          </span>
        );
      case "partially_paid":
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30", className)}>
            PARTIAL
          </span>
        );
      case "refunded":
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30", className)}>
            REFUNDED
          </span>
        );
      default:
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30", className)}>
            UNPAID
          </span>
        );
    }
  }

  // Customer verification
  if (normalized === "verified" || normalized === "true") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold", className)}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Verified
      </span>
    );
  }
  if (normalized === "pending") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-amber-500 font-semibold", className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Pending Review
      </span>
    );
  }
  if (normalized === "rejected") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-rose-500 font-semibold", className)}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Rejected
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-zinc-400 font-medium", className)}>
      Unverified
    </span>
  );
}

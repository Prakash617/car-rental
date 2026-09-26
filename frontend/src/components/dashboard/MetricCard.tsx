import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl transition-all hover:border-white/[0.16]",
        highlight && "border-primary/40 bg-primary/[0.03]"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
            {title}
          </p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <h4 className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {value}
          </h4>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold",
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground/80 font-normal">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

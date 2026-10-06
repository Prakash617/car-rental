"use client";

import React from "react";
import Image from "next/image";
import { VehicleCardProps } from "@/lib/themes/types";
import { Zap, Gauge, Users, Check, Sparkles } from "lucide-react";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

export function UrbanVehicleCard({ vehicle, branding, onSelect }: VehicleCardProps) {
  const isAvailable = vehicle.status === "available";
  const firstImage = vehicle.images?.[0];
  const rawImage =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || DEFAULT_VEHICLE_IMAGE;
  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

  return (
    <div className="group relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] flex flex-col justify-between">
      {/* City Tags */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-slate-950/80 backdrop-blur-md border border-slate-800 text-cyan-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {vehicle.category}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border ${
            isAvailable
              ? "bg-cyan-950/80 border-cyan-500/40 text-cyan-300"
              : "bg-slate-950/80 border-slate-800 text-slate-500"
          }`}
        >
          {isAvailable ? "Instant Unlock" : vehicle.status}
        </span>
      </div>

      {/* Urban Vehicle Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <Image
          src={primaryImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-85 z-1" />
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{vehicle.brand}</div>
          <h3 className="text-xl font-sans font-bold text-white mt-0.5 tracking-tight flex items-baseline justify-between">
            <span>{vehicle.model}</span>
            <span className="text-xs font-mono font-normal text-slate-400">{vehicle.year}</span>
          </h3>
        </div>

        {/* Mobility Metrics */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{vehicle.seats} Seats</span>
          </div>
        </div>

        {/* Daily / Hourly pricing */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">City Daily Pass</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono tabular-nums font-black text-white">
                {branding.currency || "USD"} {vehicle.daily_rate}
              </span>
              <span className="text-xs text-slate-400">/day</span>
            </div>
          </div>

          <button
            onClick={() => onSelect?.(vehicle)}
            disabled={!isAvailable}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              isAvailable
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95"
                : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50"
            }`}
          >
            <span>{isAvailable ? "Unlock Car" : "In Transit"}</span>
            {isAvailable && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

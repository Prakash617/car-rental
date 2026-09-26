"use client";

import React from "react";
import Image from "next/image";
import { VehicleCardProps } from "@/lib/themes/types";
import { Mountain, Compass, Users, Check, ShieldAlert } from "lucide-react";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

export function AdventureVehicleCard({ vehicle, branding, onSelect }: VehicleCardProps) {
  const isAvailable = vehicle.status === "available";
  const rawImage =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[0].url
      : DEFAULT_VEHICLE_IMAGE;
  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

  return (
    <div className="group relative rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_10px_35px_rgba(34,197,94,0.15)] flex flex-col justify-between">
      {/* Expedition Category & Readiness */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-stone-950/80 backdrop-blur-md border border-stone-800 text-stone-300 flex items-center gap-1">
          <Mountain className="w-3 h-3 text-emerald-400" />
          {vehicle.category}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border ${
            isAvailable
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : "bg-stone-950/80 border-stone-700 text-stone-500"
          }`}
        >
          {isAvailable ? "Trail Ready" : vehicle.status}
        </span>
      </div>

      {/* Rugged Imagery */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-950">
        <Image
          src={primaryImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-90 z-1" />
      </div>

      {/* Specs & Rig Info */}
      <div className="p-6 space-y-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">{vehicle.brand}</div>
          <h3 className="text-xl font-sans font-bold text-stone-100 mt-0.5 tracking-tight flex items-baseline justify-between">
            <span>{vehicle.model}</span>
            <span className="text-xs font-mono font-normal text-stone-400">{vehicle.year}</span>
          </h3>
        </div>

        {/* Trail Capabilities */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-800 text-xs text-stone-300 font-mono">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">4WD</span>
            <span className="capitalize">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{vehicle.seats} Berths</span>
          </div>
        </div>

        {/* Daily Overland Rate & Book */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-[11px] text-stone-400 block">Overland Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono tabular-nums font-extrabold text-stone-100">
                {branding.currency || "USD"} {vehicle.daily_rate}
              </span>
              <span className="text-xs text-stone-400">/day</span>
            </div>
            {vehicle.deposit_amount && (
              <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5 font-mono">
                <ShieldAlert className="w-2.5 h-2.5 text-stone-400" /> Trail Deposit: {branding.currency || "USD"} {vehicle.deposit_amount}
              </span>
            )}
          </div>

          <button
            onClick={() => onSelect?.(vehicle)}
            disabled={!isAvailable}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 ${
              isAvailable
                ? "bg-emerald-500 hover:bg-emerald-400 text-stone-950 active:scale-95 shadow-md shadow-emerald-600/20"
                : "bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700/50"
            }`}
          >
            <span>{isAvailable ? "Reserve Rig" : "Deployed"}</span>
            {isAvailable && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

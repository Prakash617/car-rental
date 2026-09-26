"use client";

import React from "react";
import Image from "next/image";
import { VehicleCardProps } from "@/lib/themes/types";
import { Zap, Gauge, Users, ArrowUpRight, ShieldCheck } from "lucide-react";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

export function ModernVehicleCard({ vehicle, branding, onSelect }: VehicleCardProps) {
  const isAvailable = vehicle.status === "available";
  const rawImage =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[0].url
      : DEFAULT_VEHICLE_IMAGE;
  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

  const isElectric = vehicle.fuel_type === "electric";

  return (
    <div className="group relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] flex flex-col justify-between">
      {/* Top Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wider uppercase bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-zinc-300">
          {vehicle.category}
        </span>
        {isElectric && (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wider uppercase bg-blue-500/20 backdrop-blur-md border border-blue-500/40 text-blue-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> EV
          </span>
        )}
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md border ${
            isAvailable
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-800/80 border-zinc-700 text-zinc-400"
          }`}
        >
          {isAvailable ? "Ready to Drive" : vehicle.status}
        </span>
      </div>

      {/* Vehicle Media */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <Image
          src={primaryImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80 z-1" />
      </div>

      {/* Vehicle Information */}
      <div className="p-6 space-y-5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">{vehicle.brand}</div>
          <h3 className="text-xl font-sans font-bold text-white mt-0.5 tracking-tight flex items-center justify-between">
            <span>{vehicle.model}</span>
            <span className="text-xs font-mono font-normal text-zinc-500">{vehicle.year}</span>
          </h3>
        </div>

        {/* Technical Specification Badges */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-800 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span className="capitalize text-zinc-300">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="capitalize text-zinc-300">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-zinc-300">{vehicle.seats} Seats</span>
          </div>
        </div>

        {/* Pricing & Booking Trigger */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-[11px] text-zinc-500 block font-sans">Starting at</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono tabular-nums font-extrabold text-white">
                {branding.currency || "USD"} {vehicle.daily_rate}
              </span>
              <span className="text-xs text-zinc-500">/day</span>
            </div>
            {vehicle.deposit_amount && (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                <ShieldCheck className="w-2.5 h-2.5 text-zinc-400" /> Deposit: {branding.currency || "USD"} {vehicle.deposit_amount}
              </span>
            )}
          </div>

          <button
            onClick={() => onSelect?.(vehicle)}
            disabled={!isAvailable}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              isAvailable
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-95"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
            }`}
          >
            <span>{isAvailable ? "Book Now" : "Unavailable"}</span>
            {isAvailable && <ArrowUpRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

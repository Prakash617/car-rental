"use client";

import React from "react";
import Image from "next/image";
import { VehicleCardProps } from "@/lib/themes/types";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

export function MinimalVehicleCard({ vehicle, branding, onSelect }: VehicleCardProps) {
  const isAvailable = vehicle.status === "available";
  const firstImage = vehicle.images?.[0];
  const rawImage =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || DEFAULT_VEHICLE_IMAGE;
  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

  return (
    <div className="group border border-zinc-900 bg-zinc-950 flex flex-col justify-between transition-colors hover:border-zinc-700">
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <Image
          src={primaryImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute top-3 left-3 z-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 bg-black/80 px-2 py-0.5">
            {vehicle.category}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-500">{vehicle.brand}</div>
            <h3 className="text-lg font-light text-white tracking-tight">
              {vehicle.model} <span className="text-zinc-600 text-xs font-mono">{vehicle.year}</span>
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-zinc-500">
            {vehicle.transmission} / {vehicle.fuel_type}
          </span>
        </div>

        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-xl font-mono tabular-nums font-normal text-white">
              {branding.currency || "USD"} {vehicle.daily_rate}
            </span>
            <span className="text-xs text-zinc-600 font-mono"> /d</span>
          </div>

          <button
            onClick={() => onSelect?.(vehicle)}
            disabled={!isAvailable}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-widest border transition-colors ${
              isAvailable
                ? "border-zinc-700 text-zinc-200 hover:border-white hover:text-white"
                : "border-zinc-900 text-zinc-700 cursor-not-allowed"
            }`}
          >
            {isAvailable ? "Select" : "Booked"}
          </button>
        </div>
      </div>
    </div>
  );
}

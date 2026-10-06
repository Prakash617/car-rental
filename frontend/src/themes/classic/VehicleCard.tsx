"use client";

import React from "react";
import Image from "next/image";
import { VehicleCardProps } from "@/lib/themes/types";
import { Gauge, Fuel, Users, Shield } from "lucide-react";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

export function ClassicVehicleCard({ vehicle, branding, onSelect }: VehicleCardProps) {
  const isAvailable = vehicle.status === "available";
  const firstImage = vehicle.images?.[0];
  const rawImage =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || DEFAULT_VEHICLE_IMAGE;
  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

  return (
    <div className="group relative rounded-2xl bg-[#1c1813] border border-[#2e261e] overflow-hidden transition-all duration-300 hover:border-[#8B5A2B]/60 hover:shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* Category Tag */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="px-3 py-1 rounded-full text-[10px] font-serif uppercase tracking-widest bg-black/70 backdrop-blur-md border border-[#8B5A2B]/30 text-[#c9955e]">
          {vehicle.category}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-serif uppercase tracking-wider backdrop-blur-md border ${
            isAvailable
              ? "bg-[#8B5A2B]/20 border-[#8B5A2B]/40 text-[#d8a873]"
              : "bg-stone-900/80 border-stone-800 text-stone-500"
          }`}
        >
          {isAvailable ? "Available" : vehicle.status}
        </span>
      </div>

      {/* Vehicle Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#13110e]">
        <Image
          src={primaryImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1813] via-transparent to-transparent opacity-80 z-1" />
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div>
          <div className="text-[11px] font-serif tracking-widest text-[#c9955e] uppercase">{vehicle.brand}</div>
          <h3 className="text-xl font-serif text-[#f5f1eb] mt-0.5 tracking-wide flex items-baseline justify-between">
            <span>{vehicle.model}</span>
            <span className="text-xs font-sans text-[#8f8475]">({vehicle.year})</span>
          </h3>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#2e261e] text-xs text-[#a89f91] font-serif">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#c9955e]" />
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-[#c9955e]" />
            <span className="capitalize">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#c9955e]" />
            <span>{vehicle.seats} Seats</span>
          </div>
        </div>

        {/* Daily rate & Hire button */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-[10px] text-[#8f8475] block font-serif">Daily Hire</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono tabular-nums font-bold text-[#f5f1eb]">
                {branding.currency || "USD"} {vehicle.daily_rate}
              </span>
              <span className="text-xs text-[#8f8475]">/day</span>
            </div>
            {vehicle.deposit_amount && (
              <span className="text-[10px] text-[#8f8475] flex items-center gap-1 mt-0.5 font-sans">
                <Shield className="w-2.5 h-2.5 text-[#c9955e]" /> Deposit: {branding.currency || "USD"} {vehicle.deposit_amount}
              </span>
            )}
          </div>

          <button
            onClick={() => onSelect?.(vehicle)}
            disabled={!isAvailable}
            className={`px-5 py-2.5 rounded-xl text-xs font-serif font-semibold tracking-wider uppercase transition-all duration-300 ${
              isAvailable
                ? "bg-[#8B5A2B] hover:bg-[#a06933] text-stone-100 active:scale-95 shadow-md shadow-[#8B5A2B]/20"
                : "bg-[#25201a] text-stone-600 cursor-not-allowed border border-[#362e24]"
            }`}
          >
            {isAvailable ? "Reserve" : "Reserved"}
          </button>
        </div>
      </div>
    </div>
  );
}

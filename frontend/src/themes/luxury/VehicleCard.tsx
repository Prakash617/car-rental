"use client";

import React from "react";
import Image from "next/image";
import { VehicleCardProps } from "@/lib/themes/types";
import { Gauge, Fuel, Users, Shield } from "lucide-react";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

export function LuxuryVehicleCard({ vehicle, branding, onSelect }: VehicleCardProps) {
  const isAvailable = vehicle.status === "available";
  const firstImage = vehicle.images?.[0];
  const rawImage =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || DEFAULT_VEHICLE_IMAGE;
  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

  return (
    <div className="group relative rounded-2xl bg-[#12141F] border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-[#D4AF37]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
      {/* Top Banner Tag */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-black/60 backdrop-blur-md border border-white/10 text-slate-300">
          {vehicle.category}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md border ${
            isAvailable
              ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {isAvailable ? "Available" : vehicle.status}
        </span>
      </div>

      {/* Panoramic Imagery */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0B0D14]">
        <Image
          src={primaryImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141F] via-transparent to-transparent z-1" />
      </div>

      {/* Vehicle Specs & Information */}
      <div className="p-6 space-y-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium">{vehicle.brand}</div>
          <h3 className="text-xl font-serif text-slate-100 font-normal mt-0.5 tracking-wide">
            {vehicle.model} <span className="text-sm font-sans text-slate-500">({vehicle.year})</span>
          </h3>
        </div>

        {/* Feature Spec Pills */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.06] text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="capitalize">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{vehicle.seats} Seats</span>
          </div>
        </div>

        {/* Pricing & Reservation Action */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-slate-400 font-light block">Daily Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono tabular-nums font-bold text-slate-100">
                {branding.currency || "USD"} {vehicle.daily_rate}
              </span>
              <span className="text-xs text-slate-500 font-light">/ day</span>
            </div>
            {vehicle.deposit_amount && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Shield className="w-2.5 h-2.5" /> Deposit: {branding.currency || "USD"} {vehicle.deposit_amount}
              </span>
            )}
          </div>

          <button
            onClick={() => onSelect?.(vehicle)}
            disabled={!isAvailable}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              isAvailable
                ? "bg-[#D4AF37] text-black hover:bg-[#e2bd46] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95"
                : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
            }`}
          >
            {isAvailable ? "Reserve" : "Booked"}
          </button>
        </div>
      </div>
    </div>
  );
}

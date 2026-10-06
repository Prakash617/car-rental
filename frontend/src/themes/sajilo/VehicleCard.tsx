"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { VehicleCardProps } from "@/lib/themes/types";
import {
  ShieldCheck,
  UserCheck,
  Gauge,
  Fuel,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Zap,
  Sparkles
} from "lucide-react";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

export function SajiloVehicleCard({ vehicle, branding, onSelect }: VehicleCardProps) {
  const isAvailable = vehicle.status === "available";

  const firstImage = vehicle.images?.[0];
  const rawImage =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || DEFAULT_VEHICLE_IMAGE;
  const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

  const isEV = vehicle.fuel_type === "electric";
  const dailyRate = Number(vehicle.daily_rate) || 6500;
  const rate4h = vehicle.rate_4h ? Number(vehicle.rate_4h) : Math.round(dailyRate * 0.55);
  const rate8h = vehicle.rate_8h ? Number(vehicle.rate_8h) : Math.round(dailyRate * 0.80);
  const fuelRate = vehicle.fuel_rate_per_km || "22";

  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-[#388ddd]/80 via-[#5aa0e8]/50 to-[#e11d2e]/80 p-[1.5px] hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
      <div className="rounded-[15px] bg-white h-full flex flex-col justify-between overflow-hidden">
        {/* Media Container */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <Image
            src={primaryImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-sm border border-slate-200">
              {vehicle.category}
            </span>
            {isEV && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3" /> EV
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>

          {/* Driver Included Badge */}
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/90 text-amber-300 backdrop-blur-sm flex items-center gap-1 shadow-sm">
              <UserCheck className="w-3 h-3" /> Chauffeur Included
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#e11d2e]">
                {vehicle.brand}
              </span>
              <span className="text-xs text-slate-400 font-medium">{vehicle.year}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 group-hover:text-[#388ddd] transition-colors">
              {vehicle.model}
            </h3>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize">{vehicle.transmission}</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize">{vehicle.fuel_type}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{vehicle.seats} Seats</span>
              </div>
            </div>

            {/* Sajilo Rental Tier Rates (NPR) */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">4 Hours (≤ 50 km)</span>
                <span className="font-bold text-slate-900">Rs. {rate4h.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">8 Hours (≤ 100 km)</span>
                <span className="font-bold text-slate-900">Rs. {rate8h.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <span className="font-semibold text-slate-700">1 Full Day</span>
                <span className="font-extrabold text-[#e11d2e] text-sm">
                  Rs. {dailyRate.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Extra fuel rate: Rs. {fuelRate}/km</span>
              <span className="text-emerald-600 font-medium">Free Cancellation</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center gap-2">
            <Link
              href={`/vehicle/${vehicle.id}`}
              className="flex-1 py-2.5 px-3 bg-[#e11d2e] hover:bg-[#b01524] text-white rounded-xl text-xs font-bold text-center shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Book Vehicle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/vehicle/${vehicle.id}`}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

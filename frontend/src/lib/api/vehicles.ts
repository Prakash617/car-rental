import { apiFetch } from "./client";
import { Vehicle, VehicleCategory, VehicleStatus } from "@/types";

export interface VehicleFilterParams {
  category?: VehicleCategory;
  transmission?: string;
  fuel_type?: string;
  status?: VehicleStatus;
  branch?: string;
  search?: string;
}

export async function fetchVehicles(
  filters?: VehicleFilterParams,
  tenantHost?: string
): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
  }

  const query = params.toString();
  const endpoint = query ? `/vehicles/?${query}` : "/vehicles/";

  return apiFetch<Vehicle[]>(endpoint, {
    method: "GET",
    tenantHost,
    cache: "no-store", // Fleet availability is real-time
  });
}

export async function fetchVehicle(id: string, tenantHost?: string): Promise<Vehicle> {
  return apiFetch<Vehicle>(`/vehicles/${id}/`, {
    method: "GET",
    tenantHost,
    cache: "no-store",
  });
}

export interface CreateVehiclePayload {
  branch: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  category: VehicleCategory;
  transmission: "automatic" | "manual";
  fuel_type: "petrol" | "diesel" | "hybrid" | "electric";
  seats: number;
  doors: number;
  mileage: number;
  color: string;
  status: VehicleStatus;
  daily_rate: string;
  deposit_amount?: string;
  description?: string;
  images?: Array<{ url: string; is_primary: boolean; caption?: string }>;
}

export async function createVehicle(
  payload: CreateVehiclePayload,
  token?: string,
  tenantHost?: string
): Promise<Vehicle> {
  return apiFetch<Vehicle>("/vehicles/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export { fetchVehicles as getVehicles, fetchVehicle as getVehicle };

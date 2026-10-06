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
  tokenOrHost?: string,
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

  let token: string | undefined;
  let resolvedHost: string | undefined = tenantHost;

  if (tokenOrHost) {
    if (tokenOrHost.includes(".") && tokenOrHost.split(".").length === 3) {
      // It's a JWT token
      token = tokenOrHost;
    } else if (!tenantHost) {
      // It's a hostname like 'apex.localhost'
      resolvedHost = tokenOrHost;
    } else {
      token = tokenOrHost;
    }
  }

  return apiFetch<Vehicle[]>(endpoint, {
    method: "GET",
    token,
    tenantHost: resolvedHost,
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

export async function updateVehicle(
  id: string,
  payload: Partial<CreateVehiclePayload>,
  token?: string,
  tenantHost?: string
): Promise<Vehicle> {
  return apiFetch<Vehicle>(`/vehicles/${id}/`, {
    method: "PATCH",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function deleteVehicle(
  id: string,
  token?: string,
  tenantHost?: string
): Promise<void> {
  return apiFetch<void>(`/vehicles/${id}/`, {
    method: "DELETE",
    token,
    tenantHost,
  });
}

export interface UploadImageResult {
  url: string;
  filename: string;
  original_name: string;
  original_size: number;
  compressed_size: number;
  saved_bytes: number;
  reduction_percentage: number;
  width: number;
  height: number;
  format: string;
  caption?: string;
  is_primary?: boolean;
}

export async function uploadVehicleImage(
  file: File,
  options?: { is_primary?: boolean; caption?: string },
  token?: string,
  tenantHost?: string
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("image", file);
  if (options?.is_primary !== undefined) {
    formData.append("is_primary", String(options.is_primary));
  }
  if (options?.caption) {
    formData.append("caption", options.caption);
  }

  return apiFetch<UploadImageResult>("/vehicles/upload-image/", {
    method: "POST",
    token,
    tenantHost,
    body: formData,
  });
}

export async function uploadImageToVehicle(
  vehicleId: string,
  file: File,
  options?: { is_primary?: boolean; caption?: string },
  token?: string,
  tenantHost?: string
): Promise<{ uploaded: UploadImageResult; images: Array<{ url: string; is_primary: boolean; caption?: string }> }> {
  const formData = new FormData();
  formData.append("image", file);
  if (options?.is_primary !== undefined) {
    formData.append("is_primary", String(options.is_primary));
  }
  if (options?.caption) {
    formData.append("caption", options.caption);
  }

  return apiFetch<{ uploaded: UploadImageResult; images: Array<{ url: string; is_primary: boolean; caption?: string }> }>(
    `/vehicles/${vehicleId}/upload-image/`,
    {
      method: "POST",
      token,
      tenantHost,
      body: formData,
    }
  );
}

export { fetchVehicles as getVehicles, fetchVehicle as getVehicle };


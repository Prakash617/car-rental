import { apiFetch } from "./client";

export interface FleetHealthOverview {
  fleet_size: number;
  available: number;
  rented: number;
  in_maintenance: number;
  active_maintenance_jobs: number;
  monthly_maintenance_cost: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicle: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_plate: string;
  service_type: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduled_start: string;
  scheduled_end: string;
  actual_completion?: string | null;
  odometer_reading?: number | null;
  cost?: string | null;
  service_center?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleMaintenancePayload {
  vehicle: string;
  service_type: string;
  scheduled_start: string;
  scheduled_end: string;
  service_center?: string;
  notes?: string;
}

export interface CompleteMaintenancePayload {
  actual_completion?: string;
  odometer_reading?: number;
  cost?: string;
  mechanic_notes?: string;
}

export interface VehicleInspection {
  id: string;
  vehicle: string;
  vehicle_plate: string;
  booking?: string | null;
  booking_reference?: string | null;
  inspector_id?: string | null;
  inspection_type: "check_in" | "check_out" | "routine" | "annual";
  odometer: number;
  fuel_percentage: number;
  battery_percentage?: number | null;
  exterior_condition: "excellent" | "good" | "fair" | "poor";
  interior_condition: "excellent" | "good" | "fair" | "poor";
  has_new_damage: boolean;
  damage_description?: string;
  customer_signature?: string;
  created_at: string;
}

export interface CreateInspectionPayload {
  vehicle_id: string;
  booking_id?: string | null;
  inspection_type: "check_in" | "check_out" | "routine" | "annual";
  odometer: number;
  fuel_percentage: number;
  battery_percentage?: number | null;
  exterior_condition?: "excellent" | "good" | "fair" | "poor";
  interior_condition?: "excellent" | "good" | "fair" | "poor";
  has_new_damage?: boolean;
  damage_description?: string;
}

export interface TelemetryRecord {
  id: string;
  vehicle: string;
  vehicle_plate: string;
  latitude?: string | null;
  longitude?: string | null;
  speed?: string | null;
  fuel_level?: number | null;
  battery_level?: number | null;
  odometer: number;
  engine_status?: "off" | "idle" | "running" | "warning";
  timestamp: string;
}

export async function fetchFleetHealthOverview(
  token?: string,
  tenantHost?: string
): Promise<FleetHealthOverview> {
  return apiFetch<FleetHealthOverview>("/api/v1/maintenance/overview/", {
    method: "GET",
    token,
    tenantHost,
    cache: "no-store",
  });
}

export async function fetchMaintenanceRecords(
  params?: { status?: string; vehicle?: string },
  token?: string,
  tenantHost?: string
): Promise<MaintenanceRecord[]> {
  const queryParts: string[] = [];
  if (params?.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
  if (params?.vehicle) queryParts.push(`vehicle=${encodeURIComponent(params.vehicle)}`);
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

  return apiFetch<MaintenanceRecord[]>(`/api/v1/maintenance/records/${query}`, {
    method: "GET",
    token,
    tenantHost,
    cache: "no-store",
  });
}

export async function scheduleMaintenance(
  payload: ScheduleMaintenancePayload,
  token?: string,
  tenantHost?: string
): Promise<MaintenanceRecord> {
  return apiFetch<MaintenanceRecord>("/api/v1/maintenance/records/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function startMaintenance(
  recordId: string,
  token?: string,
  tenantHost?: string
): Promise<MaintenanceRecord> {
  return apiFetch<MaintenanceRecord>(`/api/v1/maintenance/records/${recordId}/start/`, {
    method: "POST",
    token,
    tenantHost,
  });
}

export async function completeMaintenance(
  recordId: string,
  payload: CompleteMaintenancePayload,
  token?: string,
  tenantHost?: string
): Promise<MaintenanceRecord> {
  return apiFetch<MaintenanceRecord>(`/api/v1/maintenance/records/${recordId}/complete/`, {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function fetchInspections(
  params?: { vehicle?: string },
  token?: string,
  tenantHost?: string
): Promise<VehicleInspection[]> {
  const query = params?.vehicle ? `?vehicle=${encodeURIComponent(params.vehicle)}` : "";
  return apiFetch<VehicleInspection[]>(`/api/v1/maintenance/inspections/${query}`, {
    method: "GET",
    token,
    tenantHost,
    cache: "no-store",
  });
}

export async function createInspection(
  payload: CreateInspectionPayload,
  token?: string,
  tenantHost?: string
): Promise<VehicleInspection> {
  return apiFetch<VehicleInspection>("/api/v1/maintenance/inspections/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function fetchTelemetry(
  token?: string,
  tenantHost?: string
): Promise<TelemetryRecord[]> {
  return apiFetch<TelemetryRecord[]>("/api/v1/maintenance/telemetry/", {
    method: "GET",
    token,
    tenantHost,
    cache: "no-store",
  });
}

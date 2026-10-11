import { apiFetch } from "./client";
import { CarpoolRide, CarpoolBookingRequest, CarpoolAlertSubscription } from "@/types";

export async function getCarpoolRides(
  params?: { all?: boolean; status?: string; from?: string; to?: string; date?: string; seats?: number },
  token?: string,
  tenantHost?: string
): Promise<CarpoolRide[]> {
  const query = new URLSearchParams();
  if (params?.all) query.append("all", "true");
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.from) query.append("from", params.from);
  if (params?.to) query.append("to", params.to);
  if (params?.date) query.append("date", params.date);
  if (params?.seats) query.append("seats", String(params.seats));

  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await apiFetch<any>(`/api/v1/carpool/${qs}`, { token, tenantHost, cache: "no-store" });
  return Array.isArray(res) ? res : res?.data || [];
}

export async function getCarpoolRequests(
  params?: { phone?: string; email?: string; ride_id?: string; status?: string },
  token?: string,
  tenantHost?: string
): Promise<CarpoolBookingRequest[]> {
  const query = new URLSearchParams();
  if (params?.phone) query.append("phone", params.phone);
  if (params?.email) query.append("email", params.email);
  if (params?.ride_id) query.append("ride_id", params.ride_id);
  if (params?.status && params.status !== "all") query.append("status", params.status);

  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await apiFetch<any>(`/api/v1/carpool/requests/${qs}`, { token, tenantHost, cache: "no-store" });
  return Array.isArray(res) ? res : res?.data || [];
}

export async function updateCarpoolRequestStatus(
  requestId: string,
  status: "pending" | "approved" | "rejected" | "cancelled",
  token?: string,
  tenantHost?: string
): Promise<CarpoolBookingRequest> {
  const res = await apiFetch<any>(`/api/v1/carpool/requests/${requestId}/status/`, {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify({ status }),
  });
  return res?.data || res;
}

export async function getCarpoolSubscriptions(token?: string, tenantHost?: string): Promise<CarpoolAlertSubscription[]> {
  const res = await apiFetch<any>("/api/v1/carpool/subscriptions/", { token, tenantHost, cache: "no-store" });
  return Array.isArray(res) ? res : res?.data || [];
}

export async function updateCarpoolRideStatus(
  rideId: string,
  status: "active" | "full" | "completed" | "cancelled",
  token?: string,
  tenantHost?: string
): Promise<CarpoolRide> {
  const res = await apiFetch<any>(`/api/v1/carpool/${rideId}/update-status/`, {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify({ status }),
  });
  return res?.data || res;
}

export async function deleteCarpoolRide(rideId: string, token?: string, tenantHost?: string): Promise<void> {
  await apiFetch<any>(`/api/v1/carpool/${rideId}/delete-ride/`, {
    method: "POST",
    token,
    tenantHost,
  });
}

export async function publishCarpoolRide(
  payload: {
    origin_city: string;
    origin_point?: string;
    destination_city: string;
    destination_point?: string;
    departure_datetime: string;
    vehicle_model: string;
    vehicle_type: string;
    total_seats: number;
    available_seats?: number;
    price_per_seat: number;
    driver_name: string;
    driver_phone: string;
    features?: string[];
    notes?: string;
  },
  token?: string,
  tenantHost?: string
): Promise<CarpoolRide> {
  const res = await apiFetch<any>("/api/v1/carpool/publish-ride/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

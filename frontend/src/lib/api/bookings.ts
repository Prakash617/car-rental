import { apiFetch } from "./client";
import { Booking } from "@/types";

export interface CustomerInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  driver_license_number: string;
  license_expiry_date: string;
  date_of_birth: string;
  country: string;
}

export interface CreateBookingPayload {
  vehicle_id: string;
  pickup_branch_id: string;
  return_branch_id: string;
  pickup_datetime: string;
  return_datetime: string;
  customer: CustomerInput;
  addon_ids?: string[];
  coupon_code?: string;
  notes?: string;
}

export async function createBookingCheckout(
  payload: CreateBookingPayload,
  tenantHost?: string
): Promise<Booking> {
  return apiFetch<Booking>("/api/v1/bookings/", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantHost,
  });
}

export async function lookupBooking(
  reference: string,
  email?: string,
  tenantHost?: string
): Promise<Booking> {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<Booking>(`/api/v1/bookings/lookup/${encodeURIComponent(reference)}/${query}`, {
    method: "GET",
    tenantHost,
    cache: "no-store",
  });
}

export async function fetchBookings(
  params?: { status?: string },
  token?: string,
  tenantHost?: string
): Promise<Booking[]> {
  const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  return apiFetch<Booking[]>(`/api/v1/bookings/${query}`, {
    method: "GET",
    token,
    tenantHost,
    cache: "no-store",
  });
}

export async function cancelBooking(
  bookingId: string,
  reason?: string,
  token?: string,
  tenantHost?: string
): Promise<Booking> {
  return apiFetch<Booking>(`/api/v1/bookings/${bookingId}/cancel/`, {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify({ reason: reason || "Cancelled via dashboard" }),
  });
}

export async function confirmBooking(
  bookingId: string,
  token?: string,
  tenantHost?: string
): Promise<Booking> {
  return apiFetch<Booking>(`/api/v1/bookings/${bookingId}/confirm/`, {
    method: "POST",
    token,
    tenantHost,
  });
}

export async function activateBooking(
  bookingId: string,
  token?: string,
  tenantHost?: string
): Promise<Booking> {
  return apiFetch<Booking>(`/api/v1/bookings/${bookingId}/activate/`, {
    method: "POST",
    token,
    tenantHost,
  });
}

export async function completeBooking(
  bookingId: string,
  token?: string,
  tenantHost?: string
): Promise<Booking> {
  return apiFetch<Booking>(`/api/v1/bookings/${bookingId}/complete/`, {
    method: "POST",
    token,
    tenantHost,
  });
}

export { fetchBookings as getBookings };


import { apiFetch } from "./client";

export interface TransmissionItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransmissionPayload {
  name: string;
  slug?: string;
  description?: string;
}

export async function fetchTransmissions(tenantHost?: string): Promise<TransmissionItem[]> {
  return apiFetch<TransmissionItem[]>("/transmissions/", {
    method: "GET",
    tenantHost,
    cache: "no-store",
  });
}

export async function createTransmission(
  payload: TransmissionPayload,
  token?: string,
  tenantHost?: string
): Promise<TransmissionItem> {
  return apiFetch<TransmissionItem>("/transmissions/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function updateTransmission(
  id: string,
  payload: Partial<TransmissionPayload>,
  token?: string,
  tenantHost?: string
): Promise<TransmissionItem> {
  return apiFetch<TransmissionItem>(`/transmissions/${id}/`, {
    method: "PATCH",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function deleteTransmission(
  id: string,
  token?: string,
  tenantHost?: string
): Promise<void> {
  return apiFetch<void>(`/transmissions/${id}/`, {
    method: "DELETE",
    token,
    tenantHost,
  });
}

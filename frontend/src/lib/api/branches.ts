import { apiFetch } from "./client";

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address_line1?: string;
  phone: string;
  email: string;
  latitude?: string;
  longitude?: string;
  is_active: boolean;
}

export interface CreateBranchPayload {
  name: string;
  code?: string;
  city?: string;
  address_line1?: string;
  phone?: string;
  email?: string;
}

export async function fetchBranches(tokenOrHost?: string, tenantHost?: string): Promise<Branch[]> {
  let token: string | undefined;
  let resolvedHost = tenantHost;
  if (tokenOrHost) {
    if (tokenOrHost.includes(".") && tokenOrHost.split(".").length === 3) {
      token = tokenOrHost;
    } else if (!tenantHost) {
      resolvedHost = tokenOrHost;
    } else {
      token = tokenOrHost;
    }
  }

  return apiFetch<Branch[]>("/branches/", {
    method: "GET",
    token,
    tenantHost: resolvedHost,
    cache: "no-store",
  });
}

export async function createBranch(
  payload: CreateBranchPayload,
  token?: string,
  tenantHost?: string
): Promise<Branch> {
  return apiFetch<Branch>("/branches/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function updateBranch(
  id: string,
  payload: Partial<CreateBranchPayload> & { is_active?: boolean },
  token?: string,
  tenantHost?: string
): Promise<Branch> {
  return apiFetch<Branch>(`/branches/${id}/`, {
    method: "PATCH",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function deleteBranch(
  id: string,
  token?: string,
  tenantHost?: string
): Promise<void> {
  return apiFetch<void>(`/branches/${id}/`, {
    method: "DELETE",
    token,
    tenantHost,
  });
}

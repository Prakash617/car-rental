import { apiFetch } from "./client";

export interface TenantDomain {
  id: string;
  domain: string;
  is_primary: boolean;
  is_verified: boolean;
  target_cname: string;
  ssl_certificate: {
    status: "active" | "pending" | "failed";
    issuer: string;
    type: string;
  };
  created_at: string;
}

export async function fetchTenantDomains(
  token?: string,
  tenantHost?: string
): Promise<TenantDomain[]> {
  return apiFetch<TenantDomain[]>("/domains/", {
    method: "GET",
    token,
    tenantHost,
    cache: "no-store",
  });
}

export async function addCustomDomain(
  domain: string,
  token?: string,
  tenantHost?: string
): Promise<TenantDomain> {
  return apiFetch<TenantDomain>("/domains/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify({ domain }),
  });
}

export async function verifyCustomDomain(
  domainId: string,
  token?: string,
  tenantHost?: string
): Promise<TenantDomain> {
  return apiFetch<TenantDomain>(`/domains/${domainId}/verify/`, {
    method: "POST",
    token,
    tenantHost,
  });
}

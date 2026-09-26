import { apiFetch } from "./client";

export interface PlatformOverview {
  total_tenants: number;
  active_tenants: number;
  total_fleets: number;
  total_bookings: number;
  total_revenue: string;
  platform_health: string;
}

export interface PlatformTenant {
  id: string;
  name: string;
  slug: string;
  schema_name: string;
  is_active: boolean;
  timezone: string;
  currency: string;
  primary_domain: string;
  vehicle_count: number;
  booking_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProvisionTenantPayload {
  company_name: string;
  subdomain: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  currency?: string;
  timezone?: string;
}

/**
 * Fetch cross-tenant platform executive metrics (public schema)
 */
export async function getPlatformOverview(token?: string): Promise<PlatformOverview> {
  return apiFetch<PlatformOverview>("/platform/overview/", {
    token,
    tenantHost: "localhost",
    cache: "no-store",
  });
}

/**
 * Fetch all registered tenants across the platform (public schema)
 */
export async function getPlatformTenants(token?: string): Promise<PlatformTenant[]> {
  return apiFetch<PlatformTenant[]>("/platform/tenants/", {
    token,
    tenantHost: "localhost",
    cache: "no-store",
  });
}

/**
 * Provision a brand new tenant with schema isolation and domain mapping
 */
export async function provisionTenant(
  payload: ProvisionTenantPayload,
  token?: string
): Promise<PlatformTenant> {
  return apiFetch<PlatformTenant>("/platform/tenants/", {
    method: "POST",
    token,
    tenantHost: "localhost",
    body: JSON.stringify(payload),
  });
}

export async function updatePlatformTenant(
  id: string,
  payload: Partial<PlatformTenant>,
  token?: string
): Promise<PlatformTenant> {
  return apiFetch<PlatformTenant>(`/platform/tenants/${id}/`, {
    method: "PATCH",
    token,
    tenantHost: "localhost",
    body: JSON.stringify(payload),
  });
}

export interface RegisterTenantPayload {
  company_name: string;
  subdomain: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  currency?: string;
  timezone?: string;
}

export interface RegisterTenantResult {
  tenant_id: string;
  company_name: string;
  schema_name: string;
  domain: string;
  owner_email: string;
}

/**
 * Self-service registration endpoint for customers creating their new car rental portal
 */
export async function registerTenant(
  payload: RegisterTenantPayload
): Promise<RegisterTenantResult> {
  return apiFetch<RegisterTenantResult>("/auth/register/", {
    method: "POST",
    tenantHost: "localhost",
    body: JSON.stringify(payload),
  });
}

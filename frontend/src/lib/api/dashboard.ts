import { apiFetch } from "./client";
import { AuthSession, Customer, DashboardOverview, TenantBranding, Vehicle, VehicleStatus } from "@/types";

export interface UpdateThemePayload {
  active_theme?: string;
  primary_color?: string;
  accent_color?: string;
  font_heading?: string;
  logo_url?: string;
  support_email?: string;
  support_phone?: string;
  hero_title?: string;
  hero_subtitle?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQCreatePayload {
  question: string;
  answer: string;
  is_active?: boolean;
  order?: number;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
  show_in_navbar: boolean;
  show_in_footer: boolean;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface CustomPagePayload {
  title?: string;
  slug?: string;
  content?: string;
  is_published?: boolean;
  show_in_navbar?: boolean;
  show_in_footer?: boolean;
  seo_title?: string;
  seo_description?: string;
}

/**
  * Authenticate staff or admin user for tenant management operations
  */
export async function loginUser(
  email: string,
  password?: string,
  tenantHost?: string,
  otp?: string
): Promise<AuthSession> {
  const payload: Record<string, string> = { email: email.trim().toLowerCase() };
  if (password) payload.password = password;
  if (otp) payload.otp = otp;

  return apiFetch<AuthSession>("/auth/login/", {
    method: "POST",
    tenantHost,
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch executive dashboard KPIs and fleet utilization metrics
 */
export async function getDashboardOverview(token?: string, tenantHost?: string): Promise<DashboardOverview> {
  return apiFetch<DashboardOverview>("/dashboard/overview/", {
    token,
    tenantHost,
    cache: "no-store",
  });
}

/**
 * Update vehicle operational status (e.g. available, maintenance, inactive)
 */
export async function updateVehicleStatus(
  vehicleId: string,
  status: VehicleStatus,
  token?: string,
  tenantHost?: string
): Promise<Vehicle> {
  return apiFetch<Vehicle>(`/vehicles/${vehicleId}/set_status/`, {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify({ status }),
  });
}

export interface CreateCustomerPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  driver_license_number: string;
  license_expiry_date: string;
  date_of_birth: string;
  country?: string;
}

/**
 * Fetch verified customer directory
 */
export async function getCustomers(token?: string, tenantHost?: string): Promise<Customer[]> {
  return apiFetch<Customer[]>("/customers/", {
    token,
    tenantHost,
    cache: "no-store",
  });
}

/**
 * Register a new customer
 */
export async function createCustomer(
  payload: CreateCustomerPayload,
  token?: string,
  tenantHost?: string
): Promise<Customer> {
  return apiFetch<Customer>("/customers/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch current website and theme configuration for editing
 */
export async function getManageableWebsiteConfig(token?: string, tenantHost?: string): Promise<TenantBranding> {
  return apiFetch<TenantBranding>("/dashboard/theme/", {
    token,
    tenantHost,
    cache: "no-store",
  });
}

/**
 * Save updated theme, branding, or copywriting changes
 */
export async function updateTenantThemeConfig(
  payload: UpdateThemePayload,
  token?: string,
  tenantHost?: string
): Promise<TenantBranding> {
  return apiFetch<TenantBranding>("/dashboard/theme/", {
    method: "PATCH",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

// ────────────────────────── FAQ API ──────────────────────────

/** Fetch all active FAQ items (public) */
export async function getPublicFAQs(tenantHost?: string): Promise<FAQItem[]> {
  return apiFetch<FAQItem[]>("/website/faq/", { tenantHost, cache: "no-store" });
}

/** Create a new FAQ item (staff auth required) */
export async function createFAQ(
  payload: FAQCreatePayload,
  token?: string,
  tenantHost?: string
): Promise<FAQItem> {
  return apiFetch<FAQItem>("/website/faq/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

/** Update a FAQ item (staff auth required) */
export async function updateFAQ(
  id: string,
  payload: Partial<FAQCreatePayload>,
  token?: string,
  tenantHost?: string
): Promise<FAQItem> {
  return apiFetch<FAQItem>(`/dashboard/faq/${id}/`, {
    method: "PATCH",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

/** Delete a FAQ item (staff auth required) */
export async function deleteFAQ(id: string, token?: string, tenantHost?: string): Promise<void> {
  return apiFetch<void>(`/dashboard/faq/${id}/`, {
    method: "DELETE",
    token,
    tenantHost,
  });
}

// ────────────────────────── Custom Pages API ──────────────────────────

/** Fetch all pages including unpublished (staff) */
export async function getAllCustomPages(
  token?: string,
  tenantHost?: string
): Promise<CustomPage[]> {
  return apiFetch<CustomPage[]>("/dashboard/pages/", {
    token,
    tenantHost,
    cache: "no-store",
  });
}

/** Fetch a single published page by slug (public) */
export async function getCustomPageBySlug(
  slug: string,
  tenantHost?: string
): Promise<CustomPage> {
  return apiFetch<CustomPage>(`/website/pages/${slug}/`, { tenantHost, cache: "no-store" });
}

/** Fetch every published page (public) — used by storefront navbar/footer link lists */
export async function getPublishedCustomPages(
  tenantHost?: string
): Promise<CustomPage[]> {
  return apiFetch<CustomPage[]>("/website/pages/", {
    tenantHost,
    cache: "no-store",
  });
}

/** Create a new custom page (staff auth) */
export async function createCustomPage(
  payload: CustomPagePayload,
  token?: string,
  tenantHost?: string
): Promise<CustomPage> {
  return apiFetch<CustomPage>("/website/pages/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

/** Update a custom page by slug (staff auth) */
export async function updateCustomPage(
  slug: string,
  payload: CustomPagePayload,
  token?: string,
  tenantHost?: string
): Promise<CustomPage> {
  return apiFetch<CustomPage>(`/website/pages/${slug}/`, {
    method: "PATCH",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

/** Delete a custom page by slug (staff auth) */
export async function deleteCustomPage(
  slug: string,
  token?: string,
  tenantHost?: string
): Promise<void> {
  return apiFetch<void>(`/website/pages/${slug}/`, {
    method: "DELETE",
    token,
    tenantHost,
  });
}

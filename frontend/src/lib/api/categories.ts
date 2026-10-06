import { apiFetch } from "./client";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
}

export async function fetchCategories(tenantHost?: string): Promise<CategoryItem[]> {
  return apiFetch<CategoryItem[]>("/categories/", {
    method: "GET",
    tenantHost,
    cache: "no-store",
  });
}

export async function createCategory(
  payload: CategoryPayload,
  token?: string,
  tenantHost?: string
): Promise<CategoryItem> {
  return apiFetch<CategoryItem>("/categories/", {
    method: "POST",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayload>,
  token?: string,
  tenantHost?: string
): Promise<CategoryItem> {
  return apiFetch<CategoryItem>(`/categories/${id}/`, {
    method: "PATCH",
    token,
    tenantHost,
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(
  id: string,
  token?: string,
  tenantHost?: string
): Promise<void> {
  return apiFetch<void>(`/categories/${id}/`, {
    method: "DELETE",
    token,
    tenantHost,
  });
}

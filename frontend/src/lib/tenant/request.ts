import { headers, cookies } from "next/headers";
import { resolveTenantHost } from "./resolver";

/**
 * Server-side helper: resolves the tenant host for the current request.
 *
 * Priority: explicit `?tenant=` query param → `tenant_ctx` cookie (written by the
 * middleware) → request hostname (tenant subdomain / custom domain) → default tenant.
 */
export async function getRequestTenantHost(tenantParam?: string | null): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";

  const cookieStore = await cookies();
  const cookieTenant = cookieStore.get("tenant_ctx")?.value || null;

  return resolveTenantHost(host, tenantParam || cookieTenant);
}

import { apiFetch } from "./client";

export interface AuditLogItem {
  id: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address?: string | null;
  timestamp: string;
}

export async function fetchAuditLogs(
  token?: string,
  tenantHost?: string
): Promise<AuditLogItem[]> {
  return apiFetch<AuditLogItem[]>("/audit/", {
    method: "GET",
    token,
    tenantHost,
    cache: "no-store",
  });
}

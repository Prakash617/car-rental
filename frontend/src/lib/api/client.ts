import { ApiResponse } from "@/types";

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(message: string, code: string = "API_ERROR", statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface RequestOptions extends RequestInit {
  tenantHost?: string;
  token?: string;
  _retry?: boolean;
}

function formatErrorMessage(rawMessage?: string, details?: unknown): string {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    const errorEntries = Object.entries(details as Record<string, unknown>);
    if (errorEntries.length > 0) {
      const formatted = errorEntries.map(([field, err]) => {
        const fieldName = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const errText = Array.isArray(err) ? err.join(", ") : String(err);
        return `${fieldName}: ${errText}`;
      });
      return formatted.join(" | ");
    }
  }

  if (rawMessage) {
    if (rawMessage.includes("ErrorDetail")) {
      const cleaned = rawMessage
        .replace(/ErrorDetail\(string=['"](.*?)['"], code=['"].*?['"]\)/g, "$1")
        .replace(/\{|\}|\[|\]|'/g, "")
        .trim();
      if (cleaned) return cleaned;
    }
    return rawMessage;
  }

  return "Request failed";
}

/**
 * Enterprise API client that attaches tenant hostname routing headers,
 * auto-resolves authentication tokens, intercepts 401 expired tokens with
 * silent refresh, and unwraps standardized response envelopes.
 */
export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { tenantHost, token, headers: customHeaders, _retry, ...restOptions } = options;

  let storedSession: { access_token?: string; tenant_domain?: string } | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("apex_saas_auth_session");
      if (stored) {
        storedSession = JSON.parse(stored);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  let authToken = token || storedSession?.access_token;

  let effectiveHost = tenantHost;
  if (!effectiveHost && typeof window !== "undefined") {
    const currentHost = window.location.host;
    const cleanHost = currentHost.split(":")[0].toLowerCase();

    // If accessing on localhost:3000 or platform root, route to the user's tenant domain
    if (cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost === "platform.localhost") {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get("tenant");
      if (tenantParam) {
        const baseParam = tenantParam.replace(/:\d+$/, "");
        effectiveHost = `${baseParam}:3000`;
      } else if (storedSession?.tenant_domain) {
        const baseDomain = storedSession.tenant_domain.replace(/:\d+$/, "");
        effectiveHost = `${baseDomain}:3000`;
      } else {
        effectiveHost = "apex.localhost:3000";
      }
    } else {
      effectiveHost = currentHost;
    }
  }

  const resolvedHost = effectiveHost || "apex.localhost:3000";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Forwarded-Host": resolvedHost,
    ...((customHeaders as Record<string, string>) || {}),
  };

  // The 'Host' header is forbidden in browser fetch() specifications; only attach on SSR
  if (typeof window === "undefined") {
    headers.Host = resolvedHost;
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const cleanEndpoint = endpoint.replace(/^\/api\/v1/, "");
  const path = cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`;
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
    });

    // Check for 401 Unauthorized (token expired)
    const isAuthRoute = path.includes("/auth/login") || path.includes("/auth/refresh");
    if (response.status === 401 && !_retry && !isAuthRoute && typeof window !== "undefined") {
      const { refreshAccessToken } = await import("@/lib/auth/tokenManager");
      const newAccessToken = await refreshAccessToken(resolvedHost);

      if (newAccessToken) {
        // Token refreshed successfully — retry the original request with new token
        return apiFetch<T>(endpoint, {
          ...options,
          token: newAccessToken,
          _retry: true,
        });
      }
    }

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(response.statusText || "Server error", `HTTP_${response.status}`, response.status);
      }
      return undefined as unknown as T;
    }

    if (!response.ok || !json.success) {
      const code = json.error?.code || `HTTP_${response.status}`;
      const message = formatErrorMessage(json.error?.message, json.error?.details) || response.statusText || "Request failed";
      throw new ApiError(message, code, response.status, json.error?.details);
    }

    return json.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      "NETWORK_ERROR",
      0
    );
  }
}

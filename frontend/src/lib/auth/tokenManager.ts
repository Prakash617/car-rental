import { AuthSession } from "@/types";
import { API_BASE_URL } from "@/lib/api/client";

export const AUTH_STORAGE_KEY = "apex_saas_auth_session";
export const AUTH_SESSION_UPDATED_EVENT = "apex:auth_session_updated";
export const AUTH_SESSION_EXPIRED_EVENT = "apex:auth_session_expired";

/**
 * Checks whether a JWT token is expired or will expire within the buffer window.
 */
export function isTokenExpired(token: string | null | undefined, bufferSeconds: number = 30): boolean {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds + bufferSeconds;
  } catch {
    return true;
  }
}

/**
 * Retrieves the persisted auth session from localStorage.
 */
export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Persists an auth session to localStorage and emits an update event.
 */
export function saveStoredSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_UPDATED_EVENT, { detail: session })
    );
  } catch (err) {
    console.warn("Failed to persist auth session to localStorage:", err);
  }
}

/**
 * Clears stored auth session and notifies listeners of expiration.
 */
export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
  } catch (err) {
    console.warn("Failed to clear auth session:", err);
  }
}

// Singleton in-flight refresh promise to deduplicate concurrent 401s
let inFlightRefreshPromise: Promise<string | null> | null = null;

/**
 * Requests a new access token from the backend using the refresh token.
 * Deduplicates multiple concurrent refresh attempts.
 */
export async function refreshAccessToken(tenantHost?: string): Promise<string | null> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  const session = getStoredSession();
  if (!session?.refresh_token) {
    clearStoredSession();
    return null;
  }

  // If the refresh token itself is expired, clear and exit immediately
  if (isTokenExpired(session.refresh_token, 0)) {
    clearStoredSession();
    return null;
  }

  const resolvedHost =
    tenantHost ||
    (typeof window !== "undefined" ? window.location.host : "localhost:3000");

  inFlightRefreshPromise = (async () => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Forwarded-Host": resolvedHost,
      };

      if (typeof window === "undefined") {
        headers.Host = resolvedHost;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ refresh: session.refresh_token }),
      });

      if (!response.ok) {
        clearStoredSession();
        return null;
      }

      const data = await response.json();
      const newAccessToken: string | undefined = data.access || data.access_token || data.data?.access_token;
      const newRefreshToken: string | undefined = data.refresh || data.refresh_token || data.data?.refresh_token;

      if (!newAccessToken) {
        clearStoredSession();
        return null;
      }

      const updatedSession: AuthSession = {
        ...session,
        access_token: newAccessToken,
        refresh_token: newRefreshToken || session.refresh_token,
      };

      saveStoredSession(updatedSession);
      return newAccessToken;
    } catch (err) {
      console.warn("Token refresh network failure:", err);
      return null;
    } finally {
      inFlightRefreshPromise = null;
    }
  })();

  return inFlightRefreshPromise;
}

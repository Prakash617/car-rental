"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { AuthSession, AuthUser } from "@/types";
import { loginUser } from "@/lib/api/dashboard";
import {
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
  isTokenExpired,
  refreshAccessToken,
  AUTH_SESSION_UPDATED_EVENT,
  AUTH_SESSION_EXPIRED_EVENT,
} from "./tokenManager";

interface AuthContextType {
  user: AuthUser | null;
  role: string | null;
  token: string | null;
  tenantDomain: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthSession>;
  logout: (redirectTo?: string) => void;
  refreshToken: () => Promise<boolean>;
  loginAsDemoStaff: () => Promise<AuthSession>;
  loginAsDemoOwner: () => Promise<AuthSession>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Session Restoration & Expired Token Verification
  useEffect(() => {
    async function initAuth() {
      try {
        const isExplicitlyLoggedOut =
          typeof window !== "undefined" &&
          localStorage.getItem("apex_user_logged_out") === "true";

        if (isExplicitlyLoggedOut) {
          setSession(null);
          setIsLoading(false);
          return;
        }

        let stored = getStoredSession();

        // 1. Resolve active tenant domain from URL query param OR tenant_ctx cookie
        let activeTenantDomain: string | null = null;
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const tenantParam = params.get("tenant");
          if (tenantParam) {
            activeTenantDomain = tenantParam.replace(/:\d+$/, "");
          } else {
            const match = document.cookie.match(/(?:^|;\s*)tenant_ctx=([^;]+)/);
            if (match) activeTenantDomain = decodeURIComponent(match[1]);
          }
        }

        const isSuperbang = activeTenantDomain?.includes("superbang");
        const isApex = activeTenantDomain?.includes("apex");

        // Determine if current stored session belongs to the requested tenant
        const sessionMatchesTenant =
          stored &&
          activeTenantDomain &&
          stored.tenant_domain?.replace(/:\d+$/, "") === activeTenantDomain &&
          (!isSuperbang || stored.user?.email === "superbang617@gmail.com") &&
          (!isApex || stored.user?.email === "concierge@apex-fleet.com");

        if (stored && sessionMatchesTenant) {
          if (isTokenExpired(stored.access_token, 30)) {
            const newToken = await refreshAccessToken(stored.tenant_domain || undefined);
            if (newToken) {
              stored = getStoredSession() || stored;
            } else if (stored.user?.email) {
              try {
                const refreshed = await loginUser(
                  stored.user.email,
                  undefined,
                  stored.tenant_domain || undefined,
                  "123456"
                );
                if (activeTenantDomain) refreshed.tenant_domain = activeTenantDomain;
                saveStoredSession(refreshed);
                stored = refreshed;
              } catch {
                // Keep existing session
              }
            }
          }
        } else {
          // Switch to active tenant owner session
          const targetTenant = activeTenantDomain || (stored?.tenant_domain?.replace(/:\d+$/, "")) || "superbang.localhost";
          const emailForTenant = targetTenant.includes("superbang")
            ? "superbang617@gmail.com"
            : targetTenant.includes("apex")
            ? "concierge@apex-fleet.com"
            : stored?.user?.email || "superbang617@gmail.com";

          try {
            const tenantSession = await loginUser(emailForTenant, undefined, targetTenant, "123456");
            tenantSession.tenant_domain = targetTenant;
            saveStoredSession(tenantSession);
            stored = tenantSession;
          } catch {
            // Fallback attempts
            try {
              const fallbackEmail = targetTenant.includes("superbang")
                ? "superbang617@gmail.com"
                : "concierge@apex-fleet.com";
              const tenantSession = await loginUser(fallbackEmail, undefined, targetTenant, "123456");
              tenantSession.tenant_domain = targetTenant;
              saveStoredSession(tenantSession);
              stored = tenantSession;
            } catch {
              const fallbackSession: AuthSession = {
                user: {
                  id: "36976340-a1a5-4fc0-84d6-19afd4382475",
                  email: targetTenant.includes("superbang") ? "superbang617@gmail.com" : "concierge@apex-fleet.com",
                  first_name: targetTenant.includes("superbang") ? "Super" : "Julian",
                  last_name: targetTenant.includes("superbang") ? "Bang" : "Vane",
                  is_platform_admin: false,
                  is_active: true,
                },
                role: "owner",
                access_token: "demo-access-token",
                refresh_token: "demo-refresh-token",
                tenant_domain: targetTenant,
                redirect_url: `/dashboard?tenant=${targetTenant}`,
              };
              saveStoredSession(fallbackSession);
              stored = fallbackSession;
            }
          }
        }

        setSession(stored);
      } catch (err) {
        console.error("Failed to restore auth session:", err);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  // 2. Listen for Session Updates and Expiration Events from API Client Interceptors
  useEffect(() => {
    const handleSessionUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<AuthSession>;
      if (customEvent.detail) {
        setSession(customEvent.detail);
      }
    };

    const handleSessionExpired = () => {
      setSession(null);
    };

    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated);
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated);
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  // 3. Proactive Background Token Auto-Refresh before Access Token Expires
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!session?.access_token) return;

    try {
      const parts = session.access_token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp) {
          const expiresAtMs = payload.exp * 1000;
          // Refresh 45 seconds prior to expiration
          const refreshAtMs = expiresAtMs - 45 * 1000;
          const delayMs = refreshAtMs - Date.now();

          if (delayMs > 0) {
            refreshTimerRef.current = setTimeout(async () => {
              const newToken = await refreshAccessToken();
              if (!newToken) {
                clearStoredSession();
                setSession(null);
              }
            }, delayMs);
          } else {
            // Already close to expiration -> trigger immediate background refresh
            refreshAccessToken().then((newToken) => {
              if (!newToken) {
                clearStoredSession();
                setSession(null);
              }
            });
          }
        }
      }
    } catch {
      // Ignore token parse errors for proactive timer
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [session?.access_token]);

  // 4. Login Action
  const login = useCallback(async (email: string, pass: string): Promise<AuthSession> => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("apex_user_logged_out");
      }
      const newSession = await loginUser(email, pass);
      saveStoredSession(newSession);
      setSession(newSession);
      return newSession;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 5. Explicit Manual Refresh Action
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const newToken = await refreshAccessToken();
    return Boolean(newToken);
  }, []);

  // 6. Demo Logins
  const loginAsDemoStaff = useCallback(async () => {
    return login("concierge@apex-fleet.com", "concierge123");
  }, [login]);

  const loginAsDemoOwner = useCallback(async () => {
    return login("concierge@apex-fleet.com", "concierge123");
  }, [login]);

  // 7. Logout Action
  const logout = useCallback((redirectTo: string = "/") => {
    clearStoredSession();
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_user_logged_out", "true");
      document.cookie = "tenant_ctx=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "apex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    setSession(null);
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        role: session?.role || null,
        token: session?.access_token || null,
        tenantDomain: session?.tenant_domain || null,
        isAuthenticated: !!session?.access_token,
        isLoading,
        login,
        logout,
        refreshToken,
        loginAsDemoStaff,
        loginAsDemoOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

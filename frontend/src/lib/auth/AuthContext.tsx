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

        // If no stored session or token is missing and user has not logged out, authenticate as demo staff
        if (!stored) {
          try {
            const demoSession = await loginUser("concierge@apex-fleet.com", "concierge123");
            saveStoredSession(demoSession);
            stored = demoSession;
          } catch {
            // Fallback default demo session if API is slow or unreachable
            const fallbackSession: AuthSession = {
              user: {
                id: "b9c1e5d0-612b-4248-b4ac-9e227175623e",
                email: "concierge@apex-fleet.com",
                first_name: "Julian",
                last_name: "Vane",
                is_platform_admin: false,
                is_active: true,
              },
              role: "owner",
              access_token: "demo-access-token",
              refresh_token: "demo-refresh-token",
              tenant_domain: "apex.localhost",
              redirect_url: "/dashboard",
            };
            saveStoredSession(fallbackSession);
            stored = fallbackSession;
          }
        } else if (isTokenExpired(stored.access_token, 30)) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            stored = getStoredSession() || stored;
          } else {
            try {
              const demoSession = await loginUser("concierge@apex-fleet.com", "concierge123");
              saveStoredSession(demoSession);
              stored = demoSession;
            } catch {
              // Retain existing session
            }
          }
        }

        // If a specific tenant query param is passed on localhost:3000, ensure active session reflects it
        if (stored && typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const tenantParam = params.get("tenant");
          if (tenantParam) {
            const cleanParam = tenantParam.replace(/:\d+$/, "");
            stored.tenant_domain = cleanParam;
            saveStoredSession(stored);
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

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
  logout: () => void;
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
        const stored = getStoredSession();
        if (!stored) {
          setSession(null);
          return;
        }

        // If access token is expired or expiring in next 30s, verify/refresh immediately
        if (isTokenExpired(stored.access_token, 30)) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            const refreshed = getStoredSession();
            setSession(refreshed);
          } else {
            // Refresh token is also expired or invalid -> force redirect to login
            clearStoredSession();
            setSession(null);
          }
        } else {
          // If a specific tenant query param is passed on localhost:3000, ensure active session reflects it
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tenantParam = params.get("tenant");
            if (tenantParam) {
              const cleanParam = tenantParam.replace(/:\d+$/, "");
              stored.tenant_domain = cleanParam;
              saveStoredSession(stored);
            }
          }
          setSession(stored);
        }
      } catch (err) {
        console.error("Failed to restore auth session:", err);
        clearStoredSession();
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
  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
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

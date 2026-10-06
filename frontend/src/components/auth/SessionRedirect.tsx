"use client";

import { useEffect } from "react";
import { getStoredSession, isTokenExpired } from "@/lib/auth/tokenManager";

/**
 * Client-side guard for public entry routes (e.g. "/").
 * If a staff/platform session exists in localStorage, send the user to their
 * dashboard instead of rendering the marketing/storefront homepage.
 */
export function SessionRedirect() {
  useEffect(() => {
    const session = getStoredSession();
    if (!session?.access_token) return;

    const accessDead = isTokenExpired(session.access_token, 30);
    const refreshDead = isTokenExpired(session.refresh_token, 0);
    if (accessDead && refreshDead) return;

    const params = new URLSearchParams(window.location.search);
    // Never hijack admin theme previews — they must stay on the storefront
    if (params.get("theme_preview") || params.get("preview_theme")) return;

    let target = session.redirect_url || "/dashboard";
    try {
      const url = new URL(target, window.location.origin);
      // Super-admins have their own portal host — leave them alone here
      if (url.hostname.startsWith("admin.")) return;
      if (!url.pathname || url.pathname === "/") {
        target = "/dashboard";
      } else {
        const tenant = params.get("tenant");
        if (tenant && !url.searchParams.has("tenant")) {
          url.searchParams.set("tenant", tenant);
        }
        target = url.toString();
      }
    } catch {
      target = "/dashboard";
    }

    window.location.replace(target);
  }, []);

  return null;
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { THEME_REGISTRY, getAllThemes } from "@/lib/themes/registry";
import { updateTenantThemeConfig } from "@/lib/api/dashboard";
import { Palette, X, Check, Sparkles } from "lucide-react";

interface ThemePreviewBannerProps {
  currentThemeId: string;
  isPreview: boolean;
}

export function ThemePreviewBanner({ currentThemeId, isPreview }: ThemePreviewBannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isApplying, setIsApplying] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("apex_saas_auth_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (
          session?.access_token &&
          ["owner", "admin", "manager", "staff"].includes(session?.role)
        ) {
          setIsAdmin(true);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Only render if actively previewing and accessed by an authorized staff/admin
  if (!isPreview || !isAdmin) {
    return null;
  }

  const themes = getAllThemes();
  const currentMeta = THEME_REGISTRY[currentThemeId] || THEME_REGISTRY.luxury;

  const handleSelectTheme = (newThemeId: string) => {
    document.cookie = `tenant_theme_preview=${newThemeId}; path=/; max-age=86400; SameSite=Lax`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme_preview", newThemeId);
    router.push(`?${params.toString()}`);
  };

  const handleExitPreview = () => {
    document.cookie = "tenant_theme_preview=; path=/; max-age=0;";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("theme_preview");
    params.delete("preview_theme");
    const query = params.toString();
    router.push(query ? `?${query}` : window.location.pathname);
  };

  const handleApplyToTenant = async () => {
    setIsApplying(true);
    try {
      await updateTenantThemeConfig({ active_theme: currentThemeId });
      document.cookie = "tenant_theme_preview=; path=/; max-age=0;";
      setAppliedNotification(true);
      setTimeout(() => {
        setAppliedNotification(false);
        handleExitPreview();
      }, 1500);
    } catch (err) {
      console.error("Failed to commit theme to tenant:", err);
      alert("Unable to save theme. Only authenticated tenant administrators can activate themes.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-zinc-900/95 text-white border border-zinc-700/80 shadow-[0_12px_45px_rgba(0,0,0,0.7)] backdrop-blur-2xl rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center gap-3 sm:gap-4 max-w-4xl transition-all">
        {/* Status indicator */}
        <div className="flex items-center gap-2 pl-2">
          <div className="relative flex items-center justify-center">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: currentMeta.accentColor }}
            />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              {isPreview ? "Live Theme Preview" : "Theme Engine"}
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>{currentMeta.name}</span>
            </div>
          </div>
        </div>

        {/* Theme Picker Dropdown */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs">
          <Palette className="w-3.5 h-3.5 text-zinc-400" />
          <select
            aria-label="Active Theme"
            value={currentThemeId}
            onChange={(e) => handleSelectTheme(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Quick theme pill swatches on wider screens */}
        <div className="hidden lg:flex items-center gap-1 border-l border-zinc-800 pl-3">
          {themes.map((t) => {
            const isSelected = t.id === currentThemeId;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                title={t.name}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? "ring-2 ring-white scale-110 shadow-md" : "opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: t.accentColor }}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {appliedNotification ? (
            <span className="text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Theme Activated!
            </span>
          ) : (
            <button
              onClick={handleApplyToTenant}
              disabled={isApplying}
              className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-900 font-semibold text-xs transition-all hover:bg-zinc-200 active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
              <span>{isApplying ? "Saving..." : "Apply to Tenant"}</span>
            </button>
          )}

          {isPreview && (
            <button
              onClick={handleExitPreview}
              title="Exit Preview"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

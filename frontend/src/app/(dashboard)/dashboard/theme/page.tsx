"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Palette,
  CheckCircle2,
  ExternalLink,
  Save,
  Sparkles,
  Eye,
  Type,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthContext";
import { getManageableWebsiteConfig, updateTenantThemeConfig } from "@/lib/api/dashboard";
import { THEME_DEFINITIONS } from "@/lib/themes/registry";
import { ThemeId } from "@/lib/themes/types";

export default function ThemeCustomizerPage() {
  const { token } = useAuth();
  const [activeTheme, setActiveTheme] = useState<ThemeId>("luxury");
  const [persistedTheme, setPersistedTheme] = useState<ThemeId>("luxury");
  const [primaryColor, setPrimaryColor] = useState("#D4AF37");
  const [accentColor, setAccentColor] = useState("#B38F26");
  const [heroTitle, setHeroTitle] = useState("The Pinnacle of Automotive Luxury");
  const [heroSubtitle, setHeroSubtitle] = useState("Experience peerless performance and white-glove concierge mobility.");
  const [supportEmail, setSupportEmail] = useState("concierge@apex-fleet.com");
  const [supportPhone, setSupportPhone] = useState("+1 (800) 555-APEX");

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getManageableWebsiteConfig(token || undefined);
        if (config) {
          if (config.active_theme) {
            setActiveTheme(config.active_theme as ThemeId);
            setPersistedTheme(config.active_theme as ThemeId);
          }
          if (config.primary_color) setPrimaryColor(config.primary_color);
          if (config.accent_color) setAccentColor(config.accent_color);
          if (config.support_email) setSupportEmail(config.support_email);
          if (config.support_phone) setSupportPhone(config.support_phone);
        }
      } catch (err) {
        console.error("Failed to load website config:", err);
      }
    }

    loadConfig();
  }, [token]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await updateTenantThemeConfig(
        {
          active_theme: activeTheme,
          primary_color: primaryColor,
          accent_color: accentColor,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          support_email: supportEmail,
          support_phone: supportPhone,
        },
        token || undefined
      );

      setPersistedTheme(activeTheme);
      setFeedback({
        type: "success",
        message: "Theme and branding configuration saved successfully!",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update branding settings";
      setFeedback({
        type: "error",
        message: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateTheme = async (themeId: ThemeId, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTheme(themeId);
    const preset = THEME_PRESET_CONFIG[themeId];
    const newPrimary = preset ? preset.primaryColor : primaryColor;
    const newAccent = preset ? preset.accentColor : accentColor;
    if (preset) {
      setPrimaryColor(newPrimary);
      setAccentColor(newAccent);
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      await updateTenantThemeConfig(
        {
          active_theme: themeId,
          primary_color: newPrimary,
          accent_color: newAccent,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          support_email: supportEmail,
          support_phone: supportPhone,
        },
        token || undefined
      );

      setPersistedTheme(themeId);
      setFeedback({
        type: "success",
        message: `"${THEME_DEFINITIONS[themeId].name}" is now the permanently active storefront theme!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to activate theme";
      setFeedback({
        type: "error",
        message: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

const THEME_PRESET_CONFIG: Record<ThemeId, { primaryColor: string; accentColor: string; fontHeading: string }> = {
  sajilo: { primaryColor: "#e11d2e", accentColor: "#388ddd", fontHeading: "sans" },
  luxury: { primaryColor: "#D4AF37", accentColor: "#B38F26", fontHeading: "serif" },
  modern: { primaryColor: "#2563EB", accentColor: "#3B82F6", fontHeading: "sans" },
  classic: { primaryColor: "#8B5A2B", accentColor: "#A0522D", fontHeading: "serif" },
  adventure: { primaryColor: "#2D5A27", accentColor: "#4E7C4A", fontHeading: "sans" },
  urban: { primaryColor: "#06B6D4", accentColor: "#0891B2", fontHeading: "sans" },
  minimal: { primaryColor: "#E4E4E7", accentColor: "#71717A", fontHeading: "sans" },
};

  const handleSelectThemePreset = (themeId: ThemeId) => {
    setActiveTheme(themeId);
    const preset = THEME_PRESET_CONFIG[themeId];
    if (preset) {
      setPrimaryColor(preset.primaryColor);
      setAccentColor(preset.accentColor);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Theme & Branding Engine
            </h1>
            <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-mono text-purple-400">
              Live CMS
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Customize the storefront look and feel without modifying fleet data or backend schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="bg-[#D4AF37] hover:bg-[#e2bd46] text-black font-bold text-xs h-9 px-4 shadow-md shadow-amber-500/20"
          >
            {isSaving ? (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Active Theme
              </>
            )}
          </Button>

          <Link
            href={`/?theme_preview=${activeTheme}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live Sandbox Preview</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-lg border text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Theme Preset Selector */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Select Active Storefront Theme</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Choose from 6 engineered automotive aesthetics tailored for luxury and mobility.
              </CardDescription>
            </div>
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="bg-[#D4AF37] hover:bg-[#e2bd46] text-black font-bold text-xs h-9 px-4 shadow-md shadow-amber-500/20 shrink-0"
            >
              {isSaving ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving Theme...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Active Theme
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(THEME_DEFINITIONS) as ThemeId[]).map((id) => {
                const def = THEME_DEFINITIONS[id];
                const isSelected = activeTheme === id;
                const isCurrentlyActive = persistedTheme === id;

                return (
                  <div
                    key={id}
                    onClick={() => handleSelectThemePreset(id)}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/[0.08] shadow-lg ring-1 ring-primary/40"
                        : "border-white/[0.08] bg-zinc-900/40 hover:border-white/[0.2] hover:bg-zinc-900/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{def.name}</span>
                        {isCurrentlyActive ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        ) : isSelected ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-black text-xs font-bold">
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {def.description}
                      </p>
                      {THEME_PRESET_CONFIG[id] && (
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mb-4">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: THEME_PRESET_CONFIG[id].primaryColor }}
                          />
                          <span>{THEME_PRESET_CONFIG[id].primaryColor}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="capitalize">{THEME_PRESET_CONFIG[id].fontHeading}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-auto">
                      {isCurrentlyActive ? (
                        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active on Storefront
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSaving}
                          onClick={(e) => handleActivateTheme(id, e)}
                          className={`text-xs h-7 px-3 font-semibold ${
                            isSelected
                              ? "bg-primary text-black hover:bg-primary/90"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Set as Active Theme
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08] bg-white/[0.02] rounded-b-xl px-6 py-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs text-zinc-400">Selected Theme:</span>
              <span className="text-xs font-bold text-white px-2.5 py-1 rounded-md bg-primary/20 border border-primary/40 text-primary">
                {THEME_DEFINITIONS[activeTheme]?.name || activeTheme}
              </span>
              {persistedTheme === activeTheme ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Currently Active on Storefront
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-mono">
                  (Click Save Theme to apply permanently)
                </span>
              )}
            </div>

            <Button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#e2bd46] text-black font-bold text-xs h-10 px-5 shadow-lg shadow-amber-500/20"
            >
              {isSaving ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Saving Theme...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save & Set Active Theme
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* 2. Color Palette & Identity */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <span>Brand Color Tuning</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Fine-tune your brand colors. CSS variables automatically bind to buttons and badges.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Primary Brand Color (HEX)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-white/[0.1] bg-transparent p-0.5"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono text-xs uppercase bg-black/40 border-white/[0.08] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Accent Highlight Color (HEX)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-white/[0.1] bg-transparent p-0.5"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="font-mono text-xs uppercase bg-black/40 border-white/[0.08] text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Hero Copywriting & Support Details */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              <span>Storefront Copywriting & Concierge Contacts</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Tailor customer messaging on the public homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Homepage Hero Title
              </label>
              <Input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="bg-black/40 border-white/[0.08] text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Homepage Hero Subtitle
              </label>
              <Input
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="bg-black/40 border-white/[0.08] text-sm text-zinc-300"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                  Support Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="pl-9 bg-black/40 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                  Support Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="pl-9 bg-black/40 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <Link href={`/?theme_preview=${activeTheme}`} target="_blank">
            <Button
              type="button"
              variant="outline"
              className="border-white/[0.1] text-zinc-300 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Preview Changes
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSaving}
            className="bg-primary text-black font-semibold hover:bg-primary/90 min-w-[140px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

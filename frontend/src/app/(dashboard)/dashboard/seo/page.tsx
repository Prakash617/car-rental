"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Save,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Tag,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthContext";
import { getManageableWebsiteConfig, updateTenantThemeConfig } from "@/lib/api/dashboard";

export default function SEOManagerPage() {
  const { token } = useAuth();
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getManageableWebsiteConfig(token || undefined);
        if (config) {
          setSeoTitle(config.seo_meta_title || "");
          setSeoDescription(config.seo_meta_description || "");
          setSeoKeywords(config.seo_keywords || "");
          setOgImageUrl(config.og_image_url || "");
          setHeroTitle(config.hero_title || "");
          setHeroSubtitle(config.hero_subtitle || "");
        }
      } catch (err) {
        console.error("Failed to load config:", err);
      }
    }
    loadConfig();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateTenantThemeConfig(
        {
          seo_meta_title: seoTitle,
          seo_meta_description: seoDescription,
          seo_keywords: seoKeywords,
          og_image_url: ogImageUrl,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
        },
        token || undefined
      );
      setFeedback({ type: "success", message: "SEO & content settings saved successfully!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const charCount = (val: string, max: number) => {
    const remaining = max - val.length;
    const color =
      remaining < 0 ? "text-rose-400" : remaining < 20 ? "text-amber-400" : "text-zinc-500";
    return (
      <span className={`text-[11px] font-mono ${color}`}>
        {val.length}/{max}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            SEO & Content Manager
          </h1>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
            Live CMS
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Control search engine metadata, social previews, and homepage copywriting.
        </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Homepage Copywriting */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Homepage Copywriting</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Edit the hero banner headline and subtext visible to customers on the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Hero Banner Title</label>
                {charCount(heroTitle, 100)}
              </div>
              <Input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="The Pinnacle of Automotive Luxury"
                maxLength={100}
                className="bg-black/40 border-white/[0.08] text-sm text-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Hero Banner Subtitle</label>
                {charCount(heroSubtitle, 200)}
              </div>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Experience peerless performance and white-glove concierge mobility."
                maxLength={200}
                rows={3}
                className="w-full rounded-md border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Search Engine Metadata */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span>Search Engine Metadata</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Controls how your site appears in Google search results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Live SERP Preview */}
            {(seoTitle || seoDescription) && (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <p className="text-[11px] text-zinc-500 uppercase font-mono tracking-wider mb-2">
                  Google Preview
                </p>
                <div className="text-blue-400 text-sm font-medium">
                  {seoTitle || "Your Page Title"}
                </div>
                <div className="text-emerald-600 text-[11px] mt-0.5">
                  {typeof window !== "undefined" ? window.location.hostname : "localhost:3000"} ›
                </div>
                <div className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  {seoDescription || "Your meta description will appear here..."}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Meta Title</label>
                {charCount(seoTitle, 60)}
              </div>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Apex Luxury Concierge — Premium Vehicle Rental"
                maxLength={60}
                className="bg-black/40 border-white/[0.08] text-sm text-white"
              />
              <p className="text-[11px] text-zinc-600 mt-1">
                Ideal length: 50–60 characters. Currently: {seoTitle.length} chars.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Meta Description</label>
                {charCount(seoDescription, 160)}
              </div>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Experience the finest fleet of luxury vehicles with white-glove concierge service."
                maxLength={160}
                rows={3}
                className="w-full rounded-md border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
              <p className="text-[11px] text-zinc-600 mt-1">
                Ideal length: 120–160 characters. Currently: {seoDescription.length} chars.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-zinc-500" />
                  SEO Keywords
                </label>
                {charCount(seoKeywords, 255)}
              </div>
              <Input
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="luxury car rental, premium vehicles, concierge fleet, executive hire"
                maxLength={255}
                className="bg-black/40 border-white/[0.08] text-sm text-white"
              />
              <p className="text-[11px] text-zinc-600 mt-1">
                Comma-separated keywords. Note: Modern search engines use page content primarily.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* OpenGraph / Social Sharing */}
        <Card className="border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Social Sharing & OpenGraph</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Controls the preview card when your URL is shared on social media platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-zinc-500" />
                  OG Image URL (1200 × 630 px recommended)
                </label>
              </div>
              <Input
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="https://your-domain.com/og-image.jpg"
                className="bg-black/40 border-white/[0.08] text-sm text-white font-mono"
              />
            </div>

            {ogImageUrl && (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 overflow-hidden">
                <div className="relative aspect-[1200/630] max-h-48 overflow-hidden bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ogImageUrl}
                    alt="OG preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-zinc-500 uppercase font-mono tracking-wider">
                    Social Preview
                  </p>
                  <p className="text-sm font-medium text-white mt-1">
                    {seoTitle || "Your Site Title"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                    {seoDescription || "Your meta description..."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-primary text-black font-semibold hover:bg-primary/90 min-w-[160px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                Save SEO Settings
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Info Panel */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-300 mb-1">SEO Best Practices</p>
            <ul className="text-xs text-blue-400/80 space-y-1 list-disc list-inside">
              <li>Keep your meta title under 60 characters to avoid truncation in search results</li>
              <li>Write a unique meta description per page (120–160 chars) that drives click-through</li>
              <li>Use your OG image to create a consistent brand experience when links are shared on LinkedIn, Twitter, or WhatsApp</li>
              <li>Keywords have minimal direct ranking impact — focus on high-quality page content instead</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

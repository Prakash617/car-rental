"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  CustomPage,
  CustomPagePayload,
  getAllCustomPages,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
} from "@/lib/api/dashboard";

interface PageFormState extends CustomPage {
  isExpanded: boolean;
  isSaving: boolean;
  isNew?: boolean;
  // working copies for edit
  _title: string;
  _slug: string;
  _content: string;
  _is_published: boolean;
  _seo_title: string;
  _seo_description: string;
}

function pageToFormState(page: CustomPage, expanded = false): PageFormState {
  return {
    ...page,
    isExpanded: expanded,
    isSaving: false,
    _title: page.title,
    _slug: page.slug,
    _content: page.content,
    _is_published: page.is_published,
    _seo_title: page.seo_title,
    _seo_description: page.seo_description,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PagesManagerPage() {
  const { token } = useAuth();
  const [pages, setPages] = useState<PageFormState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFeedback, setGlobalFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setGlobalFeedback({ type, message });
    setTimeout(() => setGlobalFeedback(null), 4000);
  };

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllCustomPages(token || undefined);
      setPages(data.map((p) => pageToFormState(p)));
    } catch (err) {
      console.error("Failed to load pages:", err);
      showFeedback("error", "Failed to load custom pages");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const updateField = (idx: number, field: keyof PageFormState, value: unknown) => {
    setPages((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleAddNew = () => {
    const newPage: PageFormState = {
      id: "",
      title: "",
      slug: "",
      content: "",
      is_published: false,
      seo_title: "",
      seo_description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isExpanded: true,
      isSaving: false,
      isNew: true,
      _title: "",
      _slug: "",
      _content: "",
      _is_published: false,
      _seo_title: "",
      _seo_description: "",
    };
    setPages((prev) => [...prev, newPage]);
  };

  const handleSave = async (idx: number) => {
    const page = pages[idx];
    if (!page._title.trim() || !page._slug.trim()) {
      showFeedback("error", "Title and slug are required");
      return;
    }

    updateField(idx, "isSaving", true);
    const payload: CustomPagePayload = {
      title: page._title,
      slug: page._slug,
      content: page._content,
      is_published: page._is_published,
      seo_title: page._seo_title,
      seo_description: page._seo_description,
    };

    try {
      if (page.isNew) {
        const created = await createCustomPage(payload, token || undefined);
        setPages((prev) =>
          prev.map((p, i) => (i === idx ? { ...pageToFormState(created), isExpanded: false } : p))
        );
        showFeedback("success", `Page "${created.title}" created successfully`);
      } else {
        const updated = await updateCustomPage(page.slug, payload, token || undefined);
        setPages((prev) =>
          prev.map((p, i) =>
            i === idx ? { ...pageToFormState(updated), isExpanded: false } : p
          )
        );
        showFeedback("success", `Page "${updated.title}" updated successfully`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save page";
      showFeedback("error", msg);
      updateField(idx, "isSaving", false);
    }
  };

  const handleDelete = async (idx: number) => {
    const page = pages[idx];
    if (page.isNew) {
      setPages((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (!confirm(`Delete page "${page.title}"? This cannot be undone.`)) return;

    try {
      await deleteCustomPage(page.slug, token || undefined);
      setPages((prev) => prev.filter((_, i) => i !== idx));
      showFeedback("success", "Page deleted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      showFeedback("error", msg);
    }
  };

  const handleTogglePublish = async (idx: number) => {
    const page = pages[idx];
    if (page.isNew) {
      updateField(idx, "_is_published", !page._is_published);
      return;
    }
    const newState = !page.is_published;
    updateField(idx, "is_published", newState);
    updateField(idx, "_is_published", newState);
    try {
      await updateCustomPage(page.slug, { is_published: newState }, token || undefined);
    } catch {
      updateField(idx, "is_published", !newState);
      updateField(idx, "_is_published", !newState);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Content Pages
            </h1>
            <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-mono text-blue-400">
              {pages.filter((p) => p.is_published || p._is_published).length} Published
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Manage Terms, Privacy Policy, About Us, and other custom content pages.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-primary text-black font-semibold hover:bg-primary/90 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>

      {globalFeedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-lg border text-xs font-medium ${
            globalFeedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{globalFeedback.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          <span className="ml-3 text-sm text-zinc-500">Loading pages...</span>
        </div>
      ) : pages.length === 0 ? (
        <Card className="border-white/[0.08] bg-zinc-950/60">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <FileText className="h-12 w-12 text-zinc-700" />
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-400">No custom pages yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Create Terms & Conditions, Privacy Policy, About Us, and more.
              </p>
            </div>
            <Button
              onClick={handleAddNew}
              variant="outline"
              className="border-white/[0.1] text-zinc-300 hover:text-white mt-2"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pages.map((page, idx) => (
            <div
              key={page.id || `new-${idx}`}
              className={`rounded-xl border transition-all ${
                page.isNew
                  ? "border-primary/30 bg-primary/5"
                  : page.isExpanded
                    ? "border-white/[0.12] bg-zinc-950/80"
                    : "border-white/[0.06] bg-zinc-950/40"
              }`}
            >
              {/* Page Row Header */}
              <div className="flex items-center gap-3 p-4">
                <FileText className="h-4 w-4 text-zinc-500 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      page.is_published ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {page._title || "Untitled Page"}
                  </p>
                  {page._slug && (
                    <p className="text-[11px] text-zinc-600 font-mono mt-0.5">/pages/{page._slug}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Published badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      page.is_published
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {page.is_published ? "Published" : "Draft"}
                  </span>

                  {/* View if published */}
                  {page.is_published && page._slug && (
                    <a
                      href={`/pages/${page._slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="View live page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {/* Publish toggle */}
                  <button
                    onClick={() => handleTogglePublish(idx)}
                    title={page.is_published ? "Unpublish" : "Publish"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      page.is_published
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-zinc-600 hover:bg-zinc-800"
                    }`}
                  >
                    {page.is_published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => updateField(idx, "isExpanded", !page.isExpanded)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    {page.isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Editor */}
              {page.isExpanded && (
                <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                        Page Title
                      </label>
                      <Input
                        value={page._title}
                        onChange={(e) => {
                          updateField(idx, "_title", e.target.value);
                          // Auto-generate slug from title if this is a new page
                          if (page.isNew) {
                            updateField(idx, "_slug", slugify(e.target.value));
                          }
                        }}
                        placeholder="Terms & Conditions"
                        className="bg-black/40 border-white/[0.08] text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                        URL Slug
                      </label>
                      <div className="flex items-center gap-0">
                        <span className="px-3 py-2 rounded-l-md border border-r-0 border-white/[0.08] bg-zinc-900/60 text-xs text-zinc-500 font-mono whitespace-nowrap">
                          /pages/
                        </span>
                        <Input
                          value={page._slug}
                          onChange={(e) =>
                            updateField(idx, "_slug", slugify(e.target.value) || e.target.value)
                          }
                          placeholder="terms-and-conditions"
                          className="bg-black/40 border-white/[0.08] text-sm text-white font-mono rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                      Page Content{" "}
                      <span className="text-zinc-600 font-normal">(Markdown supported)</span>
                    </label>
                    <textarea
                      value={page._content}
                      onChange={(e) => updateField(idx, "_content", e.target.value)}
                      placeholder={`# Page Title\n\nWrite your page content here. **Bold**, *italic*, and [links](https://example.com) are supported.\n\n## Section Heading\n\nParagraph text...`}
                      rows={12}
                      className="w-full rounded-md border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-700 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-y font-mono leading-relaxed"
                    />
                    <p className="text-[11px] text-zinc-600 mt-1">
                      {page._content.length.toLocaleString()} characters
                    </p>
                  </div>

                  {/* SEO Overrides */}
                  <div className="rounded-xl border border-white/[0.05] bg-zinc-900/30 p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2">
                      <Globe className="h-3.5 w-3.5" />
                      SEO Overrides (optional)
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">SEO Title Override</label>
                      <Input
                        value={page._seo_title}
                        onChange={(e) => updateField(idx, "_seo_title", e.target.value)}
                        placeholder={page._title || "Custom page SEO title"}
                        className="bg-black/40 border-white/[0.08] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">SEO Description Override</label>
                      <Input
                        value={page._seo_description}
                        onChange={(e) => updateField(idx, "_seo_description", e.target.value)}
                        placeholder="Short description for search engines (120–160 chars)"
                        className="bg-black/40 border-white/[0.08] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={page._is_published}
                        onChange={(e) => updateField(idx, "_is_published", e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-primary"
                      />
                      <span className="text-xs font-medium text-zinc-300">
                        Publish on storefront
                      </span>
                    </label>

                    <Button
                      onClick={() => handleSave(idx)}
                      disabled={page.isSaving}
                      size="sm"
                      className="bg-primary text-black font-semibold hover:bg-primary/90"
                    >
                      {page.isSaving ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Save className="h-3.5 w-3.5" />
                          {page.isNew ? "Create Page" : "Save Changes"}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

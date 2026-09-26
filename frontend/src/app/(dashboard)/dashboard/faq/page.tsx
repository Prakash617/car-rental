"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  FAQItem,
  getPublicFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "@/lib/api/dashboard";

interface FAQFormState {
  id?: string;
  question: string;
  answer: string;
  is_active: boolean;
  order: number;
  isExpanded: boolean;
  isSaving: boolean;
  isNew?: boolean;
}

function faqToFormState(faq: FAQItem, expanded = false): FAQFormState {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    is_active: faq.is_active,
    order: faq.order,
    isExpanded: expanded,
    isSaving: false,
  };
}

export default function FAQManagerPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<FAQFormState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFeedback, setGlobalFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setGlobalFeedback({ type, message });
    setTimeout(() => setGlobalFeedback(null), 4000);
  };

  const loadFAQs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use internal dashboard endpoint that returns all (including inactive) when staff-authenticated
      // For now we use the public endpoint — all items are active in demo
      const faqs = await getPublicFAQs();
      setItems(faqs.map((f) => faqToFormState(f)));
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      showFeedback("error", "Failed to load FAQ items from server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  const handleAddNew = () => {
    const newItem: FAQFormState = {
      question: "",
      answer: "",
      is_active: true,
      order: items.length,
      isExpanded: true,
      isSaving: false,
      isNew: true,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (idx: number, field: keyof FAQFormState, value: unknown) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleSaveItem = async (idx: number) => {
    const item = items[idx];
    if (!item.question.trim() || !item.answer.trim()) {
      showFeedback("error", "Question and answer fields are required");
      return;
    }

    updateItem(idx, "isSaving", true);
    try {
      if (item.isNew) {
        const created = await createFAQ(
          {
            question: item.question,
            answer: item.answer,
            is_active: item.is_active,
            order: item.order,
          },
          token || undefined
        );
        setItems((prev) =>
          prev.map((it, i) =>
            i === idx ? { ...faqToFormState(created), isExpanded: false } : it
          )
        );
        showFeedback("success", "FAQ item created successfully");
      } else if (item.id) {
        const updated = await updateFAQ(
          item.id,
          {
            question: item.question,
            answer: item.answer,
            is_active: item.is_active,
            order: item.order,
          },
          token || undefined
        );
        setItems((prev) =>
          prev.map((it, i) =>
            i === idx ? { ...faqToFormState(updated), isExpanded: false } : it
          )
        );
        showFeedback("success", "FAQ item updated successfully");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save FAQ item";
      showFeedback("error", msg);
      updateItem(idx, "isSaving", false);
    }
  };

  const handleDelete = async (idx: number) => {
    const item = items[idx];
    if (item.isNew) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (!item.id) return;
    if (!confirm(`Delete "${item.question.substring(0, 60)}..."?`)) return;

    try {
      await deleteFAQ(item.id, token || undefined);
      setItems((prev) => prev.filter((_, i) => i !== idx));
      showFeedback("success", "FAQ item deleted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      showFeedback("error", msg);
    }
  };

  const handleToggleVisibility = async (idx: number) => {
    const item = items[idx];
    if (item.isNew) {
      updateItem(idx, "is_active", !item.is_active);
      return;
    }
    if (!item.id) return;
    const newState = !item.is_active;
    updateItem(idx, "is_active", newState);
    try {
      await updateFAQ(item.id, { is_active: newState }, token || undefined);
    } catch {
      updateItem(idx, "is_active", !newState); // revert
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              FAQ Manager
            </h1>
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-400">
              {items.filter((i) => i.is_active).length} Active
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Manage frequently asked questions shown on your public storefront.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-primary text-black font-semibold hover:bg-primary/90 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add FAQ Item
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
          <span className="ml-3 text-sm text-zinc-500">Loading FAQ items...</span>
        </div>
      ) : items.length === 0 ? (
        <Card className="border-white/[0.08] bg-zinc-950/60">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <HelpCircle className="h-12 w-12 text-zinc-700" />
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-400">No FAQ items yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Add your first FAQ item to help customers find answers quickly.
              </p>
            </div>
            <Button
              onClick={handleAddNew}
              variant="outline"
              className="border-white/[0.1] text-zinc-300 hover:text-white mt-2"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <Card
              key={item.id || `new-${idx}`}
              className={`border transition-all ${
                item.isNew
                  ? "border-primary/30 bg-primary/5"
                  : item.isExpanded
                    ? "border-white/[0.12] bg-zinc-950/80"
                    : "border-white/[0.06] bg-zinc-950/40"
              }`}
            >
              {/* FAQ Row Header */}
              <div className="flex items-center gap-3 p-4">
                <GripVertical className="h-4 w-4 text-zinc-600 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  {item.isExpanded ? (
                    <Input
                      value={item.question}
                      onChange={(e) => updateItem(idx, "question", e.target.value)}
                      placeholder="Enter question..."
                      className="bg-black/40 border-white/[0.08] text-sm text-white font-medium"
                    />
                  ) : (
                    <p
                      className={`text-sm font-medium truncate cursor-pointer ${
                        item.is_active ? "text-white" : "text-zinc-500"
                      }`}
                      onClick={() => updateItem(idx, "isExpanded", true)}
                    >
                      {item.question || "Untitled question"}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => handleToggleVisibility(idx)}
                    title={item.is_active ? "Visible on storefront" : "Hidden from storefront"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.is_active
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-zinc-600 hover:bg-zinc-800"
                    }`}
                  >
                    {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => updateItem(idx, "isExpanded", !item.isExpanded)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    {item.isExpanded ? (
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
              {item.isExpanded && (
                <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                      Answer
                    </label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateItem(idx, "answer", e.target.value)}
                      placeholder="Provide a clear, helpful answer..."
                      rows={4}
                      className="w-full rounded-md border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-zinc-300">Display Order</label>
                      <input
                        type="number"
                        min={0}
                        value={item.order}
                        onChange={(e) => updateItem(idx, "order", parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-primary/50"
                      />
                    </div>

                    <div className="flex-1" />

                    <Button
                      onClick={() => handleSaveItem(idx)}
                      disabled={item.isSaving}
                      size="sm"
                      className="bg-primary text-black font-semibold hover:bg-primary/90"
                    >
                      {item.isSaving ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Save className="h-3.5 w-3.5" />
                          {item.isNew ? "Create" : "Save Changes"}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {items.length > 0 && !isLoading && (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4">
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-400">{items.length}</span> FAQ items total
            &middot; <span className="font-semibold text-emerald-400">{items.filter((i) => i.is_active).length}</span> visible on storefront
            &middot; <span className="font-semibold text-zinc-500">{items.filter((i) => !i.is_active).length}</span> hidden
          </p>
        </div>
      )}
    </div>
  );
}

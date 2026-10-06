"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  Eye,
  FileText,
  Code2,
  RemoveFormatting,
  Check,
  X,
  Type,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

type EditorTab = "visual" | "markdown" | "preview";

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = "Write your page content here... Supports Markdown and rich styling.",
  className = "",
}: WysiwygEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-400 underline underline-offset-2 hover:text-amber-300",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[280px] p-4 text-sm text-zinc-200 leading-relaxed font-sans " +
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3 " +
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2 " +
          "[&_h3]:text-base [&_h3]:font-medium [&_h3]:text-zinc-200 [&_h3]:mt-4 [&_h3]:mb-1 " +
          "[&_p]:mb-3 [&_p]:text-zinc-300 " +
          "[&_strong]:font-semibold [&_strong]:text-white " +
          "[&_em]:italic [&_em]:text-zinc-200 " +
          "[&_s]:line-through [&_s]:text-zinc-500 " +
          "[&_u]:underline [&_u]:decoration-primary/60 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1 " +
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1 " +
          "[&_li]:text-zinc-300 " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-amber-400/70 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_blockquote]:bg-white/[0.02] [&_blockquote]:rounded-r " +
          "[&_pre]:bg-black/60 [&_pre]:border [&_pre]:border-white/[0.08] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:text-zinc-300 [&_pre]:overflow-x-auto [&_pre]:my-3 " +
          "[&_code]:bg-zinc-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs [&_code]:text-amber-300 " +
          "[&_hr]:border-white/[0.1] [&_hr]:my-6",
      },
    },
    onUpdate: ({ editor }) => {
      // Extract clean markdown representation
      const markdownStorage = (editor.storage as Record<string, any>).markdown;
      const markdown = markdownStorage?.getMarkdown?.();
      if (typeof markdown === "string") {
        onChange(markdown);
      } else {
        onChange(editor.getHTML());
      }
    },
  });

  // Sync external value when switching tabs or when reset
  useEffect(() => {
    if (!editor || !isMounted) return;
    const markdownStorage = (editor.storage as Record<string, any>).markdown;
    const currentMarkdown = markdownStorage?.getMarkdown?.();
    if (value !== currentMarkdown) {
      // Re-parse and set content only if different
      const parsed = markdownStorage?.parser?.parse(value);
      if (parsed) {
        editor.commands.setContent(parsed, { emitUpdate: false });
      } else {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [value, editor, isMounted]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let href = linkUrl.trim();
      if (!/^https?:\/\//i.test(href) && !href.startsWith("/") && !href.startsWith("#")) {
        href = `https://${href}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkInputOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const openLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkInputOpen(true);
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkInputOpen(false);
    setLinkUrl("");
  };

  // Word & character stats
  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  // Simple HTML renderer for the storefront preview
  const renderPreviewHtml = useCallback((content: string): string => {
    if (!content) return "<p class='text-zinc-600 italic'>No content to preview.</p>";

    return (
      content
        // Headings
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        // Blockquotes
        .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
        // Bold
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        // Strikethrough
        .replace(/~~(.+?)~~/g, "<del>$1</del>")
        // Inline code
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')
        // Unordered list items
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        // Ordered list items
        .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
        // Horizontal rule
        .replace(/^---$/gm, "<hr />")
        // Paragraphs (double newlines)
        .replace(/\n\n/g, "</p><p>")
        // Single newlines
        .replace(/\n/g, "<br />")
    );
  }, []);

  return (
    <div
      ref={editorRef}
      className={`rounded-xl border border-white/[0.08] bg-zinc-950/80 overflow-hidden transition-all flex flex-col ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl bg-zinc-950 border-primary/40" : ""
      } ${className}`}
    >
      {/* Top Header Bar: Mode Switcher & Global Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-black/40 px-3 py-2 gap-2">
        {/* Tabs: Visual / Markdown / Preview */}
        <div className="flex items-center gap-1 rounded-lg bg-zinc-900/80 p-0.5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "visual"
                ? "bg-primary text-black shadow-sm font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            <span>Visual (WYSIWYG)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("markdown")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "markdown"
                ? "bg-primary text-black shadow-sm font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Markdown Source</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-primary text-black shadow-sm font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            {wordCount} words · {characterCount.toLocaleString()} chars
          </span>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Visual Editor Toolbar (only shown in Visual mode) */}
      {activeTab === "visual" && editor && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-white/[0.06] bg-zinc-900/40 p-1.5 text-zinc-300">
          {/* History */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-white/[0.1] mx-1" />

          {/* Heading Levels */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-primary text-black font-extrabold"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Heading 1 (#)"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-black font-extrabold"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Heading 2 (##)"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-black font-extrabold"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Heading 3 (###)"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-white/[0.1] mx-1" />

          {/* Basic Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bold")
                ? "bg-primary text-black font-bold"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("italic")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("underline")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("strike")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("code")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-white/[0.1] mx-1" />

          {/* Lists & Blocks */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bulletList")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Bullet List (- item)"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("orderedList")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Numbered List (1. item)"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("blockquote")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Blockquote (> quote)"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Code Block (```)"
          >
            <Code2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded hover:bg-white/[0.08] text-zinc-300 transition-colors"
            title="Horizontal Divider (---)"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-white/[0.1] mx-1" />

          {/* Links */}
          <button
            type="button"
            onClick={openLinkModal}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("link")
                ? "bg-primary text-black"
                : "hover:bg-white/[0.08] text-zinc-300"
            }`}
            title="Insert / Edit Link"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={removeLink}
              className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Remove Link"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-1.5 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 transition-colors ml-auto"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Inline Link Prompt Popover */}
      {linkInputOpen && (
        <div className="flex items-center gap-2 border-b border-white/[0.08] bg-zinc-900/90 px-3 py-2 text-xs">
          <Link2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="text-zinc-400 font-medium">Link URL:</span>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              } else if (e.key === "Escape") {
                setLinkInputOpen(false);
              }
            }}
            placeholder="https://example.com or /fleet"
            className="flex-1 rounded border border-white/[0.1] bg-black/60 px-2 py-1 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={setLink}
            className="rounded bg-primary px-2.5 py-1 text-xs font-semibold text-black hover:bg-primary/90 flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Apply
          </button>
          <button
            type="button"
            onClick={() => setLinkInputOpen(false)}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Areas */}
      <div className="flex-1 min-h-[300px] overflow-y-auto bg-black/40">
        {activeTab === "visual" && (
          <div className="cursor-text">
            <EditorContent editor={editor} />
          </div>
        )}

        {activeTab === "markdown" && (
          <div className="relative h-full">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`# Page Title\n\nWrite your content in Markdown or HTML.\n\n## Section Heading\n\n- Bullet item 1\n- Bullet item 2\n\n**Bold**, *italic*, and [links](https://example.com)`}
              rows={isFullscreen ? 28 : 14}
              className="w-full h-full min-h-[300px] bg-transparent p-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none resize-y leading-relaxed border-none"
            />
            {/* Markdown helper bar */}
            <div className="border-t border-white/[0.05] bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-500 flex flex-wrap items-center gap-3">
              <span>Markdown Shortcuts:</span>
              <code className="text-zinc-400 font-mono"># Heading 1</code>
              <code className="text-zinc-400 font-mono">## Heading 2</code>
              <code className="text-zinc-400 font-mono">**bold**</code>
              <code className="text-zinc-400 font-mono">*italic*</code>
              <code className="text-zinc-400 font-mono">[Link](url)</code>
              <code className="text-zinc-400 font-mono">- Bullet</code>
              <code className="text-zinc-400 font-mono">&gt; Quote</code>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 mb-6 text-xs text-amber-300/80 flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>Live Storefront Preview — This is how your page will look to customers.</span>
            </div>
            <article className="prose prose-invert prose-sm sm:prose-base max-w-none">
              <div
                className="text-zinc-300 leading-relaxed space-y-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mt-4 [&_h3]:mb-1 [&_strong]:text-white [&_li]:ml-4 [&_li]:list-disc [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_hr]:border-white/[0.08] [&_hr]:my-6 [&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-amber-300"
                dangerouslySetInnerHTML={{ __html: `<p>${renderPreviewHtml(value)}</p>` }}
              />
            </article>
          </div>
        )}
      </div>

      {/* Editor Footer / Info Bar */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-zinc-400">
            {activeTab === "visual"
              ? "WYSIWYG Visual Mode"
              : activeTab === "markdown"
              ? "Markdown Editor"
              : "Storefront Preview"}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{characterCount.toLocaleString()} chars</span>
        </div>
      </div>
    </div>
  );
}

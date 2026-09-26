"use client";

import React from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      richColors
      closeButton
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-950 group-[.toaster]:text-zinc-100 group-[.toaster]:border-white/[0.12] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:text-xs group-[.toaster]:border backdrop-blur-xl",
          description: "group-[.toast]:text-zinc-400 group-[.toast]:text-xs mt-1",
          actionButton:
            "group-[.toast]:bg-[#D4AF37] group-[.toast]:text-black group-[.toast]:font-semibold group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-lg",
          closeButton:
            "group-[.toast]:bg-zinc-900 group-[.toast]:text-zinc-400 group-[.toast]:border-white/[0.1] hover:group-[.toast]:text-white hover:group-[.toast]:bg-zinc-800",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-zinc-950/95 group-[.toaster]:text-emerald-300",
          error:
            "group-[.toaster]:border-rose-500/30 group-[.toaster]:bg-zinc-950/95 group-[.toaster]:text-rose-300",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-zinc-950/95 group-[.toaster]:text-amber-300",
          info:
            "group-[.toaster]:border-sky-500/30 group-[.toaster]:bg-zinc-950/95 group-[.toaster]:text-sky-300",
        },
      }}
      {...props}
    />
  );
}

export { toast };

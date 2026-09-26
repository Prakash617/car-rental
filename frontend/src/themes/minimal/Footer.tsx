"use client";

import React from "react";
import { FooterProps } from "@/lib/themes/types";

export function MinimalFooter({ branding }: FooterProps) {
  return (
    <footer className="bg-black text-zinc-500 py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 font-mono">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-900 text-xs">
        <div className="space-y-2">
          <div className="text-white font-medium text-sm tracking-wider uppercase">{branding.name}</div>
          <p className="text-zinc-500 font-light">Minimalist automotive hire platform.</p>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 block uppercase tracking-widest text-[10px]">Depots</span>
          <div>Central / Airport / North</div>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 block uppercase tracking-widest text-[10px]">Contact</span>
          <div>
            <a href={`mailto:${branding.support_email}`} className="text-zinc-400 hover:text-white transition-colors">
              {branding.support_email}
            </a>
          </div>
          <div>{branding.support_phone}</div>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 block uppercase tracking-widest text-[10px]">Legal</span>
          <div>Terms / Privacy / Policy</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 gap-2">
        <div>© {new Date().getFullYear()} {branding.name}</div>
        <div>All rights reserved.</div>
      </div>
    </footer>
  );
}

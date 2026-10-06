"use client";

import React from "react";
import { FooterProps } from "@/lib/themes/types";
import { PageLinks } from "@/components/storefront/PageLinks";
import { Award, Mail, Phone, MapPin } from "lucide-react";

export function ClassicFooter({ branding }: FooterProps) {
  return (
    <footer className="bg-[#0e0c0a] text-[#8f8475] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#2e261e]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2e261e]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#8B5A2B] flex items-center justify-center text-stone-100 font-serif">
              <Award className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-lg text-[#f5f1eb] tracking-wide uppercase">{branding.name}</span>
          </div>
          <p className="text-xs text-[#8f8475] leading-relaxed font-light">
            Premier vintage and heritage automobile collection. White-glove delivery to private estates, film sets, and special galas.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-[#c9955e] font-serif">The Collection</h4>
          <ul className="space-y-2 text-xs text-[#8f8475] font-serif">
            <li><a href="#fleet" className="hover:text-[#f5f1eb] transition-colors">Post-War Grand Tourers</a></li>
            <li><a href="#fleet" className="hover:text-[#f5f1eb] transition-colors">British Classic Roadsters</a></li>
            <li><a href="#fleet" className="hover:text-[#f5f1eb] transition-colors">Executive Saloons</a></li>
            <li><a href="#fleet" className="hover:text-[#f5f1eb] transition-colors">Historic Thoroughbreds</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-[#c9955e] font-serif">Services</h4>
          <ul className="space-y-2 text-xs text-[#8f8475] font-serif">
            <li><span className="hover:text-[#f5f1eb] cursor-pointer">Bespoke Wedding Hire</span></li>
            <li><span className="hover:text-[#f5f1eb] cursor-pointer">Film & Period Production</span></li>
            <li><span className="hover:text-[#f5f1eb] cursor-pointer">Private Tour Itineraries</span></li>
            <li><span className="hover:text-[#f5f1eb] cursor-pointer">Enclosed Trailer Delivery</span></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-[#c9955e] font-serif">Bespoke Inquiry</h4>
          <div className="space-y-2 text-xs text-[#8f8475]">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#c9955e]" />
              <a href={`mailto:${branding.support_email}`} className="hover:text-[#f5f1eb] transition-colors">
                {branding.support_email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#c9955e]" />
              <a href={`tel:${branding.support_phone}`} className="hover:text-[#f5f1eb] transition-colors">
                {branding.support_phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#c9955e]" />
              <span className="font-serif">Private Mews & Country Garages</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6e6456] font-serif gap-4">
        <div>© {new Date().getFullYear()} {branding.name}. Handcrafted with reverence.</div>
        <div className="flex gap-6">
          <span className="hover:text-[#a89f91] cursor-pointer">Classic Hire Charter</span>
          <span className="hover:text-[#a89f91] cursor-pointer">Vehicle Preservation Rules</span>
          <span className="hover:text-[#a89f91] cursor-pointer">Security Protocol</span>
          <PageLinks variant="footer" className="hover:text-[#a89f91] transition-colors" />
        </div>
      </div>
    </footer>
  );
}

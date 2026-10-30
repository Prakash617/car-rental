"use client";

import React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { TenantBranding } from "@/types";

interface FloatingContactWidgetProps {
  branding: TenantBranding;
}

export function FloatingContactWidget({ branding }: FloatingContactWidgetProps) {
  if (branding.show_floating_contact === false) {
    return null;
  }

  const rawPhone = branding.whatsapp_number || branding.support_phone || "+9779800000000";
  const cleanPhoneDigits = rawPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhoneDigits || "9779800000000"}`;
  const phoneCallUrl = `tel:${branding.support_phone || "+9779800000000"}`;
  let messengerUrl = branding.messenger_url || "https://m.me/sajilorentals";
  if (messengerUrl && !messengerUrl.startsWith("http://") && !messengerUrl.startsWith("https://")) {
    messengerUrl = `https://m.me/${messengerUrl.replace(/^@/, "")}`;
  }

  return (
    <aside
      aria-label="Direct Concierge Contacts"
      className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-3 select-none print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* 1. WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Concierge"
        className="group relative w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg hover:shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <svg
          className="w-6 h-6 fill-current transition-transform duration-200 group-hover:rotate-6"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-slate-900/90 dark:bg-black/90 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          WhatsApp Support
        </span>
      </a>

      {/* 2. Direct Phone Call Button */}
      <a
        href={phoneCallUrl}
        aria-label="Call Hotline"
        className="group relative w-12 h-12 rounded-full bg-[#e11d2e] hover:bg-[#c91827] text-white shadow-lg hover:shadow-xl shadow-red-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <Phone className="w-5 h-5 fill-current transition-transform duration-200 group-hover:rotate-12" />
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-slate-900/90 dark:bg-black/90 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          Call Hotline
        </span>
      </a>

      {/* 3. Messenger / Direct Chat Button */}
      <a
        href={messengerUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct Messenger Chat"
        className="group relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#00b2fe] to-[#006aff] hover:from-[#009ee0] hover:to-[#0058d6] text-white shadow-lg hover:shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 fill-current transition-transform duration-200 group-hover:scale-110" />
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-slate-900/90 dark:bg-black/90 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          Messenger Chat
        </span>
      </a>
    </aside>
  );
}

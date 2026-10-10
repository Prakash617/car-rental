import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex Luxury Concierge | Multi-Tenant Car Rental SaaS",
  description: "Enterprise multi-tenant automotive hire platform with dynamic theme engine and real-time fleet availability.",
};

import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased selection:bg-[#D4AF37]/30 selection:text-white`}
      >
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}

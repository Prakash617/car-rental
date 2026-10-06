"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TenantBranding } from "@/types";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronDown,
  User,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Car,
  Home,
  Search,
  Users,
  PlusCircle,
  Info,
  Newspaper,
  Calendar,
  HelpCircle,
  Key
} from "lucide-react";

interface NavbarProps {
  branding: TenantBranding;
}

export function Navbar({ branding }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const brandName = branding?.name || "Apex Rentals";
  const brandParts = brandName.split(" ");
  const brandFirst = brandParts[0] || "Apex";
  const brandRest = brandParts.slice(1).join(" ") || "Rentals";

  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedOut = localStorage.getItem("apex_user_logged_out") === "true";
      setIsLoggedIn(!isLoggedOut);
    }
  }, []);

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("apex_saas_auth_session");
      localStorage.setItem("apex_user_logged_out", "true");
      document.cookie = "tenant_ctx=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "apex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.href = "/";
    }
  };

  const handleSignIn = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("apex_user_logged_out");
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when sidebar drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Vehicles", href: "/search" },
    { label: "Carpool", href: "/search?trip_type=tour" },
    { label: "Become a host", href: "/list-your-car" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  // Drawer Section 1: Red Accent Icons
  const drawerSectionOne = [
    { label: "Home", href: "/", icon: Home },
    { label: "Browse Vehicles", href: "/search", icon: Search },
    { label: "Carpool", href: "/search?trip_type=tour", icon: Users },
    { label: "Become a host", href: "/list-your-car", icon: PlusCircle },
    { label: "About", href: "/about", icon: Info },
    { label: "Blog", href: "/blog", icon: Newspaper },
    { label: "Contact", href: "/contact", icon: Phone },
  ];

  // Drawer Section 2: Dark Slate Icons
  const drawerSectionTwo = [
    { label: "Profile", href: "/client", icon: User },
    { label: "My Bookings", href: "/client", icon: Calendar },
    { label: "Carpool", href: "/search?trip_type=tour", icon: Users },
    { label: "My Inquiries", href: "/contact", icon: HelpCircle },
    { label: "My Vehicles", href: "/list-your-car", icon: Car },
    { label: "Change Password", href: "/client", icon: Key },
    { label: "Sign Out", href: "/", icon: LogOut },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs">
      {/* 1. Dark Top Bar */}
      <div className="bg-[#0b1329] text-slate-200 text-xs py-2 px-4 sm:px-6 lg:px-12 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Contact Info */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-normal text-slate-200">
            <a
              href={`tel:${branding?.support_phone || "+1 (800) 555-APEX"}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#e11d2e] fill-[#e11d2e]" />
              <span>{branding?.support_phone || "+1 (800) 555-APEX"}</span>
            </a>

            <span className="text-slate-600 hidden sm:inline">|</span>

            <a
              href={`mailto:${branding?.support_email || "concierge@apex-fleet.com"}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#e11d2e]" />
              <span>{branding?.support_email || "concierge@apex-fleet.com"}</span>
            </a>

            <span className="text-slate-600 hidden md:inline">|</span>

            <div className="hidden md:flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#e11d2e] fill-[#e11d2e]" />
              <span>Apex Hub, Kathmandu</span>
            </div>
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex items-center gap-3.5 sm:gap-4 text-slate-300">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.76-.23 1.03-.02 2.17.6 3.01.61.88 1.67 1.43 2.73 1.43.98.05 1.99-.37 2.64-1.1.59-.64.88-1.51.87-2.38V.02h-.47z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/9779741816117"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>

            {/* Viber */}
            <a
              href="viber://chat?number=%2B9779741816117"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Viber"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M11.968 0C5.358 0 0 5.176 0 11.56c0 2.768.995 5.312 2.678 7.323L1.08 23.493a.75.75 0 0 0 .973.918l4.896-1.782c1.554.686 3.248 1.06 5.019 1.06 6.61 0 11.968-5.176 11.968-11.56S18.578 0 11.968 0zm6.183 15.54c-.267.75-1.343 1.455-2.096 1.583-.51.087-1.176.126-3.824-.954-3.385-1.381-5.547-4.808-5.717-5.032-.164-.225-1.371-1.825-1.371-3.481 0-1.656.868-2.47 1.179-2.808.311-.338.68-.423.906-.423.226 0 .452.002.651.012.21.01.49-.08.767.585.284.683.968 2.355 1.053 2.528.085.173.142.375.029.6-.114.225-.171.365-.34.564-.17.199-.356.444-.509.596-.17.17-.348.354-.15.694.198.34 8.79 1.442 1.884 2.327 1.282 1.14 2.364 1.493 2.704 1.663.34.17.538.142.736-.085.198-.227.85-9.87 1.077-1.17.227-.3.454-.25.766-.134.312.116 1.983.935 2.323 1.105.34.17.567.255.652.396.085.142.085.823-.182 1.573z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Clean White Navigation */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Left: Vertically Stacked Sajilo Rental Logo */}
          <Link href="/" className="flex flex-col items-center group select-none">
            {/* Authentic Car with Red Curved Arc */}
            <div className="w-16 h-9 flex items-center justify-center">
              <svg viewBox="0 0 100 55" className="w-full h-full" fill="none">
                {/* Red Circular Swoosh Arc */}
                <path
                  d="M10 40 C 8 12, 54 2, 86 18"
                  stroke="#e11d2e"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                {/* Blue Vehicle Body */}
                <path
                  d="M22 38 C 24 30, 32 20, 48 18 C 66 18, 78 28, 84 37 C 86 40, 85 45, 80 45 L 26 45 C 22 45, 21 42, 22 38 Z"
                  fill="#5aa0e8"
                />
                {/* Windshield */}
                <path
                  d="M44 22 L 70 22 C 74 27, 76 31, 77 35 L 37 35 C 39 30, 41 25, 44 22 Z"
                  fill="#ffffff"
                />
                {/* Front Grill & Bumper */}
                <path
                  d="M74 38 L 84 38 C 86 38, 87 41, 85 43 L 72 43 Z"
                  fill="#2e78c9"
                />
                {/* Left Wheel */}
                <circle cx="34" cy="44" r="6.5" fill="#ffffff" stroke="#388ddd" strokeWidth="3" />
                {/* Right Wheel */}
                <circle cx="74" cy="44" r="6.5" fill="#ffffff" stroke="#388ddd" strokeWidth="3" />
              </svg>
            </div>

            {/* Brand Wordmark */}
            <div className="text-[13px] font-bold tracking-tight leading-none mt-0.5">
              <span className="text-[#388ddd]">{brandFirst}</span>{" "}
              <span className="text-[#e11d2e]">{brandRest}</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-[15px] text-slate-700">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href.split("?")[0]);

              return (
                <div key={item.label} className="relative py-2 flex flex-col items-center">
                  <Link
                    href={item.href}
                    className={`transition-colors font-normal ${
                      isActive
                        ? "text-[#e11d2e] font-semibold"
                        : "hover:text-[#e11d2e]"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {/* Red bottom indicator bar for active item */}
                  {isActive && (
                    <span className="absolute bottom-0 w-full h-[3px] bg-[#e11d2e] rounded-full" />
                  )}
                </div>
              );
            })}

            {/* Thin Vertical Divider */}
            <span className="h-6 w-px bg-slate-200 mx-1" />

            {/* User Profile Pill ("Super") OR Sign In Buttons */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-slate-300 hover:border-slate-400 transition-all bg-white shadow-2xs group"
                >
                  {/* Avatar with image graphic */}
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <Image
                      src="/avatar-superbang.png"
                      alt="Super Bang"
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="text-sm font-semibold text-slate-800 group-hover:text-black">
                    Super
                  </span>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-2xl py-3 z-50 text-[13.5px] text-slate-800 space-y-0.5">
                    <div className="px-5 py-2">
                      <span className="font-bold text-slate-900 text-sm block">Super Bang</span>
                      <span className="text-xs text-slate-500 font-normal block mt-0.5">
                        superbang617@gmail.com
                      </span>
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    <Link
                      href="/client"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-2 hover:bg-slate-50 text-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#e11d2e] shrink-0" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/client?tab=bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-2 hover:bg-slate-50 text-slate-800 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-[#e11d2e] shrink-0" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      href="/search?trip_type=tour"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-2 hover:bg-slate-50 text-slate-800 transition-colors"
                    >
                      <Users className="w-4 h-4 text-[#e11d2e] shrink-0" />
                      <span>Carpool</span>
                    </Link>

                    <Link
                      href="/client?tab=inquiries"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-2 hover:bg-slate-50 text-slate-800 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#e11d2e] shrink-0" />
                      <span>My Inquiries</span>
                    </Link>

                    <Link
                      href="/client?tab=vehicles"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-2 hover:bg-slate-50 text-slate-800 transition-colors"
                    >
                      <Car className="w-4 h-4 text-[#e11d2e] shrink-0" />
                      <span>My Vehicles</span>
                    </Link>

                    <Link
                      href="/client?tab=password"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-2 hover:bg-slate-50 text-slate-800 transition-colors"
                    >
                      <Key className="w-4 h-4 text-[#e11d2e] shrink-0" />
                      <span>Change Password</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3.5 px-5 py-2 hover:bg-red-50 text-[#e11d2e] font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#e11d2e] shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/client"
                  onClick={handleSignIn}
                  className="px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/search"
                  className="px-4 py-1.5 rounded-full bg-[#e11d2e] hover:bg-[#b01524] text-xs font-bold text-white transition-colors shadow-2xs"
                >
                  Book Now
                </Link>
              </div>
            )}

            {/* Desktop Hamburger / Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
              aria-label="Open Sidebar"
              title="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* 3. Slide-Out Sidebar Drawer (Matching User Screenshot) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sliding Panel */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-[300px] sm:w-[330px] bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Navigation sidebar"
        >
          {/* Drawer Header: Logo + Close Button */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0 bg-white">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center group select-none"
            >
              <div className="w-14 h-8 flex items-center justify-center">
                <svg viewBox="0 0 100 55" className="w-full h-full" fill="none">
                  <path
                    d="M10 40 C 8 12, 54 2, 86 18"
                    stroke="#e11d2e"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 38 C 24 30, 32 20, 48 18 C 66 18, 78 28, 84 37 C 86 40, 85 45, 80 45 L 26 45 C 22 45, 21 42, 22 38 Z"
                    fill="#5aa0e8"
                  />
                  <path
                    d="M44 22 L 70 22 C 74 27, 76 31, 77 35 L 37 35 C 39 30, 41 25, 44 22 Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M74 38 L 84 38 C 86 38, 87 41, 85 43 L 72 43 Z"
                    fill="#2e78c9"
                  />
                  <circle cx="34" cy="44" r="6.5" fill="#ffffff" stroke="#388ddd" strokeWidth="3" />
                  <circle cx="74" cy="44" r="6.5" fill="#ffffff" stroke="#388ddd" strokeWidth="3" />
                </svg>
              </div>
              <div className="text-[12px] font-bold tracking-tight leading-none mt-0.5">
                <span className="text-[#388ddd]">{brandFirst}</span>{" "}
                <span className="text-[#e11d2e]">{brandRest}</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
            {/* User Profile Card Banner */}
            {isLoggedIn ? (
              <div className="bg-[#fff8f9] border-b border-pink-100/70 px-5 py-4 flex items-center gap-3.5">
                <div className="relative w-13 h-13 rounded-full overflow-hidden shrink-0 ring-2 ring-pink-200/90 shadow-2xs">
                  <Image
                    src="/avatar-superbang.png"
                    alt="Super Bang"
                    width={52}
                    height={52}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 text-[15px] tracking-tight truncate leading-tight">
                    Super Bang
                  </span>
                  <span className="text-xs text-slate-500 truncate mt-1 font-normal">
                    superbang617@gmail.com
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Welcome Guest</div>
                  <div className="text-xs text-slate-500">Sign in to manage bookings</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#e11d2e] text-white text-xs font-semibold hover:bg-[#c91827] transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Section 1: Red Accent Links */}
            <div className="px-3 pt-3 pb-2 space-y-0.5">
              {drawerSectionOne.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href.split("?")[0]);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors ${
                      isActive
                        ? "bg-red-50/70 text-[#e11d2e] font-semibold"
                        : "text-slate-800 hover:bg-red-50/50 hover:text-[#e11d2e]"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[#e11d2e] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-slate-100 my-1 mx-4" />

            {/* Section 2: Dark Slate Links */}
            {isLoggedIn ? (
              <div className="px-3 pt-2 pb-8 space-y-0.5">
                {drawerSectionTwo.map((item) => {
                  const Icon = item.icon;
                  if (item.label === "Sign Out") {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium text-red-600 hover:bg-red-50/70 transition-colors text-left"
                      >
                        <Icon className="w-5 h-5 text-red-600 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium text-slate-800 hover:bg-slate-100/70 hover:text-black transition-colors"
                    >
                      <Icon className="w-5 h-5 text-slate-700 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 pt-2 pb-8">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#e11d2e] text-white font-semibold text-sm shadow-xs hover:bg-[#c91827] transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}

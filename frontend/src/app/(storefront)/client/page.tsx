"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Calendar,
  HelpCircle,
  Car,
  Key,
  Pencil,
  LogOut,
  CalendarPlus,
  Phone,
  Search,
  FileText,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  Send,
  Lock,
  MessageCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Booking } from "@/types";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";

function ClientDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "inquiries" | "vehicles" | "password"
  >("overview");

  // User Profile state
  const [profile, setProfile] = useState({
    fullName: "Super Bang",
    email: "superbang617@gmail.com",
    phone: "—",
    role: "Customer",
    joined: "October 6, 2026",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "Super Bang",
    phone: "",
    email: "superbang617@gmail.com",
  });

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [searchIdentifier, setSearchIdentifier] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Inquiries state
  const [inquiries, setInquiries] = useState<
    { id: string; subject: string; message: string; date: string; status: string }[]
  >([]);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Sync tab with query param
  useEffect(() => {
    if (tabParam === "bookings") setActiveTab("bookings");
    else if (tabParam === "inquiries") setActiveTab("inquiries");
    else if (tabParam === "vehicles") setActiveTab("vehicles");
    else if (tabParam === "password") setActiveTab("password");
    else setActiveTab("overview");
  }, [tabParam]);

  // Fetch client bookings
  const fetchBookings = async (identifier = "") => {
    setIsLoadingBookings(true);
    try {
      const query = identifier
        ? identifier.includes("@")
          ? `?email=${encodeURIComponent(identifier)}`
          : `?phone=${encodeURIComponent(identifier)}`
        : "";
      const res = await apiFetch<any>(`/api/v1/bookings/my-bookings/${query}`);
      const list = Array.isArray(res) ? res : res?.data || [];
      setBookings(list);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(searchIdentifier.trim());
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    setCancellingId(bookingId);
    try {
      await apiFetch(`/api/v1/bookings/${bookingId}/cancel/`, {
        method: "POST",
        body: JSON.stringify({ reason: "Cancelled by customer via client dashboard" }),
      });
      await fetchBookings(searchIdentifier.trim());
    } catch (err: any) {
      alert("Failed to cancel reservation: " + (err.message || "Unknown error"));
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      fullName: editForm.fullName || prev.fullName,
      email: editForm.email || prev.email,
      phone: editForm.phone || "—",
    }));
    setShowEditModal(false);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) return;
    const newInq = {
      id: Date.now().toString(),
      subject: inquirySubject,
      message: inquiryMessage,
      date: new Date().toLocaleDateString(),
      status: "Submitted",
    };
    setInquiries([newInq, ...inquiries]);
    setInquirySubject("");
    setInquiryMessage("");
    setInquirySuccess(true);
    setTimeout(() => setInquirySuccess(false), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill out all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    setPasswordSuccess(true);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      router.push("/");
    }
  };

  const menuItems = [
    { id: "overview", label: "Profile Overview", icon: User },
    { id: "bookings", label: "My Bookings", icon: Calendar },
    { id: "inquiries", label: "My Inquiries", icon: HelpCircle },
    { id: "vehicles", label: "My Vehicles", icon: Car },
    { id: "password", label: "Change Password", icon: Key },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR (Col 4)                                       */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 space-y-5">
            {/* 1. Profile Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col items-center text-center shadow-xs">
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-pink-100/90 shadow-2xs mb-4">
                <Image
                  src="/avatar-superbang.png"
                  alt="Super Bang"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {profile.fullName}
              </h2>
              <span className="text-xs text-slate-500 font-normal mt-1 mb-5">
                {profile.email}
              </span>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 max-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 transition-colors bg-white shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-700" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 max-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-semibold text-[#e11d2e] transition-colors bg-white shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#e11d2e]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* 2. Navigation Menu Card */}
            <nav className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      router.replace(`/client?tab=${item.id}`, { scroll: false });
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors text-left ${
                      isActive
                        ? "bg-[#fff1f2] text-[#e11d2e] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-black"
                    }`}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 shrink-0 ${
                        isActive ? "text-[#e11d2e]" : "text-slate-700"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT MAIN CONTENT (Col 8)                                 */}
          {/* ========================================================= */}
          <main className="lg:col-span-8 space-y-6">
            {/* ------------------------------------------------------- */}
            {/* TAB: PROFILE OVERVIEW                                   */}
            {/* ------------------------------------------------------- */}
            {activeTab === "overview" && (
              <>
                {/* Profile details Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
                    Profile details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 pt-5">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        FULL NAME
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {profile.fullName}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        EMAIL
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {profile.email}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        PHONE
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {profile.phone}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        ROLE
                      </span>
                      <span className="inline-block bg-[#e0f2fe] text-[#0369a1] text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
                        {profile.role}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        JOINED
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {profile.joined}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent bookings Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-[#e11d2e]" />
                      <h2 className="text-base font-bold text-slate-900">
                        Recent bookings
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("bookings");
                        router.replace("/client?tab=bookings", { scroll: false });
                      }}
                      className="text-xs font-bold text-[#e11d2e] hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  {isLoadingBookings ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {bookings.slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-mono font-bold text-xs text-slate-900">
                              #{b.booking_reference}
                            </span>
                            <p className="text-sm font-semibold text-slate-800">
                              {b.vehicle?.brand} {b.vehicle?.model}
                            </p>
                            <span className="text-xs text-slate-500">
                              {new Date(b.pickup_datetime).toLocaleDateString()} &bull; Rs.{" "}
                              {Number(b.total_price || 0).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {b.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(b)}
                              className="px-2.5 py-1 text-xs font-bold text-[#388ddd] hover:underline"
                            >
                              Invoice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-2 border border-slate-200/60">
                        <CalendarPlus className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-500 font-normal">
                        No bookings yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent inquiries Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5 text-[#e11d2e]" />
                      <h2 className="text-base font-bold text-slate-900">
                        Recent inquiries
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("inquiries");
                        router.replace("/client?tab=inquiries", { scroll: false });
                      }}
                      className="text-xs font-bold text-[#e11d2e] hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  {inquiries.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {inquiries.slice(0, 3).map((inq) => (
                        <div key={inq.id} className="py-3">
                          <span className="font-bold text-xs text-slate-900 block">
                            {inq.subject}
                          </span>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                            {inq.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {inq.date} &bull; {inq.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-2 border border-slate-200/60">
                        <HelpCircle className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-500 font-normal">
                        No inquiries yet.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB: MY BOOKINGS                                        */}
            {/* ------------------------------------------------------- */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        My Bookings
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track upcoming journeys, review completed trips, and access VAT invoices.
                      </p>
                    </div>

                    {/* Filter / Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchIdentifier}
                          onChange={(e) => setSearchIdentifier(e.target.value)}
                          placeholder="Phone / Email..."
                          className="h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] w-44 sm:w-56"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 h-9 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl"
                      >
                        Search
                      </button>
                    </form>
                  </div>

                  {/* Bookings List */}
                  {isLoadingBookings ? (
                    <div className="py-16 flex justify-center">
                      <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="divide-y divide-slate-100 pt-2 space-y-4">
                      {bookings.map((booking) => {
                        const vehicle = booking.vehicle;
                        const firstImage = vehicle?.images?.[0];
                        const rawImage =
                          typeof firstImage === "string"
                            ? firstImage
                            : firstImage?.url || DEFAULT_VEHICLE_IMAGE;
                        const primaryImage = getSafeImageUrl(rawImage, DEFAULT_VEHICLE_IMAGE);

                        const statusColor =
                          booking.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : booking.status === "active"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : booking.status === "completed"
                            ? "bg-slate-100 text-slate-800 border-slate-300"
                            : booking.status === "cancelled"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : "bg-amber-50 text-amber-800 border-amber-200";

                        const isCancellable =
                          booking.status === "pending" || booking.status === "confirmed";
                        const totalFare = Number(booking.total_price) || 0;

                        return (
                          <div
                            key={booking.id}
                            className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-4">
                              <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                <Image
                                  src={primaryImage}
                                  alt={vehicle?.model || "Vehicle"}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-slate-900">
                                    #{booking.booking_reference}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}
                                  >
                                    {booking.status}
                                  </span>
                                </div>

                                <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                                  {vehicle?.brand} {vehicle?.model}
                                </h3>

                                <p className="text-xs text-slate-500 mt-0.5">
                                  {booking.pickup_location || "Kathmandu"} &rarr;{" "}
                                  {booking.destination_location || "Dropoff point"}
                                </p>

                                <span className="text-[11px] text-slate-400 mt-1 block">
                                  {new Date(booking.pickup_datetime).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                              <div className="text-left sm:text-right">
                                <span className="text-[11px] text-slate-400 block">Total Amount</span>
                                <strong className="text-base font-extrabold text-[#e11d2e]">
                                  Rs. {totalFare.toLocaleString()}
                                </strong>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedInvoice(booking)}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#388ddd] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Tax Invoice</span>
                                </button>

                                {isCancellable && (
                                  <button
                                    type="button"
                                    disabled={cancellingId === booking.id}
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                  >
                                    {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                        <CalendarPlus className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">
                        No Bookings Found
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                        You have not placed any bookings yet. Search our available vehicles to book your journey with an executive chauffeur.
                      </p>
                      <Link
                        href="/search"
                        className="px-5 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                      >
                        Browse Available Vehicles
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB: MY INQUIRIES                                       */}
            {/* ------------------------------------------------------- */}
            {activeTab === "inquiries" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 pb-2">
                    Send Support Inquiry
                  </h2>
                  <p className="text-xs text-slate-500 pb-5 border-b border-slate-100">
                    Have questions about luxury wedding packages, tour routes, or corporate leases? Reach out to our 24/7 Kathmandu operations desk.
                  </p>

                  {inquirySuccess && (
                    <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Inquiry submitted successfully! Our dispatch team will respond promptly.</span>
                    </div>
                  )}

                  <form onSubmit={handleSendInquiry} className="mt-5 space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Subject / Topic
                      </label>
                      <input
                        type="text"
                        value={inquirySubject}
                        onChange={(e) => setInquirySubject(e.target.value)}
                        placeholder="e.g. Special Chauffeur Route Inquiry / Wedding Package"
                        required
                        className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Message Details
                      </label>
                      <textarea
                        rows={4}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Describe your inquiry, dates, vehicle requirements, or custom route..."
                        required
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </button>
                  </form>
                </div>

                {/* Submitted Inquiries List */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                    My Inquiry History
                  </h3>

                  {inquiries.length > 0 ? (
                    <div className="divide-y divide-slate-100 pt-2 space-y-3">
                      {inquiries.map((inq) => (
                        <div key={inq.id} className="pt-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">
                              {inq.subject}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {inq.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Date: {inq.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-500">
                        No previous inquiries recorded.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB: MY VEHICLES (HOST VEHICLE)                         */}
            {/* ------------------------------------------------------- */}
            {activeTab === "vehicles" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      My Hosted Vehicles
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Monetize your vehicle with Apex Rentals&apos; verified host network.
                    </p>
                  </div>

                  <Link
                    href="/list-your-car"
                    className="px-4 py-2 bg-[#e11d2e] hover:bg-[#b01524] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Host a Vehicle</span>
                  </Link>
                </div>

                <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e11d2e] flex items-center justify-center mb-3">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Earn Passive Revenue as a Fleet Host
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                    List your Scorpio, EV, HiAce, or luxury sedan. Apex Rentals provides vetted professional chauffeurs, insurance handling, and guaranteed weekly payouts.
                  </p>
                  <Link
                    href="/list-your-car"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Register Your Vehicle Now →
                  </Link>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB: CHANGE PASSWORD                                    */}
            {/* ------------------------------------------------------- */}
            {activeTab === "password" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 pb-2">
                  Change Password
                </h2>
                <p className="text-xs text-slate-500 pb-5 border-b border-slate-100">
                  Ensure your account is using a secure and unique password.
                </p>

                {passwordSuccess && (
                  <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Password updated successfully!</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4 text-xs max-w-md">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================= */}
      {/* FLOATING ACTION SUPPORT BUTTONS (Exact Match to Screenshot)  */}
      {/* ============================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* WhatsApp Button (Green) */}
        <a
          href="https://wa.me/9779741816117"
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 rounded-full bg-[#25d366] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>

        {/* Phone Call Button (Red) */}
        <a
          href="tel:+18005552739"
          className="w-12 h-12 rounded-full bg-[#e11d2e] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Call Apex Rentals"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>

        {/* Messenger Button (Blue/Purple Gradient) */}
        <a
          href="https://m.me/apexrentals"
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00b2fe] to-[#006aff] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Facebook Messenger"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </a>
      </div>

      {/* ============================================================= */}
      {/* EDIT PROFILE MODAL                                            */}
      {/* ============================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Profile Details</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+977 98..."
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e11d2e] hover:bg-[#b01524] text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* OFFICIAL TAX INVOICE MODAL                                    */}
      {/* ============================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e11d2e] flex items-center justify-center text-white font-bold">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Apex Luxury Concierge
                  </h3>
                  <span className="text-[10px] text-slate-400 block">
                    Apex Hub, Kathmandu &bull; PAN/VAT Reg: 609823412
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Invoice To:</span>
                <strong className="text-slate-900 block mt-0.5">
                  {selectedInvoice.customer_name || selectedInvoice.customer?.first_name || profile.fullName}
                </strong>
                <span className="text-slate-500 block">
                  {selectedInvoice.customer_phone || selectedInvoice.customer?.phone || profile.phone}
                </span>
                <span className="text-slate-500 block">
                  {selectedInvoice.customer_email || selectedInvoice.customer?.email || profile.email}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Invoice Reference:</span>
                <strong className="font-mono text-sm text-slate-900 block mt-0.5">
                  #{selectedInvoice.booking_reference}
                </strong>
                <span className="text-slate-500 block">
                  Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  Status: {selectedInvoice.status}
                </span>
              </div>
            </div>

            {/* Route & Vehicle details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Reserved Vehicle:</span>
                <strong className="text-slate-900">
                  {selectedInvoice.vehicle?.brand} {selectedInvoice.vehicle?.model} (
                  {selectedInvoice.vehicle?.license_plate || "Verified Fleet"})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Route:</span>
                <strong className="text-slate-900">
                  {selectedInvoice.pickup_location || "Kathmandu"} &rarr;{" "}
                  {selectedInvoice.destination_location || "Dropoff point"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Journey Dates:</span>
                <span className="text-slate-800">
                  {new Date(selectedInvoice.pickup_datetime).toLocaleString()} &bull;{" "}
                  {new Date(selectedInvoice.return_datetime).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {(() => {
                  const numTotal = Number(selectedInvoice.total_price) || 0;
                  const numBase = selectedInvoice.base_price ? Number(selectedInvoice.base_price) : Math.round(numTotal * 0.85);
                  const numTax = selectedInvoice.tax_amount ? Number(selectedInvoice.tax_amount) : Math.round(numTotal * 0.13);
                  const numAdvance = selectedInvoice.advance_amount ? Number(selectedInvoice.advance_amount) : Math.round(numTotal * 0.10);

                  return (
                    <>
                      <tr>
                        <td className="py-2.5">
                          Vehicle Rental &amp; Professional Chauffeur Dispatch
                        </td>
                        <td className="py-2.5 text-right font-medium">
                          Rs. {numBase.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-500">Govt 13% Nepal VAT</td>
                        <td className="py-2.5 text-right text-slate-500">
                          Rs. {numTax.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="font-extrabold text-sm border-t border-slate-300">
                        <td className="py-3">Grand Total Payable</td>
                        <td className="py-3 text-right text-[#e11d2e]">
                          Rs. {numTotal.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="text-emerald-700 font-bold">
                        <td className="py-2">10% Advance Deposit Required</td>
                        <td className="py-2 text-right">
                          Rs. {numAdvance.toLocaleString()}
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Helpline: +1 (800) 555-APEX &bull; concierge@apex-fleet.com
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClientDashboardContent />
    </Suspense>
  );
}

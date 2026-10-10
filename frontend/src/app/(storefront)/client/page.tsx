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
  MessageCircle,
  ArrowRight,
  Shield,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Booking } from "@/types";
import { getSafeImageUrl, DEFAULT_VEHICLE_IMAGE } from "@/lib/utils";
import { triggerGoogleOAuth, authenticateWithGoogleToken } from "@/lib/googleAuth";

function ClientDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const authModeParam = searchParams.get("auth");

  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "kyc" | "inquiries" | "vehicles" | "password"
  >("overview");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Google modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("pawan.google@example.com");
  const [googleNameInput, setGoogleNameInput] = useState("Pawan Adhikari");
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Signin form state
  const [signinForm, setSigninForm] = useState({
    identifier: "",
    password: "",
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    driverLicense: "",
  });

  // User Profile state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Verified Renter",
    joined: "",
    customerId: "",
    driverLicense: "",
    kycStatus: "unverified",
    idCardNumber: "",
    driverLicenseImage: "",
    citizenshipImage: "",
    kycNotes: "",
  });

  // KYC Submission Form state
  const [kycForm, setKycForm] = useState({
    idCardNumber: "",
    driverLicenseNumber: "",
    driverLicenseImage: "",
    citizenshipImage: "",
  });
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycSuccessMessage, setKycSuccessMessage] = useState("");
  const [kycErrorMessage, setKycErrorMessage] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    driverLicense: "",
  });

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
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
    else if (tabParam === "kyc") setActiveTab("kyc");
    else if (tabParam === "inquiries") setActiveTab("inquiries");
    else if (tabParam === "vehicles") setActiveTab("vehicles");
    else if (tabParam === "password") setActiveTab("password");
    else setActiveTab("overview");

    if (authModeParam === "signup") {
      setAuthMode("signup");
    }
  }, [tabParam, authModeParam]);

  // Load existing session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const authSessionParam = urlParams.get("auth_session");
        if (authSessionParam) {
          try {
            const raw = decodeURIComponent(atob(authSessionParam));
            const incomingCustomer = JSON.parse(raw);
            if (incomingCustomer?.id) {
              localStorage.setItem("apex_customer_auth", JSON.stringify(incomingCustomer));
              localStorage.removeItem("apex_user_logged_out");
              window.dispatchEvent(new Event("apex_customer_auth_changed"));

              urlParams.delete("auth_session");
              const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : "";
              window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
            }
          } catch (e) {
            console.error("Failed to parse auth_session parameter:", e);
          }
        }

        const stored = localStorage.getItem("apex_customer_auth");
        if (stored) {
          const customer = JSON.parse(stored);
          const fullName =
            customer.full_name ||
            `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
            "Client Member";
          const email = customer.email || "";
          const phone = customer.phone || "—";
          const joined = customer.created_at
            ? new Date(customer.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Recent";

          setProfile({
            fullName,
            email,
            phone,
            role: "Verified Renter",
            joined,
            customerId: customer.id || "",
            driverLicense: customer.driver_license_number || "CHAUFFEUR-BOOKING",
            kycStatus: customer.kyc_status || (customer.is_verified ? "verified" : "unverified"),
            idCardNumber: customer.id_card_number || "",
            driverLicenseImage: customer.driver_license_image || "",
            citizenshipImage: customer.citizenship_image || "",
            kycNotes: customer.kyc_notes || "",
          });
          setEditForm({
            fullName,
            phone: phone !== "—" ? phone : "",
            driverLicense: customer.driver_license_number || "",
          });
          setKycForm({
            idCardNumber: customer.id_card_number || "",
            driverLicenseNumber: customer.driver_license_number || "",
            driverLicenseImage: customer.driver_license_image || "",
            citizenshipImage: customer.citizenship_image || "",
          });
          setIsAuthenticated(true);
          fetchBookings(email || phone);
        }
      } catch (e) {
        console.error("Failed to parse stored customer session:", e);
      }
    }
  }, []);

  // Fetch client bookings
  const fetchBookings = async (identifier = "") => {
    setIsLoadingBookings(true);
    try {
      const query = identifier
        ? identifier.includes("@")
          ? `?email=${encodeURIComponent(identifier)}`
          : `?phone=${encodeURIComponent(identifier)}`
        : profile.email
        ? `?email=${encodeURIComponent(profile.email)}`
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

  const applyCustomerToState = (customer: any) => {
    const fullName =
      customer.full_name ||
      `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
      "Client Member";
    const email = customer.email || "";
    const phone = customer.phone || "—";
    const joined = customer.created_at
      ? new Date(customer.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Recent";

    setProfile({
      fullName,
      email,
      phone,
      role: "Verified Renter",
      joined,
      customerId: customer.id || "",
      driverLicense: customer.driver_license_number || "CHAUFFEUR-BOOKING",
      kycStatus: customer.kyc_status || (customer.is_verified ? "verified" : "unverified"),
      idCardNumber: customer.id_card_number || "",
      driverLicenseImage: customer.driver_license_image || "",
      citizenshipImage: customer.citizenship_image || "",
      kycNotes: customer.kyc_notes || "",
    });
    setEditForm({
      fullName,
      phone: phone !== "—" ? phone : "",
      driverLicense: customer.driver_license_number || "",
    });
    setKycForm({
      idCardNumber: customer.id_card_number || "",
      driverLicenseNumber: customer.driver_license_number || "",
      driverLicenseImage: customer.driver_license_image || "",
      citizenshipImage: customer.citizenship_image || "",
    });

    setIsAuthenticated(true);
    setIsGuestMode(false);
    setShowGoogleModal(false);
    setAuthSuccess(`Welcome to Apex Rentals, ${customer.first_name || fullName}!`);
    fetchBookings(email || phone);
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.customerId) {
      setKycErrorMessage("Please sign in to submit verification documents.");
      return;
    }
    setIsSubmittingKyc(true);
    setKycErrorMessage("");
    setKycSuccessMessage("");

    try {
      const res = await apiFetch<any>("/api/v1/customers/kyc/upload/", {
        method: "POST",
        body: JSON.stringify({
          customer_id: profile.customerId,
          id_card_number: kycForm.idCardNumber.trim(),
          driver_license_number: kycForm.driverLicenseNumber.trim(),
          driver_license_image: kycForm.driverLicenseImage.trim(),
          citizenship_image: kycForm.citizenshipImage.trim(),
        }),
      });

      const updatedCustomer = res?.data?.customer || res?.customer;
      if (updatedCustomer) {
        setProfile((prev) => ({
          ...prev,
          kycStatus: "pending",
          idCardNumber: updatedCustomer.id_card_number || kycForm.idCardNumber,
          driverLicense: updatedCustomer.driver_license_number || kycForm.driverLicenseNumber,
        }));
        try {
          const stored = localStorage.getItem("apex_customer_auth");
          if (stored) {
            const parsed = JSON.parse(stored);
            Object.assign(parsed, updatedCustomer);
            localStorage.setItem("apex_customer_auth", JSON.stringify(parsed));
          }
        } catch {}
      } else {
        setProfile((prev) => ({ ...prev, kycStatus: "pending" }));
      }
      setKycSuccessMessage("Identity documents uploaded successfully! Verification desk has received your request.");
    } catch (err: any) {
      setKycErrorMessage(err.message || "Failed to submit KYC documents.");
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const handleGoogleClick = () => {
    setAuthError("");
    setAuthSuccess("");
    triggerGoogleOAuth({
      onSuccess: (customer) => {
        applyCustomerToState(customer);
      },
      onError: (errMsg) => {
        setAuthError(errMsg);
      },
      onFallback: () => {
        setShowGoogleModal(true);
      },
      setLoading: setIsGoogleSubmitting,
    });
  };

  const handleGoogleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    setIsGoogleSubmitting(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const customer = await authenticateWithGoogleToken({
        email: googleEmailInput.trim().toLowerCase(),
        first_name: googleNameInput.trim().split(" ")[0] || "Google",
        last_name: googleNameInput.trim().split(" ").slice(1).join(" ") || "User",
        google_id: `g_${Date.now()}`,
      });

      applyCustomerToState(customer);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmittingAuth(true);

    try {
      const res = await apiFetch<any>("/api/v1/customers/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          identifier: signinForm.identifier.trim(),
          password: signinForm.password,
        }),
      });

      const customer = res?.customer || res;
      if (!customer) {
        throw new Error("Invalid response from login server.");
      }

      localStorage.setItem("apex_customer_auth", JSON.stringify(customer));
      localStorage.removeItem("apex_user_logged_out");
      window.dispatchEvent(new Event("apex_customer_auth_changed"));

      const fullName =
        customer.full_name ||
        `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
        "Client Member";
      const email = customer.email || "";
      const phone = customer.phone || "—";
      const joined = customer.created_at
        ? new Date(customer.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Recent";

      applyCustomerToState(customer);
      setAuthSuccess(`Welcome back, ${customer.first_name || customer.full_name || "Renter"}!`);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmittingAuth(true);

    try {
      const res = await apiFetch<any>("/api/v1/customers/auth/signup/", {
        method: "POST",
        body: JSON.stringify({
          first_name: signupForm.firstName.trim(),
          last_name: signupForm.lastName.trim(),
          email: signupForm.email.trim(),
          phone: signupForm.phone.trim(),
          password: signupForm.password,
          driver_license_number: signupForm.driverLicense.trim() || "CHAUFFEUR-BOOKING",
        }),
      });

      const customer = res?.customer || res;
      if (!customer) {
        throw new Error("Invalid response from registration server.");
      }

      localStorage.setItem("apex_customer_auth", JSON.stringify(customer));
      localStorage.removeItem("apex_user_logged_out");
      window.dispatchEvent(new Event("apex_customer_auth_changed"));

      const fullName =
        customer.full_name ||
        `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
        "Client Member";
      const email = customer.email || "";
      const phone = customer.phone || "—";
      const joined = customer.created_at
        ? new Date(customer.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Recent";

      applyCustomerToState(customer);
      setAuthSuccess(`Welcome to Sajilo Rentals, ${customer.first_name || customer.full_name || "Renter"}!`);
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Please check your details.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGuestLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchIdentifier.trim()) return;
    setIsGuestMode(true);
    fetchBookings(searchIdentifier.trim());
    setActiveTab("bookings");
  };

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
      await fetchBookings(profile.email || searchIdentifier.trim());
    } catch (err: any) {
      alert("Failed to cancel reservation: " + (err.message || "Unknown error"));
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (profile.customerId) {
        const parts = editForm.fullName.trim().split(" ");
        const firstName = parts[0] || editForm.fullName;
        const lastName = parts.slice(1).join(" ") || "";

        const res = await apiFetch<any>("/api/v1/customers/auth/profile/", {
          method: "POST",
          body: JSON.stringify({
            customer_id: profile.customerId,
            first_name: firstName,
            last_name: lastName,
            phone: editForm.phone,
            driver_license_number: editForm.driverLicense,
          }),
        });

        const updated = res?.customer;
        if (updated) {
          localStorage.setItem("apex_customer_auth", JSON.stringify(updated));
          window.dispatchEvent(new Event("apex_customer_auth_changed"));
        }
      }

      setProfile((prev) => ({
        ...prev,
        fullName: editForm.fullName || prev.fullName,
        phone: editForm.phone || prev.phone,
        driverLicense: editForm.driverLicense || prev.driverLicense,
      }));
      setShowEditModal(false);
    } catch (err: any) {
      alert("Failed to update profile: " + (err.message || "Unknown error"));
    }
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill out all required password fields.");
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

    try {
      if (profile.customerId) {
        await apiFetch("/api/v1/customers/auth/change-password/", {
          method: "POST",
          body: JSON.stringify({
            customer_id: profile.customerId,
            old_password: oldPassword,
            new_password: newPassword,
          }),
        });
      }

      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of your client portal?")) {
      localStorage.removeItem("apex_customer_auth");
      localStorage.setItem("apex_user_logged_out", "true");
      window.dispatchEvent(new Event("apex_customer_auth_changed"));
      setIsAuthenticated(false);
      setIsGuestMode(false);
      setBookings([]);
      router.push("/client");
    }
  };

  const menuItems = [
    { id: "overview", label: "Profile Overview", icon: User },
    { id: "bookings", label: "My Bookings", icon: Calendar },
    { id: "kyc", label: "Identity & KYC", icon: ShieldCheck },
    { id: "inquiries", label: "My Inquiries", icon: HelpCircle },
    { id: "vehicles", label: "My Vehicles", icon: Car },
    { id: "password", label: "Change Password", icon: Key },
  ] as const;

  // Initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "AP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* CASE 1: NOT AUTHENTICATED & NOT GUEST -> AUTHENTICATION GATE */}
        {/* ========================================================= */}
        {!isAuthenticated && !isGuestMode ? (
          <div className="max-w-xl mx-auto pt-4 sm:pt-10">
            {/* Brand Auth Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#e11d2e] border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                  <Car className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Client Portal &amp; Journey Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                  Access your active vehicle reservations, review chauffeured itineraries, and download tax invoices.
                </p>
              </div>

              {/* Google One-Click Auth Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleSubmitting}
                className="w-full h-11 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-3 mb-5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <span className="bg-white px-3">or email &amp; password</span>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === "signin"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === "signup"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error / Success Notifications */}
              {authError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 1: SIGN IN FORM                                  */}
              {/* ---------------------------------------------------- */}
              {authMode === "signin" && (
                <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Email Address or Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={signinForm.identifier}
                      onChange={(e) =>
                        setSigninForm({ ...signinForm, identifier: e.target.value })
                      }
                      placeholder="e.g. ram.sharma@example.com or 9841234567"
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-700">Password</label>
                      <span className="text-[11px] text-slate-400">Default or set at signup</span>
                    </div>
                    <input
                      type="password"
                      value={signinForm.password}
                      onChange={(e) =>
                        setSigninForm({ ...signinForm, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full h-11 bg-[#e11d2e] hover:bg-[#b01524] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {isSubmittingAuth ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Client Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 2: SIGN UP FORM                                  */}
              {/* ---------------------------------------------------- */}
              {authMode === "signup" && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupForm.firstName}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, firstName: e.target.value })
                        }
                        placeholder="Ram"
                        className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupForm.lastName}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, lastName: e.target.value })
                        }
                        placeholder="Sharma"
                        className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      placeholder="ram.sharma@example.com"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Mobile Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={signupForm.phone}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, phone: e.target.value })
                      }
                      placeholder="9841234567"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Driver&apos;s License Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={signupForm.driverLicense}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, driverLicense: e.target.value })
                      }
                      placeholder="Optional for chauffeur trips"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full h-11 bg-[#e11d2e] hover:bg-[#b01524] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {isSubmittingAuth ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account &amp; Access Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Guest Booking Lookup Separator */}
              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400">
                  <span className="bg-white px-3">or instant guest lookup</span>
                </div>
              </div>

              {/* Guest Booking Lookup Form */}
              <form onSubmit={handleGuestLookup} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={searchIdentifier}
                    onChange={(e) => setSearchIdentifier(e.target.value)}
                    placeholder="Enter booking phone or email..."
                    className="flex-1 h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e]"
                  />
                  <button
                    type="submit"
                    className="px-4 h-10 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0"
                  >
                    Look Up
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  View bookings placed via instant guest checkout without registering.
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* CASE 2: AUTHENTICATED USER OR GUEST LOOKUP ACTIVE         */
          /* ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ------------------------------------------------------- */}
            {/* LEFT SIDEBAR (Col 4)                                    */}
            {/* ------------------------------------------------------- */}
            <aside className="lg:col-span-4 space-y-5">
              {/* Profile Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col items-center text-center shadow-xs">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-pink-100/90 shadow-2xs mb-3.5">
                  {getInitials(profile.fullName)}
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {profile.fullName || "Guest Renter"}
                </h2>
                <span className="text-xs text-slate-500 font-normal mt-1 mb-4">
                  {profile.email || "Guest Session"}
                </span>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[11px] font-semibold mb-5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAuthenticated ? "Verified Renter" : "Guest Mode"}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 w-full">
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="flex-1 max-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 transition-colors bg-white shadow-2xs cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-700" />
                      <span>Edit</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 max-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-semibold text-[#e11d2e] transition-colors bg-white shadow-2xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#e11d2e]" />
                    <span>{isAuthenticated ? "Logout" : "Exit"}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Menu Card */}
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
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors text-left cursor-pointer ${
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

            {/* ------------------------------------------------------- */}
            {/* RIGHT MAIN CONTENT (Col 8)                              */}
            {/* ------------------------------------------------------- */}
            <main className="lg:col-span-8 space-y-6">
              {/* TAB: PROFILE OVERVIEW */}
              {activeTab === "overview" && (
                <>
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
                          {profile.fullName || "Guest Renter"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          EMAIL
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {profile.email || "—"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          PHONE
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {profile.phone || "—"}
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
                          DRIVER&apos;S LICENSE
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {profile.driverLicense || "Chauffeur Service Profile"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          MEMBER SINCE
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {profile.joined || "Recent"}
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
                        className="text-xs font-bold text-[#e11d2e] hover:underline cursor-pointer"
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
                        {bookings.slice(0, 3).map((b) => {
                          const chauffeurName =
                            b.vehicle?.driver_name ||
                            (b.notes?.includes("[Chauffeur Dispatched]:")
                              ? b.notes.match(/\[Chauffeur Dispatched\]:\s*([^(]+)/i)?.[1]?.trim()
                              : "");

                          return (
                            <div
                              key={b.id}
                              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-slate-900">
                                    #{b.booking_reference}
                                  </span>
                                  {chauffeurName && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Chauffeur: {chauffeurName}
                                    </span>
                                  )}
                                </div>
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
                                  className="px-2.5 py-1 text-xs font-bold text-[#388ddd] hover:underline cursor-pointer"
                                >
                                  Invoice
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-2 border border-slate-200/60">
                          <CalendarPlus className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-xs text-slate-500 font-normal">
                          No reservations found under your profile.
                        </p>
                        <Link
                          href="/search"
                          className="mt-3 px-4 py-2 bg-[#e11d2e] text-white rounded-xl text-xs font-bold hover:bg-[#b01524] transition-colors"
                        >
                          Book Your Journey
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB: MY BOOKINGS */}
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
                          className="px-3.5 h-9 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
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

                          // Extract assigned chauffeur information
                          let chauffeurName = vehicle?.driver_name || "";
                          let chauffeurPhone = "";
                          if (booking.notes && booking.notes.includes("[Chauffeur Dispatched]:")) {
                            const noteMatch = booking.notes.match(
                              /\[Chauffeur Dispatched\]:\s*([^(]+)(?:\(Phone:\s*([^,)]+))?/i
                            );
                            if (noteMatch) {
                              if (!chauffeurName) chauffeurName = noteMatch[1]?.trim() || "";
                              chauffeurPhone = noteMatch[2]?.trim() || "";
                            }
                          }

                          return (
                            <div
                              key={booking.id}
                              className="pt-4 flex flex-col gap-3"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#388ddd] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Tax Invoice</span>
                                    </button>

                                    {isCancellable && (
                                      <button
                                        type="button"
                                        disabled={cancellingId === booking.id}
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                      >
                                        {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Chauffeur Dispatch Details Banner */}
                              {chauffeurName && (
                                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                      🚗
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900">{chauffeurName}</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                          Assigned Chauffeur
                                        </span>
                                      </div>
                                      {chauffeurPhone && chauffeurPhone !== "—" && (
                                        <span className="text-[11px] text-slate-600 block mt-0.5">
                                          Direct Contact: <span className="font-semibold text-emerald-800 font-mono">{chauffeurPhone}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {chauffeurPhone && chauffeurPhone !== "—" && (
                                    <a
                                      href={`tel:${chauffeurPhone}`}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 w-fit shrink-0 transition-colors shadow-2xs"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      <span>Call Chauffeur</span>
                                    </a>
                                  )}
                                </div>
                              )}
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
                          You have no active vehicle reservations recorded. Browse our luxury fleet to reserve an executive journey.
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

              {/* TAB: IDENTITY & KYC VERIFICATION */}
              {activeTab === "kyc" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Identity &amp; License Verification (KYC)
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Upload Government National ID / Citizenship and Driver&apos;s License for instant verified rental access.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {profile.kycStatus === "verified" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Verified Renter</span>
                          </span>
                        ) : profile.kycStatus === "pending" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pending Review</span>
                          </span>
                        ) : profile.kycStatus === "rejected" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>Re-Upload Required</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Alert Description */}
                    <div className="mt-4 p-4 rounded-xl border text-xs flex items-start gap-3 bg-slate-50/70 border-slate-200/80">
                      {profile.kycStatus === "verified" ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 block">Identity Fully Approved</span>
                            <p className="text-slate-600 mt-0.5">
                              Your documents have been verified by our dispatch team. You are eligible for instant vehicle collection, reduced security deposits, and express self-drive reservations.
                            </p>
                          </div>
                        </>
                      ) : profile.kycStatus === "pending" ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                            ⏳
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Under Review by Dispatch Operations</span>
                            <p className="text-slate-600 mt-0.5">
                              Your documents have been submitted and are currently in the verification queue. Average verification turnaround is 2-4 business hours.
                            </p>
                          </div>
                        </>
                      ) : profile.kycStatus === "rejected" ? (
                        <>
                          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 block">Verification Request Rejected</span>
                            <p className="text-slate-600 mt-0.5">
                              {profile.kycNotes || "Your submitted document images were unreadable or expired. Please upload high-resolution photos of your original license and citizenship."}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 block">Verification Required Before Handover</span>
                            <p className="text-slate-600 mt-0.5">
                              To prevent fraud and comply with local automotive transportation laws, please submit your valid driving license and national identity card.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Success / Error Messages */}
                    {kycSuccessMessage && (
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{kycSuccessMessage}</span>
                      </div>
                    )}
                    {kycErrorMessage && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{kycErrorMessage}</span>
                      </div>
                    )}

                    {/* Upload Form */}
                    <form onSubmit={handleKycSubmit} className="mt-6 space-y-5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">
                            National ID / Citizenship / Passport Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={kycForm.idCardNumber}
                            onChange={(e) => setKycForm({ ...kycForm, idCardNumber: e.target.value })}
                            placeholder="e.g. 27-01-79-12345 or Passport #N012345"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">
                            Driver&apos;s License Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={kycForm.driverLicenseNumber}
                            onChange={(e) => setKycForm({ ...kycForm, driverLicenseNumber: e.target.value })}
                            placeholder="e.g. 01-06-00123456"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900 font-mono"
                          />
                        </div>
                      </div>

                      {/* File Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">
                              Driver&apos;s License Document
                            </span>
                            <span className="text-[11px] text-slate-400 block mb-3">
                              Upload photo or enter image link.
                            </span>

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setKycForm((prev) => ({
                                      ...prev,
                                      driverLicenseImage: reader.result as string,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                            />

                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Or direct URL (https://...)"
                                value={kycForm.driverLicenseImage.startsWith("data:") ? "" : kycForm.driverLicenseImage}
                                onChange={(e) => setKycForm({ ...kycForm, driverLicenseImage: e.target.value })}
                                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-[11px] outline-none"
                              />
                            </div>
                          </div>

                          {kycForm.driverLicenseImage && (
                            <div className="mt-3 flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>License document attached</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">
                              National ID / Citizenship / Passport
                            </span>
                            <span className="text-[11px] text-slate-400 block mb-3">
                              Upload photo or enter image link.
                            </span>

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setKycForm((prev) => ({
                                      ...prev,
                                      citizenshipImage: reader.result as string,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                            />

                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Or direct URL (https://...)"
                                value={kycForm.citizenshipImage.startsWith("data:") ? "" : kycForm.citizenshipImage}
                                onChange={(e) => setKycForm({ ...kycForm, citizenshipImage: e.target.value })}
                                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-[11px] outline-none"
                              />
                            </div>
                          </div>

                          {kycForm.citizenshipImage && (
                            <div className="mt-3 flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Identity document attached</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingKyc}
                        className="px-6 py-3 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingKyc ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Submit Documents for Verification</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: MY INQUIRIES */}
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
                        className="px-5 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: MY VEHICLES (HOST) */}
              {activeTab === "vehicles" && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        My Hosted Vehicles
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Monetize your vehicle with Sajilo Rentals&apos; verified host network.
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
                      List your Scorpio, EV, HiAce, or luxury sedan. Sajilo Rentals provides vetted professional chauffeurs, insurance handling, and guaranteed weekly payouts.
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

              {/* TAB: CHANGE PASSWORD */}
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
                        Current Password (if set)
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        New Password (minimum 6 characters)
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
                      className="px-5 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </button>
                  </form>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* FLOATING ACTION SUPPORT BUTTONS                               */}
      {/* ============================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* WhatsApp Button */}
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

        {/* Phone Call Button */}
        <a
          href="tel:+9779841234567"
          className="w-12 h-12 rounded-full bg-[#e11d2e] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Call Sajilo Rentals"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>

        {/* Messenger Button */}
        <a
          href="https://m.me/sajilorentals"
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
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+977 98..."
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Driver&apos;s License Number
                </label>
                <input
                  type="text"
                  value={editForm.driverLicense}
                  onChange={(e) => setEditForm({ ...editForm, driverLicense: e.target.value })}
                  placeholder="e.g. DL-0982-KTM"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#e11d2e] text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e11d2e] hover:bg-[#b01524] text-white rounded-xl font-bold cursor-pointer"
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
                    Sajilo Luxury Concierge
                  </h3>
                  <span className="text-[10px] text-slate-400 block">
                    Kathmandu Hub &bull; PAN/VAT Reg: 609823412
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
                Helpline: +977 9841234567 &bull; support@sajilo-rentals.com
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* GOOGLE SIGN IN MODAL DIALOG                                   */}
      {/* ============================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Sign in with Google</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your verified Google account will be linked to Apex Rentals.
              </p>
            </div>

            <form onSubmit={handleGoogleAuthSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4285F4] text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Pawan Adhikari"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4285F4] text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isGoogleSubmitting}
                className="w-full h-11 bg-[#4285F4] hover:bg-[#3367d6] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGoogleSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Google Sign-In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
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

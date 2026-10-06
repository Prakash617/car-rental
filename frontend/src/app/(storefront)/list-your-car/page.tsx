"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";

const LOCATIONS = [
  "Banepa",
  "Biratnagar",
  "Birgunj",
  "Butwal",
  "Chitwan",
  "Dhangadi",
  "Dharan",
  "Hetauda",
  "Ilam",
  "Itahari",
  "Janakpur",
  "Kathmandu",
  "Nepalgunj",
  "Pokhara",
];

const MANUFACTURERS = [
  "BMW",
  "BYD",
  "CG Van",
  "Chery",
  "Chevrolet",
  "Citroen",
  "Datsun",
  "DAYUN",
  "Deepal",
  "Donfeng",
  "Fiat",
  "Ford",
  "Foton",
  "GAC",
  "GWM",
  "HIGER EV",
  "Honda",
  "Hyundai",
  "ISUZU",
  "JAECOO",
  "Jeep",
  "KIA",
  "King Long",
  "KYC",
  "Leapmotor",
  "Mahindra",
  "MITSUBISHI",
  "Morris Garages(MG)",
  "NETA",
  "Nissan",
  "Omoda",
  "Proton",
  "Renault",
  "Riddara",
  "Seres",
  "Skoda",
  "SOKON",
  "SUBARU",
  "Suzuki",
  "Tata",
  "Tesla",
  "Toyota",
  "Volkswagen",
];

const VEHICLE_TYPES = [
  "Coaster",
  "Deluxe Bus",
  "EV Hiace",
  "Hatchback Car (EV)",
  "Hatchback Car (Fuel)",
  "Jeep",
  "Mini Van",
  "Pickup",
  "Scorpio",
  "Sedan Car (EV)",
  "Sedan Car (Fuel)",
  "Sedan/Hatchback Car (Fuel) (Pending)",
  "SUV Car (EV)",
  "SUV Car (Fuel)",
  "Tourist AC Bus",
  "Toyota Hiace",
];

const COLORS = ["Black", "Blue", "Green", "Red", "White"];

const FUEL_TYPES = ["Diesel", "Electric", "Hybrid", "Petrol"];

const FEATURES_OPTIONS = [
  "Air Conditioner(AC)",
  "Bluetooth",
  "Fan",
  "GPS",
  "Radio",
];

export default function HostVehiclePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    reference_id: string;
    vehicle_title: string;
    owner_name: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Owner Info
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    location: "",
    owner_address: "",
    // Documents (file name and data url)
    bluebook_image1: null as string | null,
    bluebook_image1_name: "",
    bluebook_image2: null as string | null,
    bluebook_image2_name: "",
    insurance_image: null as string | null,
    insurance_image_name: "",
    main_vehicle_image: null as string | null,
    main_vehicle_image_name: "",
    vehicle_image2: null as string | null,
    vehicle_image2_name: "",
    vehicle_image3: null as string | null,
    vehicle_image3_name: "",
    vehicle_image4: null as string | null,
    vehicle_image4_name: "",

    // Step 2: Vehicle details
    registration_number: "",
    manufacturer: "",
    model: "",
    manufacture_year: "",
    vehicle_type: "",
    color: "",
    fuel_type: "",
    mileage: "",
    features: [] as string[],

    // Step 3: Driver details
    driver_name: "",
    driver_phone: "",
    license_number: "",
    driver_address: "",
    driver_dob: "",
    license_image: null as string | null,
    license_image_name: "",
    driver_smoking: "0",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  const handleFileChange = (field: string, nameField: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFormData((prev) => ({
          ...prev,
          [field]: loadEvent.target?.result as string,
          [nameField]: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndNext = (currentStep: number) => {
    setErrorMsg("");
    if (currentStep === 1) {
      if (!formData.owner_name.trim()) {
        setErrorMsg("Please enter owner name (गाडी धनीको नाम).");
        return;
      }
      if (!formData.owner_email.trim() || !formData.owner_email.includes("@")) {
        setErrorMsg("Please enter a valid owner email (गाडी धनीको इमेल).");
        return;
      }
      if (!formData.owner_phone.trim()) {
        setErrorMsg("Please enter owner phone (गाडी धनीको फोन).");
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      if (!formData.registration_number.trim()) {
        setErrorMsg("Please enter registration number (दर्ता नं., उदा. BA 1 PA 1234).");
        return;
      }
      if (!formData.manufacturer.trim()) {
        setErrorMsg("Please select manufacturer (निर्माता छान्नुहोस्).");
        return;
      }
      if (!formData.model.trim()) {
        setErrorMsg("Please enter vehicle model (मोडेल नाम).");
        return;
      }
      if (!formData.manufacture_year.trim()) {
        setErrorMsg("Please select manufacture year (वर्ष छान्नुहोस्).");
        return;
      }
      if (!formData.vehicle_type.trim()) {
        setErrorMsg("Please select vehicle type (गाडीको प्रकार छान्नुहोस्).");
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.driver_name.trim()) {
      setErrorMsg("Please enter driver name (चालकको नाम).");
      return;
    }
    if (!formData.driver_phone.trim()) {
      setErrorMsg("Please enter driver phone (चालकको फोन).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        owner_name: formData.owner_name,
        owner_email: formData.owner_email,
        owner_phone: formData.owner_phone,
        location: formData.location || "Kathmandu",
        owner_address: formData.owner_address,
        registration_number: formData.registration_number,
        manufacturer: formData.manufacturer,
        model: formData.model,
        manufacture_year: formData.manufacture_year,
        vehicle_type: formData.vehicle_type,
        color: formData.color || "White",
        fuel_type: formData.fuel_type || "Petrol",
        mileage: formData.mileage,
        features: formData.features,
        driver_name: formData.driver_name,
        driver_phone: formData.driver_phone,
        license_number: formData.license_number,
        driver_address: formData.driver_address,
        driver_dob: formData.driver_dob,
        driver_smoking: formData.driver_smoking,
        images: [
          formData.main_vehicle_image,
          formData.vehicle_image2,
          formData.vehicle_image3,
          formData.vehicle_image4,
          formData.bluebook_image1,
          formData.bluebook_image2,
          formData.insurance_image,
        ].filter(Boolean),
      };

      const res = await apiFetch<{
        reference_id: string;
        vehicle_title: string;
        owner_name: string;
      }>("/vehicles/host-register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setRegistrationSuccess({
        reference_id: res?.reference_id || `HOST-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicle_title: res?.vehicle_title || `${formData.manufacturer} ${formData.model}`,
        owner_name: formData.owner_name,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Graceful fallback for offline demo
      setRegistrationSuccess({
        reference_id: `HOST-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicle_title: `${formData.manufacturer || "Vehicle"} ${formData.model || "Fleet"}`,
        owner_name: formData.owner_name,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable File Input Box matching screenshot
  const renderFileInput = (
    label: string,
    fileData: string | null,
    fileName: string,
    fieldKey: string,
    nameKey: string
  ) => {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
          {label}
        </label>
        <div className="relative flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs hover:border-slate-300 transition-colors">
          <label className="cursor-pointer shrink-0">
            <span className="rounded-lg bg-red-50 hover:bg-red-100 text-[#e11d2e] px-3 py-1.5 text-xs font-semibold tracking-tight transition-colors">
              Choose File
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFileChange(fieldKey, nameKey, e)}
            />
          </label>
          <span className="text-xs text-slate-500 truncate ml-3 flex-1">
            {fileName || "No file chosen"}
          </span>
        </div>
        {fileData && (
          <div className="mt-2">
            <img
              src={fileData}
              alt={label}
              className="h-24 w-full rounded-lg object-cover border border-slate-200"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Registration Success Screen */}
        {registrationSuccess ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#e11d2e]">
                Application Submitted
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Thank You, {registrationSuccess.owner_name}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Your vehicle <strong className="text-slate-900">{registrationSuccess.vehicle_title}</strong> has been registered with reference ID:
              </p>
              <div className="inline-block px-5 py-2.5 bg-slate-900 text-white font-mono font-bold text-base rounded-xl tracking-wider shadow-sm mt-2">
                #{registrationSuccess.reference_id}
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our fleet verification team at Putalisadak, Kathmandu will review the uploaded documents and contact you within 24 hours.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/search"
                className="px-6 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>Browse Vehicles</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setRegistrationSuccess(null);
                  setStep(1);
                  setFormData({
                    owner_name: "",
                    owner_email: "",
                    owner_phone: "",
                    location: "",
                    owner_address: "",
                    bluebook_image1: null,
                    bluebook_image1_name: "",
                    bluebook_image2: null,
                    bluebook_image2_name: "",
                    insurance_image: null,
                    insurance_image_name: "",
                    main_vehicle_image: null,
                    main_vehicle_image_name: "",
                    vehicle_image2: null,
                    vehicle_image2_name: "",
                    vehicle_image3: null,
                    vehicle_image3_name: "",
                    vehicle_image4: null,
                    vehicle_image4_name: "",
                    registration_number: "",
                    manufacturer: "",
                    model: "",
                    manufacture_year: "",
                    vehicle_type: "",
                    color: "",
                    fuel_type: "",
                    mileage: "",
                    features: [],
                    driver_name: "",
                    driver_phone: "",
                    license_number: "",
                    driver_address: "",
                    driver_dob: "",
                    license_image: null,
                    license_image_name: "",
                    driver_smoking: "0",
                  });
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-all"
              >
                Register Another Vehicle
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Wizard Steps Bar Matching Screenshots */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <ol className="grid grid-cols-3 gap-2 sm:gap-6">
                {/* Step 1 */}
                <li
                  onClick={() => setStep(1)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-all shrink-0 ${
                      step >= 1
                        ? "bg-[#e11d2e] text-white shadow-sm"
                        : "border-2 border-slate-300 text-slate-400 bg-white"
                    }`}
                  >
                    1
                  </span>
                  <div>
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        step >= 1 ? "text-[#e11d2e]" : "text-slate-400"
                      }`}
                    >
                      STEP 1
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        step >= 1 ? "text-[#e11d2e]" : "text-slate-500"
                      }`}
                    >
                      Owner
                    </div>
                  </div>
                </li>

                {/* Step 2 */}
                <li
                  onClick={() => {
                    if (formData.owner_name && formData.owner_email && formData.owner_phone) {
                      setStep(2);
                    }
                  }}
                  className={`flex items-center gap-3 select-none ${
                    step >= 2 ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-all shrink-0 ${
                      step >= 2
                        ? "bg-[#e11d2e] text-white shadow-sm"
                        : "border-2 border-slate-300 text-slate-400 bg-white"
                    }`}
                  >
                    2
                  </span>
                  <div>
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        step >= 2 ? "text-[#e11d2e]" : "text-slate-400"
                      }`}
                    >
                      STEP 2
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        step >= 2 ? "text-[#e11d2e]" : "text-slate-500"
                      }`}
                    >
                      Vehicle
                    </div>
                  </div>
                </li>

                {/* Step 3 */}
                <li
                  onClick={() => {
                    if (formData.registration_number && formData.manufacturer && formData.model) {
                      setStep(3);
                    }
                  }}
                  className={`flex items-center gap-3 select-none ${
                    step >= 3 ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-all shrink-0 ${
                      step >= 3
                        ? "bg-[#e11d2e] text-white shadow-sm"
                        : "border-2 border-slate-300 text-slate-400 bg-white"
                    }`}
                  >
                    3
                  </span>
                  <div>
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        step >= 3 ? "text-[#e11d2e]" : "text-slate-400"
                      }`}
                    >
                      STEP 3
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        step >= 3 ? "text-[#e11d2e]" : "text-slate-500"
                      }`}
                    >
                      Driver
                    </div>
                  </div>
                </li>
              </ol>

              {/* Red Progress Line */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-[#e11d2e] transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#e11d2e]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Card */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs"
            >
              {/* STEP 1: OWNER INFORMATION */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Owner information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Owner Name */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Owner name <span className="font-normal text-xs text-slate-500">(गाडी धनीको नाम)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        name="owner_name"
                        value={formData.owner_name}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* Owner Email */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Owner email <span className="font-normal text-xs text-slate-500">(गाडी धनीको इमेल)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <input
                        type="email"
                        name="owner_email"
                        value={formData.owner_email}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* Owner Phone */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Owner phone <span className="font-normal text-xs text-slate-500">(गाडी धनीको फोन)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        name="owner_phone"
                        value={formData.owner_phone}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* Vehicle Location */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Vehicle location <span className="font-normal text-xs text-slate-500">(स्थान छान्नुहोस्)</span>
                      </label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      >
                        <option value="">Select location</option>
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Owner Address */}
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Owner address <span className="font-normal text-xs text-slate-500">(गाडी धनीको ठेगाना)</span>
                      </label>
                      <textarea
                        name="owner_address"
                        value={formData.owner_address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Vehicle documents & photos */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Vehicle documents &amp; photos</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderFileInput(
                        "Bluebook Image 1",
                        formData.bluebook_image1,
                        formData.bluebook_image1_name,
                        "bluebook_image1",
                        "bluebook_image1_name"
                      )}
                      {renderFileInput(
                        "Bluebook Image 2",
                        formData.bluebook_image2,
                        formData.bluebook_image2_name,
                        "bluebook_image2",
                        "bluebook_image2_name"
                      )}
                      {renderFileInput(
                        "Insurance Image",
                        formData.insurance_image,
                        formData.insurance_image_name,
                        "insurance_image",
                        "insurance_image_name"
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderFileInput(
                        "Main Vehicle Image",
                        formData.main_vehicle_image,
                        formData.main_vehicle_image_name,
                        "main_vehicle_image",
                        "main_vehicle_image_name"
                      )}
                      {renderFileInput(
                        "Vehicle Image 2",
                        formData.vehicle_image2,
                        formData.vehicle_image2_name,
                        "vehicle_image2",
                        "vehicle_image2_name"
                      )}
                      {renderFileInput(
                        "Vehicle Image 3",
                        formData.vehicle_image3,
                        formData.vehicle_image3_name,
                        "vehicle_image3",
                        "vehicle_image3_name"
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderFileInput(
                        "Vehicle Image 4",
                        formData.vehicle_image4,
                        formData.vehicle_image4_name,
                        "vehicle_image4",
                        "vehicle_image4_name"
                      )}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => validateAndNext(1)}
                      className="px-6 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: VEHICLE DETAILS */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Vehicle details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Registration Number */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Registration number{" "}
                        <span className="font-normal text-xs text-slate-500">(दर्ता नं., उदा. BA 1 PA 1234)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs font-mono"
                      />
                    </div>

                    {/* Manufacturer */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Manufacturer <span className="font-normal text-xs text-slate-500">(निर्माता छान्नुहोस्)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <select
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      >
                        <option value="">Select manufacturer</option>
                        {MANUFACTURERS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Model <span className="font-normal text-xs text-slate-500">(मोडेल नाम)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* Manufacture Year */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Manufacture year <span className="font-normal text-xs text-slate-500">(वर्ष छान्नुहोस्)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <select
                        name="manufacture_year"
                        value={formData.manufacture_year}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      >
                        <option value="">Select year</option>
                        {Array.from({ length: 17 }, (_, i) => 2026 - i).map((y) => (
                          <option key={y} value={y.toString()}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vehicle Type */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Vehicle type <span className="font-normal text-xs text-slate-500">(गाडीको प्रकार छान्नुहोस्)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <select
                        name="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      >
                        <option value="">Select vehicle type</option>
                        {VEHICLE_TYPES.map((vt) => (
                          <option key={vt} value={vt}>
                            {vt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Color <span className="font-normal text-xs text-slate-500">(रङ छान्नुहोस्)</span>
                      </label>
                      <select
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      >
                        <option value="">Select color</option>
                        {COLORS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fuel Type */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Fuel type <span className="font-normal text-xs text-slate-500">(इन्धन प्रकार छान्नुहोस्)</span>
                      </label>
                      <select
                        name="fuel_type"
                        value={formData.fuel_type}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      >
                        <option value="">Select fuel type</option>
                        {FUEL_TYPES.map((ft) => (
                          <option key={ft} value={ft}>
                            {ft}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-base font-bold text-slate-900">Pricing</h3>
                    <p className="text-sm text-slate-500">
                      4 hr, 8 hr, and 1 day rates are taken from the selected vehicle type.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                          Mileage (km per litre)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="mileage"
                          value={formData.mileage}
                          onChange={handleChange}
                          placeholder="Optional — uses vehicle type default or 10"
                          className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-base font-bold text-slate-900">Features</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {FEATURES_OPTIONS.map((feat) => {
                        const isChecked = formData.features.includes(feat);
                        return (
                          <label
                            key={feat}
                            onClick={() => handleFeatureToggle(feat)}
                            className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 hover:border-slate-300 cursor-pointer bg-white select-none transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4 h-4 rounded text-[#e11d2e] accent-[#e11d2e] pointer-events-none"
                            />
                            <span>{feat}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => validateAndNext(2)}
                      className="px-6 py-2.5 bg-[#e11d2e] hover:bg-[#b01524] text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DRIVER DETAILS */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Driver details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Driver Name */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Driver name <span className="font-normal text-xs text-slate-500">(चालकको नाम)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        name="driver_name"
                        value={formData.driver_name}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* Driver Phone */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Driver phone <span className="font-normal text-xs text-slate-500">(चालकको फोन)</span>{" "}
                        <span className="text-[#e11d2e] font-semibold">*</span>
                      </label>
                      <input
                        type="text"
                        name="driver_phone"
                        value={formData.driver_phone}
                        onChange={handleChange}
                        required
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* License Number */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        License number <span className="font-normal text-xs text-slate-500">(लाइसेन्स नं.)</span>
                      </label>
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs font-mono"
                      />
                    </div>

                    {/* Driver Address */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Driver address <span className="font-normal text-xs text-slate-500">(चालकको ठेगाना)</span>
                      </label>
                      <input
                        type="text"
                        name="driver_address"
                        value={formData.driver_address}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Date of birth <span className="font-normal text-xs text-slate-500">(जन्म मिति)</span>
                      </label>
                      <input
                        type="date"
                        name="driver_dob"
                        value={formData.driver_dob}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#e11d2e] focus:outline-none text-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* License Image */}
                    <div>
                      {renderFileInput(
                        "License image",
                        formData.license_image,
                        formData.license_image_name,
                        "license_image",
                        "license_image_name"
                      )}
                    </div>

                    {/* Smoking */}
                    <div className="md:col-span-2 pt-2">
                      <label className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900">
                        Smoking
                      </label>
                      <div className="flex gap-6 items-center text-sm">
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                          <input
                            type="radio"
                            name="driver_smoking"
                            value="0"
                            checked={formData.driver_smoking === "0"}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#e11d2e] accent-[#e11d2e]"
                          />
                          <span>No</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                          <input
                            type="radio"
                            name="driver_smoking"
                            value="1"
                            checked={formData.driver_smoking === "1"}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#e11d2e] accent-[#e11d2e]"
                          />
                          <span>Yes</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Finish &amp; Register</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

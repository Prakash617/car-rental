"use client";

import { create } from "zustand";
import { Vehicle } from "@/types";

interface UIState {
  // Mobile navigation
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Booking Modal
  isBookingModalOpen: boolean;
  selectedBookingVehicle: Vehicle | null;
  openBookingModal: (vehicle: Vehicle) => void;
  closeBookingModal: () => void;

  // Quick Filters
  activeCategoryFilter: string;
  setActiveCategoryFilter: (category: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  isBookingModalOpen: false,
  selectedBookingVehicle: null,
  openBookingModal: (vehicle) => set({ isBookingModalOpen: true, selectedBookingVehicle: vehicle }),
  closeBookingModal: () => set({ isBookingModalOpen: false, selectedBookingVehicle: null }),

  activeCategoryFilter: "all",
  setActiveCategoryFilter: (category) => set({ activeCategoryFilter: category }),
}));

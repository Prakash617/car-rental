"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookingDraft {
  pickupDate: string;
  returnDate: string;
  pickupBranchId?: string;
  returnBranchId?: string;
  withChauffeur: boolean;
  withLossDamageWaiver: boolean;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestLicense: string;
}

const DEFAULT_DRAFT: BookingDraft = {
  pickupDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  returnDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
  withChauffeur: false,
  withLossDamageWaiver: true,
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  guestLicense: "",
};

interface BookingDraftState {
  draft: BookingDraft;
  updateDraft: (fields: Partial<BookingDraft>) => void;
  resetDraft: () => void;
}

export const useBookingDraftStore = create<BookingDraftState>()(
  persist(
    (set) => ({
      draft: DEFAULT_DRAFT,
      updateDraft: (fields) =>
        set((state) => ({
          draft: { ...state.draft, ...fields },
        })),
      resetDraft: () => set({ draft: DEFAULT_DRAFT }),
    }),
    {
      name: "apex_booking_draft",
    }
  )
);

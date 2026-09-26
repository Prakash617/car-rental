import { apiFetch } from "./client";

export interface QuoteParams {
  vehicle_id: string;
  pickup_datetime: string;
  return_datetime: string;
  addon_ids?: string[];
  coupon_code?: string;
}

export interface QuoteLineItem {
  description: string;
  amount: string;
}

export interface QuoteAddon {
  id: string;
  name: string;
  price: string;
  pricing_type: string;
  subtotal: string;
}

export interface RentalQuote {
  billable_days: number;
  base_price: string;
  discount_amount: string;
  tax_amount: string;
  deposit_amount: string;
  total_price: string;
  line_items: QuoteLineItem[];
  addons: QuoteAddon[];
}

export async function calculateQuote(
  params: QuoteParams,
  tenantHost?: string
): Promise<RentalQuote> {
  return apiFetch<RentalQuote>("/api/v1/pricing/quote/", {
    method: "POST",
    body: JSON.stringify(params),
    tenantHost,
    cache: "no-store",
  });
}

export type VehicleStatus = "available" | "reserved" | "rented" | "maintenance" | "inactive";
export type VehicleCategory = "economy" | "compact" | "sedan" | "suv" | "luxury" | "sports" | "van" | "electric";
export type TransmissionType = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  category: VehicleCategory;
  transmission: TransmissionType;
  fuel_type: FuelType;
  seats: number;
  doors: number;
  mileage: number;
  color: string;
  status: VehicleStatus;
  daily_rate: string;
  rate_4h?: string | number | null;
  rate_8h?: string | number | null;
  fuel_rate_per_km?: string | number | null;
  is_verified?: boolean;
  driver_included?: boolean;
  driver_name?: string;
  driver_experience?: string;
  weekly_rate?: string | null;
  monthly_rate?: string | null;
  deposit_amount: string;
  features: string[];
  images?: ({ url: string; is_primary?: boolean; caption?: string } | string)[];
  description?: string;
  branch_id?: string;
  branch?: string;
  branch_name?: string;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled" | "rejected";
export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "refunded";

export interface BranchRef {
  id: string;
  name: string;
  code?: string;
  city?: string;
  address_line1?: string;
  phone?: string;
  email?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  vehicle_id?: string;
  vehicle?: Vehicle;
  customer_id?: string;
  customer?: Customer;
  pickup_branch_id?: string;
  return_branch_id?: string;
  pickup_branch?: BranchRef;
  return_branch?: BranchRef;
  pickup_datetime: string;
  return_datetime: string;
  pickup_location?: string;
  destination_location?: string;
  stops?: string[];
  trip_type?: string;
  decoration_name?: string;
  decoration_price?: string | number;
  distance_km?: string | number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  advance_amount?: string | number;
  status: BookingStatus;
  base_price: string;
  discount_amount: string;
  tax_amount: string;
  deposit_amount: string;
  total_price: string;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  addons?: { id: string; name: string; price: string; quantity: number }[];
}

export interface TenantBranding {
  name: string;
  logo_url?: string;
  primary_color: string;
  accent_color: string;
  font_heading: string;
  support_email: string;
  support_phone: string;
  currency: string;
  timezone: string;
  active_theme: "luxury" | "modern" | "classic" | "adventure" | "urban" | "minimal" | "sajilo";
  // Hero content
  hero_title?: string;
  hero_subtitle?: string;
  // SEO metadata
  seo_meta_title?: string;
  seo_meta_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
}

export interface DashboardOverview {
  fleet_total: number;
  fleet_available: number;
  fleet_rented: number;
  fleet_in_maintenance: number;
  fleet_utilization_rate: number;
  bookings_active: number;
  bookings_pending: number;
  bookings_completed_this_month: number;
  revenue_this_month: string;
  pending_revenue: string;
  maintenance_active_jobs: number;
  maintenance_overdue_services: number;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  driver_license_number: string;
  license_expiry_date: string;
  date_of_birth: string;
  country: string;
  is_verified: boolean;
  created_at: string;
}

export interface ExtraAddon {
  id: string;
  name: string;
  description?: string;
  price: string;
  pricing_type: "per_day" | "per_rental";
  is_active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: string;
  min_rental_days: number;
  is_active: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  is_platform_admin: boolean;
  is_active: boolean;
}

export interface AuthSession {
  user: AuthUser;
  role: "owner" | "admin" | "manager" | "staff" | "accountant" | "viewer";
  access_token: string;
  refresh_token: string;
  tenant_domain?: string | null;
  redirect_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
  };
  pagination?: {
    count: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  author_name: string;
  author_avatar?: string | null;
  category: string;
  tags?: string;
  read_time_minutes: number;
  is_published: boolean;
  views_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

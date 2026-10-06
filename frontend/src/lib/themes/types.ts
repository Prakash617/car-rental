import { ComponentType } from "react";
import { TenantBranding, Vehicle } from "@/types";

export interface HeroProps {
  branding: TenantBranding;
  onSearch?: (searchParams: { branchId?: string; pickupDate?: string; returnDate?: string }) => void;
}

export interface VehicleCardProps {
  vehicle: Vehicle;
  branding: TenantBranding;
  onSelect?: (vehicle: Vehicle) => void;
}

export interface FleetGridProps {
  vehicles: Vehicle[];
  branding: TenantBranding;
  isLoading?: boolean;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
}

export interface FeaturesProps {
  branding: TenantBranding;
}

export interface FooterProps {
  branding: TenantBranding;
}

export interface ThemeComponents {
  HeroSection: ComponentType<HeroProps>;
  VehicleCard: ComponentType<VehicleCardProps>;
  FleetGrid: ComponentType<FleetGridProps>;
  FeaturesSection: ComponentType<FeaturesProps>;
  Footer: ComponentType<FooterProps>;
}

export type ThemeId = "luxury" | "modern" | "classic" | "adventure" | "urban" | "minimal" | "sajilo";

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  category: ThemeId;
  accentColor: string;
  previewImage: string;
  components: ThemeComponents;
}

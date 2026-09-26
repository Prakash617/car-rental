import { ThemeDefinition } from "@/lib/themes/types";
import { ModernHeroSection } from "./HeroSection";
import { ModernVehicleCard } from "./VehicleCard";
import { ModernFleetGrid } from "./FleetGrid";
import { ModernFeaturesSection } from "./FeaturesSection";
import { ModernFooter } from "./Footer";

export const modernTheme: ThemeDefinition = {
  id: "modern",
  name: "Modern Mobility",
  description: "High-contrast Scandinavian design with crisp geometric layouts, rapid filters, and vibrant cobalt touches.",
  category: "modern",
  accentColor: "#2563EB",
  previewImage: "/themes/previews/modern.jpg",
  components: {
    HeroSection: ModernHeroSection,
    VehicleCard: ModernVehicleCard,
    FleetGrid: ModernFleetGrid,
    FeaturesSection: ModernFeaturesSection,
    Footer: ModernFooter,
  },
};

export {
  ModernHeroSection,
  ModernVehicleCard,
  ModernFleetGrid,
  ModernFeaturesSection,
  ModernFooter,
};

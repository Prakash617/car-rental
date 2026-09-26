import { ThemeDefinition } from "@/lib/themes/types";
import { UrbanHeroSection } from "./HeroSection";
import { UrbanVehicleCard } from "./VehicleCard";
import { UrbanFleetGrid } from "./FleetGrid";
import { UrbanFeaturesSection } from "./FeaturesSection";
import { UrbanFooter } from "./Footer";

export const urbanTheme: ThemeDefinition = {
  id: "urban",
  name: "Urban Pulse",
  description: "Dynamic city mobility theme tailored for electric fleets, micro-rentals, and daily commuters.",
  category: "urban",
  accentColor: "#06B6D4",
  previewImage: "/themes/previews/urban.jpg",
  components: {
    HeroSection: UrbanHeroSection,
    VehicleCard: UrbanVehicleCard,
    FleetGrid: UrbanFleetGrid,
    FeaturesSection: UrbanFeaturesSection,
    Footer: UrbanFooter,
  },
};

export {
  UrbanHeroSection,
  UrbanVehicleCard,
  UrbanFleetGrid,
  UrbanFeaturesSection,
  UrbanFooter,
};

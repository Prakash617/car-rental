import { ThemeDefinition } from "@/lib/themes/types";
import { SajiloHeroSection } from "./HeroSection";
import { SajiloVehicleCard } from "./VehicleCard";
import { SajiloFleetGrid } from "./FleetGrid";
import { SajiloFeaturesSection } from "./FeaturesSection";
import { SajiloFooter } from "./Footer";

export const sajiloTheme: ThemeDefinition = {
  id: "sajilo",
  name: "Sajilo Rental Nepal",
  description: "Authentic sajilorental.com design with verified driver badges, Nepal city routes, 4h/8h/1d rates, and interactive booking system.",
  category: "sajilo",
  accentColor: "#e11d2e",
  previewImage: "/brand/logo.svg",
  components: {
    HeroSection: SajiloHeroSection,
    VehicleCard: SajiloVehicleCard,
    FleetGrid: SajiloFleetGrid,
    FeaturesSection: SajiloFeaturesSection,
    Footer: SajiloFooter,
  },
};

export {
  SajiloHeroSection,
  SajiloVehicleCard,
  SajiloFleetGrid,
  SajiloFeaturesSection,
  SajiloFooter,
};

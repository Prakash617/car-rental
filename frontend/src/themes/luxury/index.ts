import { ThemeDefinition } from "@/lib/themes/types";
import { LuxuryHeroSection } from "./HeroSection";
import { LuxuryVehicleCard } from "./VehicleCard";
import { LuxuryFleetGrid } from "./FleetGrid";
import { LuxuryFeaturesSection } from "./FeaturesSection";
import { LuxuryFooter } from "./Footer";

export const luxuryTheme: ThemeDefinition = {
  id: "luxury",
  name: "Luxury Concierge",
  description: "Cinematic, editorial styling with champagne gold accents, rich dark palettes, and refined serif typography.",
  category: "luxury",
  accentColor: "#D4AF37",
  previewImage: "/themes/previews/luxury.jpg",
  components: {
    HeroSection: LuxuryHeroSection,
    VehicleCard: LuxuryVehicleCard,
    FleetGrid: LuxuryFleetGrid,
    FeaturesSection: LuxuryFeaturesSection,
    Footer: LuxuryFooter,
  },
};

export { LuxuryHeroSection, LuxuryVehicleCard, LuxuryFleetGrid, LuxuryFeaturesSection, LuxuryFooter };

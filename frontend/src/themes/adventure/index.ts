import { ThemeDefinition } from "@/lib/themes/types";
import { AdventureHeroSection } from "./HeroSection";
import { AdventureVehicleCard } from "./VehicleCard";
import { AdventureFleetGrid } from "./FleetGrid";
import { AdventureFeaturesSection } from "./FeaturesSection";
import { AdventureFooter } from "./Footer";

export const adventureTheme: ThemeDefinition = {
  id: "adventure",
  name: "All-Terrain Adventure",
  description: "Rugged outdoorsy aesthetic optimized for 4x4s, expedition vehicles, and camper conversions.",
  category: "adventure",
  accentColor: "#2D5A27",
  previewImage: "/themes/previews/adventure.jpg",
  components: {
    HeroSection: AdventureHeroSection,
    VehicleCard: AdventureVehicleCard,
    FleetGrid: AdventureFleetGrid,
    FeaturesSection: AdventureFeaturesSection,
    Footer: AdventureFooter,
  },
};

export {
  AdventureHeroSection,
  AdventureVehicleCard,
  AdventureFleetGrid,
  AdventureFeaturesSection,
  AdventureFooter,
};

import { ThemeDefinition } from "@/lib/themes/types";
import { MinimalHeroSection } from "./HeroSection";
import { MinimalVehicleCard } from "./VehicleCard";
import { MinimalFleetGrid } from "./FleetGrid";
import { MinimalFeaturesSection } from "./FeaturesSection";
import { MinimalFooter } from "./Footer";

export const minimalTheme: ThemeDefinition = {
  id: "minimal",
  name: "Pure Minimal",
  description: "Ultra-lean, content-first layout with clean whitespace, typography focus, and maximum speed.",
  category: "minimal",
  accentColor: "#18181B",
  previewImage: "/themes/previews/minimal.jpg",
  components: {
    HeroSection: MinimalHeroSection,
    VehicleCard: MinimalVehicleCard,
    FleetGrid: MinimalFleetGrid,
    FeaturesSection: MinimalFeaturesSection,
    Footer: MinimalFooter,
  },
};

export {
  MinimalHeroSection,
  MinimalVehicleCard,
  MinimalFleetGrid,
  MinimalFeaturesSection,
  MinimalFooter,
};

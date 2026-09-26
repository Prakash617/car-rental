import { ThemeDefinition } from "@/lib/themes/types";
import { ClassicHeroSection } from "./HeroSection";
import { ClassicVehicleCard } from "./VehicleCard";
import { ClassicFleetGrid } from "./FleetGrid";
import { ClassicFeaturesSection } from "./FeaturesSection";
import { ClassicFooter } from "./Footer";

export const classicTheme: ThemeDefinition = {
  id: "classic",
  name: "Heritage Classic",
  description: "Timeless traditional car hire elegance with warm leather tones and balanced proportions.",
  category: "classic",
  accentColor: "#8B5A2B",
  previewImage: "/themes/previews/classic.jpg",
  components: {
    HeroSection: ClassicHeroSection,
    VehicleCard: ClassicVehicleCard,
    FleetGrid: ClassicFleetGrid,
    FeaturesSection: ClassicFeaturesSection,
    Footer: ClassicFooter,
  },
};

export {
  ClassicHeroSection,
  ClassicVehicleCard,
  ClassicFleetGrid,
  ClassicFeaturesSection,
  ClassicFooter,
};

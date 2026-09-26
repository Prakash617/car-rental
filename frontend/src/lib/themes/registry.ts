import { ThemeDefinition } from "./types";
import { luxuryTheme } from "@/themes/luxury";
import { modernTheme } from "@/themes/modern";
import { adventureTheme } from "@/themes/adventure";
import { urbanTheme } from "@/themes/urban";
import { classicTheme } from "@/themes/classic";
import { minimalTheme } from "@/themes/minimal";

export interface ThemeMeta {
  id: string;
  name: string;
  description: string;
  category: "luxury" | "modern" | "classic" | "adventure" | "urban" | "minimal";
  previewImage: string;
  accentColor: string;
}

export const THEME_REGISTRY: Record<string, ThemeMeta> = {
  luxury: {
    id: "luxury",
    name: "Luxury Concierge",
    description: "Cinematic, editorial styling with champagne gold accents, rich dark palettes, and refined typography.",
    category: "luxury",
    previewImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
    accentColor: "#D4AF37",
  },
  modern: {
    id: "modern",
    name: "Modern Mobility",
    description: "High-contrast Scandinavian design with crisp geometric layouts, rapid filters, and vibrant cobalt touches.",
    category: "modern",
    previewImage: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=600&q=80",
    accentColor: "#2563EB",
  },
  classic: {
    id: "classic",
    name: "Heritage Classic",
    description: "Timeless traditional car hire elegance with warm leather tones and balanced proportions.",
    category: "classic",
    previewImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    accentColor: "#8B5A2B",
  },
  adventure: {
    id: "adventure",
    name: "All-Terrain Adventure",
    description: "Rugged outdoorsy aesthetic optimized for 4x4s, expedition vehicles, and camper conversions.",
    category: "adventure",
    previewImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    accentColor: "#2D5A27",
  },
  urban: {
    id: "urban",
    name: "Urban Pulse",
    description: "Dynamic city mobility theme tailored for electric fleets, micro-rentals, and daily commuters.",
    category: "urban",
    previewImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    accentColor: "#06B6D4",
  },
  minimal: {
    id: "minimal",
    name: "Pure Minimal",
    description: "Ultra-lean, content-first layout with clean whitespace, typography focus, and maximum speed.",
    category: "minimal",
    previewImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
    accentColor: "#18181B",
  },
};

export const THEME_DEFINITIONS: Record<string, ThemeDefinition> = {
  luxury: luxuryTheme,
  modern: modernTheme,
  classic: classicTheme,
  adventure: adventureTheme,
  urban: urbanTheme,
  minimal: minimalTheme,
};

export function getThemeMeta(themeId: string): ThemeMeta {
  return THEME_REGISTRY[themeId] || THEME_REGISTRY.luxury;
}

export function getAllThemes(): ThemeMeta[] {
  return Object.values(THEME_REGISTRY);
}

export function getThemeDefinition(themeId?: string): ThemeDefinition {
  if (themeId && themeId in THEME_DEFINITIONS) {
    return THEME_DEFINITIONS[themeId];
  }
  return THEME_DEFINITIONS.luxury;
}

export function getThemeHeadingFont(activeTheme?: string): string {
  if (activeTheme === "luxury" || activeTheme === "classic") {
    return "font-serif";
  }
  if (activeTheme === "adventure") {
    return "font-mono";
  }
  return "font-sans font-bold";
}


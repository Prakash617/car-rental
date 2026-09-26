---
name: theme-system
description: Architecture and workflows for multi-theme registry, dynamic theme loading, live previewing, and CSS variable branding tokens.
---

# Multi-Theme System Playbook

## 1. Core Abstraction
The theme system guarantees absolute decoupling between:
1. **Theme**: Structural layout code, hero composition, vehicle card arrangement, and typography pairings (stored in `src/themes/`).
2. **Branding**: Tenant-specific color palettes (primary/accent HSL), company logo, and hero imagery (configured via dashboard).
3. **Content**: Real database entities (vehicles, branches, rates, reviews).

## 2. Dynamic Component Dispatching
The layout router dynamically imports the active theme:
```typescript
import { getThemeDefinition } from "@/lib/themes/registry";

export default async function TenantHomePage({ params }: { params: { tenant: string } }) {
  const websiteConfig = await getTenantWebsiteConfig();
  const theme = await getThemeDefinition(websiteConfig.active_theme);
  
  const { HeroSection, FleetCatalog } = theme.components;
  return (
    <main>
      <HeroSection config={websiteConfig} />
      <FleetCatalog />
    </main>
  );
}
```

## 3. Safe Live Preview Engine
When previewing a theme:
- The preview engine must read from ephemeral session parameters (`?theme_preview=modern`) rather than mutating the database.
- The preview banner provides a visual sandbox with "Activate for Tenant" and "Exit Preview" controls.

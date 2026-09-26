---
name: frontend-design
description: Premium design direction, typography scale, spacing systems, and aesthetic principles for automotive luxury and SaaS applications.
---

# Premium Frontend Design Guidelines

## 1. Aesthetic Direction: Beyond Generic AI Templates
- **No Cliche Tropes**: Avoid excessive purple/cyan mesh gradients, ungrounded floating cards, extreme blur glassmorphism, and cartoonish 3D elements.
- **Editorial Automotive Character**: Emulate high-end automotive editorial magazines and luxury mobility brands (Aston Martin, Porsche, Polestar, Genesis).
- **Intentional Contrast**: Pair deep, solid background hues with razor-sharp micro-borders (`border border-white/[0.08]` or `border-zinc-200/80`).

## 2. Typography Hierarchy
- **Luxury Theme**: High-contrast pairing of sophisticated serif display typography (`Playfair Display` or `Cormorant Garamond`) for hero headlines, with refined geometric sans (`Inter` or `Plus Jakarta Sans`) for specs, rates, and body text.
- **Modern Theme**: High-energy, neo-grotesque sans (`Space Grotesk` or `Plus Jakarta Sans`) with tight letter spacing (`tracking-tight`) for an agile, tech-forward feel.
- **Tabular Numerics**: Always apply `font-mono tabular-nums` to pricing figures, odometer readings, and dates to eliminate horizontal layout jitter.

## 3. Five Screen States Standard
Never design a screen with only happy path data. Every view must specify:
1. `loading`: Skeleton structure replicating real content layout.
2. `empty`: Contextual messaging with clear actionable recovery button.
3. `success`: Reassuring confirmation state with primary forward action.
4. `error`: Human-readable explanation with explicit retry trigger.
5. `disabled`: Visually dimmed with cursor feedback and tooltip explanation.

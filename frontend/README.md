# Car Rental SaaS — Frontend Application

Production-grade Next.js 15 App Router frontend for the multi-tenant Car Rental SaaS platform.

---

## Architectural Highlights

- **Next.js 15 App Router**: Server Components by default for superior SEO, instantaneous TTFB, and zero client bundle overhead for static views.
- **Dynamic Multi-Theme Engine**: Pure code layouts decoupled from database models. Supports Luxury, Modern, Classic, Adventure, Urban, and Minimal experiences with non-destructive live previewing.
- **Centralized Typed API Client**: All data communication passes through `lib/api/client.ts`, preserving Host headers for backend tenant resolution.
- **Tailwind CSS + shadcn/ui**: Accessible, customizable design tokens bound to dynamic CSS variables.
- **Motion & Accessibility**: WCAG 2.1 AA keyboard operability, ARIA attributes, and reduced-motion compliance.

---

## Directory Layout

```text
frontend/
├── src/
│   ├── app/                 # Next.js App Router (Public portals & Dashboard)
│   ├── components/          # UI primitives, layout, and domain components
│   ├── themes/              # Modular theme implementations (Luxury, Modern, etc.)
│   ├── lib/                 # API client, auth, tenant resolution, theme registry
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript domain interfaces
│   └── config/              # Site and design configuration
├── public/                  # Static assets and icons
├── tests/                   # Component and unit tests
├── e2e/                     # Playwright end-to-end tests
├── Dockerfile               # Multi-stage standalone container
└── package.json
```

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Run build check**:
   ```bash
   npm run build
   ```

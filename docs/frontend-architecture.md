# Next.js App Router & Frontend Architecture

## 1. Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/                 # Tenant Public Website (Renter Facing)
│   │   │   ├── layout.tsx            # Public layout injecting theme & branding CSS vars
│   │   │   ├── page.tsx              # Tenant Home (Theme resolved dynamically)
│   │   │   ├── fleet/
│   │   │   │   ├── page.tsx          # Filterable vehicle catalog (RSC)
│   │   │   │   └── [slug]/page.tsx   # Detailed vehicle view & spec sheet (RSC)
│   │   │   ├── book/
│   │   │   │   └── page.tsx          # Multi-step booking checkout flow
│   │   │   ├── locations/            # Branch list & interactive maps
│   │   │   └── contact/              # Tenant contact form & business hours
│   │   │
│   │   ├── (dashboard)/              # Tenant Management Console (Staff Facing)
│   │   │   ├── layout.tsx            # Dashboard shell: Sidebar, Header, Breadcrumbs
│   │   │   ├── overview/             # KPI summary, active rentals, alerts
│   │   │   ├── bookings/             # Reservation tables, calendar, check-in modal
│   │   │   ├── fleet/                # Vehicle catalog, add vehicle form, status
│   │   │   ├── customers/            # Renter directory, driver license verification
│   │   │   ├── branches/             # Branch depot management
│   │   │   ├── pricing/              # Rates, seasonal rules, coupons
│   │   │   ├── maintenance/          # Work orders & service logs
│   │   │   ├── theme/                # Theme picker, visual customizer, live preview
│   │   │   ├── team/                 # Staff invitations & role management
│   │   │   └── settings/             # Business profile, currency, timezone, tax
│   │   │
│   │   ├── (auth)/                   # Authentication flows
│   │   │   ├── login/page.tsx        # Unified login
│   │   │   ├── invite/page.tsx       # Staff invitation acceptance
│   │   │   └── reset-password/       # Password recovery
│   │   │
│   │   ├── api/                      # Next.js Route Handlers (Edge proxies)
│   │   ├── layout.tsx                # Root layout, fonts, Providers
│   │   └── not-found.tsx             # 404 handler
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (Button, Dialog, Sheet, etc.)
│   │   ├── dashboard/                # Management console components & data tables
│   │   ├── navigation/               # Navbar, Header, Sidebar, Breadcrumbs
│   │   └── shared/                   # Empty states, Error boundaries, Skeletons
│   │
│   ├── themes/                       # Theme implementations
│   │   ├── luxury/                   # Luxury Theme components & styles
│   │   ├── modern/                   # Modern Theme components & styles
│   │   └── ...                       # Classic, Adventure, Urban, Minimal
│   │
│   ├── lib/
│   │   ├── api/                      # Centralized typed API client
│   │   ├── auth/                     # Session & token handlers
│   │   ├── tenant/                   # Tenant domain resolution utilities
│   │   ├── themes/                   # Theme registry & resolver
│   │   └── validation/               # Zod validation schemas
│   │
│   └── types/                        # Shared TypeScript interfaces
```

---

## 2. Server Components vs Client Components

To optimize Time-to-First-Byte (TTFB) and prevent layout shift:

| Component Type | Rendering Mode | Justification |
| :--- | :--- | :--- |
| **Fleet Catalog Page** | Server Component (RSC) | Fetches vehicles server-side, pre-renders SEO metadata, eliminates client loading spinners. |
| **Vehicle Filter Bar** | Client Component (`"use client"`) | Captures URL search params, category toggles, price range sliders. |
| **Vehicle Detail View** | Server Component (RSC) | Generates OpenGraph meta tags, pre-populates specs, fast SSR. |
| **Booking Checkout Form** | Client Component (`"use client"`) | Manages step transitions, date picker state, credit card element, client-side Zod validation. |
| **Dashboard Data Tables** | Client Component (`"use client"`) | Dynamic sorting, column filtering, row selection, bulk actions via `@tanstack/react-table`. |
| **Theme Preview Bar** | Client Component (`"use client"`) | Manages non-destructive preview toggles and instant style injection. |

---

## 3. Centralized API Client Architecture

All network communication routes through a strongly-typed API client in `frontend/src/lib/api/client.ts`:

```typescript
// frontend/src/lib/api/client.ts
import { headers } from "next/headers";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("host") || process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";

  const url = new URL(`/api/v1${endpoint}`, process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");
  
  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.append(key, String(val));
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Host": host, // Preserves the tenant host domain for Django TenantMainMiddleware
      ...options.headers,
    },
    cache: options.cache ?? "no-store",
  });

  const body = await response.json();
  if (!response.ok) {
    throw new ApiError(body.error?.code || "API_ERROR", body.error?.message, response.status);
  }

  return body.data as T;
}
```

---

## 4. Design System & CSS Variables

Tenants customize their branding via CSS custom properties dynamically injected into the root HTML tag:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --accent: 210 40% 96.1%;
  --radius: 0.5rem;
}

/* Dynamically overridden by tenant branding */
[data-tenant-branding="true"] {
  --primary: var(--tenant-primary-hsl);
  --accent: var(--tenant-accent-hsl);
  --font-heading: var(--tenant-font-family);
}
```

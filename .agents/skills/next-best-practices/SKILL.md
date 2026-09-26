---
name: next-best-practices
description: Core architectural standards, conventions, Server/Client component boundaries, and performance patterns for Next.js 15 App Router.
---

# Next.js 15 App Router Best Practices

## 1. Component Paradigm
- **Default to Server Components (RSC)**: Treat all components in `src/app` as Server Components unless interactivity (`onClick`, `onChange`, `useState`, `useEffect`) is strictly required.
- **Push `"use client"` to the Leaves**: Do not mark whole pages or layouts as client components. Extract interactive widgets (e.g. `FilterBar`, `DatePicker`, `ThemeToggle`) into dedicated client components.
- **Avoid Waterfall Requests**: Fetch parallel data using `Promise.all()` in Server Components rather than serial `await` calls.

## 2. Dynamic Routing & Layouts
- Use Route Groups `(public)` and `(dashboard)` to isolate layout trees without altering the URL path.
- Provide contextual `loading.tsx` (using matching skeleton UI) and `error.tsx` (with reset boundaries) for every route segment.
- Utilize `not-found.tsx` with clear tenant branding for missing vehicles or invalid URLs.

## 3. Data Fetching & Caching
- Forward the tenant `Host` header on every server-side `fetch()` call to ensure Django routes to the correct tenant schema.
- Explicitly declare cache policies: `cache: "no-store"` for real-time fleet availability and bookings; `next: { revalidate: 3600 }` for static theme metadata.

## 4. Metadata & SEO
- Export `generateMetadata()` on dynamic pages (`/fleet/[slug]`) to generate dynamic OpenGraph tags, vehicle title, and descriptions based on tenant data.

/**
 * Centralized, type-safe query key factory for TanStack Query.
 * Ensures consistent cache scoping and effortless invalidation across tenant storefront and dashboard.
 */
export const queryKeys = {
  vehicles: {
    all: ["vehicles"] as const,
    list: (filters?: Record<string, unknown>) => ["vehicles", "list", filters ?? {}] as const,
    detail: (id: string) => ["vehicles", "detail", id] as const,
  },
  branches: {
    all: ["branches"] as const,
    list: () => ["branches", "list"] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (filters?: Record<string, unknown>) => ["bookings", "list", filters ?? {}] as const,
    detail: (referenceOrId: string) => ["bookings", "detail", referenceOrId] as const,
    quote: (params: Record<string, unknown>) => ["bookings", "quote", params] as const,
  },
  maintenance: {
    all: ["maintenance"] as const,
    list: (filters?: Record<string, unknown>) => ["maintenance", "list", filters ?? {}] as const,
  },
  domains: {
    all: ["domains"] as const,
    list: () => ["domains", "list"] as const,
  },
  website: {
    config: () => ["website", "config"] as const,
    pages: () => ["website", "pages"] as const,
  },
};

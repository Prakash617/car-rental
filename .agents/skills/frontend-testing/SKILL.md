---
name: frontend-testing
description: Playwright E2E automation patterns, Vitest component testing, user event simulations, and mocking contracts.
---

# Frontend Testing & Quality Playbook

## 1. Testing Layers
- **Unit & Component Tests**: Vitest + React Testing Library for testing pure utilities (e.g. date formatting, pricing math) and isolated component interactions (e.g. date picker selection, coupon code input).
- **End-to-End Tests**: Playwright for end-to-end user journeys (booking checkout, tenant login, vehicle CRUD).

## 2. Playwright Best Practices
- **Role-Based Locators**: Query elements using accessible roles (`page.getByRole('button', { name: 'Reserve Now' })`) rather than fragile CSS classes or XPaths.
- **Network Mocking & Fixtures**: Intercept `/api/v1/*` requests using `page.route()` to test network errors, loading skeletons, and edge case scenarios offline.
- **Visual Regression Testing**: Capture snapshots of key theme layouts (Luxury Hero, Modern Fleet) to detect unintentional design regressions.

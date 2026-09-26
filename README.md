# Car Rental SaaS — Multi-Tenant Fleet & Booking Platform

A production-grade, multi-tenant Car Rental Software-as-a-Service (SaaS) platform built for independent car rental companies worldwide.

Each tenant operates in complete schema isolation with their own branded public booking website, fleet management, reservations engine, branch operations, pricing algorithms, maintenance workflows, team roles, and customizable theme experiences.

---

## 1. Repository Architecture

Per strict architectural separation, **frontend** and **backend** are maintained as **two independent Git repositories** within this monorepo workspace:

```text
car-rental-saas/
├── frontend/             # Next.js 15 App Router Frontend (Independent Git repo)
│   ├── .git/
│   ├── src/
│   │   ├── app/          # Next.js App Router (Public Websites & Dashboard)
│   │   ├── components/   # UI Primitives, Dashboard & Theme Components
│   │   ├── themes/       # Multi-Theme Implementations (Luxury, Modern, etc.)
│   │   └── lib/          # API Client, Auth, Tenant Resolution, Theme Engine
│   └── package.json
│
├── backend/              # Django / Django REST Framework Backend (Independent Git repo)
│   ├── .git/
│   ├── apps/
│   │   ├── platform/     # Public Schema Apps (Tenants, Domains, Plans, Themes)
│   │   └── tenant/       # Tenant Schema Apps (Vehicles, Bookings, Pricing, etc.)
│   ├── config/           # Django settings, URLs, Celery, WSGI/ASGI
│   ├── common/           # Middleware, Permissions, Custom Exceptions, Pagination
│   ├── integrations/     # Payments, Storage, Email, SMS, Maps
│   └── pyproject.toml    # uv package configuration
│
├── infrastructure/       # Docker Compose, Redis, Postgres & Nginx configurations
│   ├── docker-compose.yml
│   └── env.example
│
├── docs/                 # Architectural Blueprints & System Specifications
│   ├── architecture.md
│   ├── multi-tenancy.md
│   ├── database.md
│   ├── api.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── booking-system.md
│   ├── pricing.md
│   ├── payments.md
│   ├── notifications.md
│   ├── theme-system.md
│   ├── frontend-architecture.md
│   ├── deployment.md
│   ├── security.md
│   └── testing.md
│
├── .agents/              # Agent Workflows, Persona Specifications & Skills
│   ├── agents/           # Specialized Backend & Frontend Agent Definitions
│   └── skills/           # Engineering Skills & Design Playbooks
│
└── README.md             # This document
```

---

## 2. Core Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Backend Framework** | Django 5.x + Django REST Framework | Mature ORM, robust admin, secure session & JWT authentication |
| **Multi-Tenancy** | `django-tenants` | Schema-per-tenant PostgreSQL database isolation |
| **Database** | PostgreSQL 16+ | Native schemas, row-level locking, JSONB, tsrange concurrency constraints |
| **Asynchronous Engine** | Celery + Celery Beat + Redis | Tenant-isolated background jobs, scheduled audits & reminders |
| **Caching & Locking** | Redis 7+ | Distributed locking, rate limiting, tenant-partitioned cache keys |
| **API Documentation** | `drf-spectacular` (OpenAPI 3.0) | Automated schema generation and client typing |
| **Package Manager** | `uv` (Python) / `npm` (Node) | High-performance reproducible dependency resolution |
| **Frontend Framework** | Next.js 15+ (App Router) + TypeScript | Hybrid Server/Client Components, dynamic tenant resolution |
| **Styling & UI Primitives** | Tailwind CSS + shadcn/ui + Radix UI | Accessible, zero-runtime tokens, customizable themes |
| **Motion & Interaction** | Motion (Framer Motion) | Micro-interactions, cinematic reveals, accessible motion |
| **Form & Schema Validation**| React Hook Form + Zod | Type-safe client/server payload validation |

---

## 3. High-Level System Architecture

```text
                                   INTERNET
                                      │
                         Host: tenant.platform.com
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │     Next.js Frontend      │
                        │    (App Router Edge)      │
                        └─────────────┬─────────────┘
                                      │
                      Proxied API / Host Header preserved
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │     Django REST API       │
                        │ TenantResolver Middleware │
                        └─────────────┬─────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
       ┌─────────────────────────────┐  ┌─────────────────────────────┐
       │     PostgreSQL Database     │  │       Redis 7 Cache         │
       │                             │  │                             │
       │ ┌─────────────────────────┐ │  │  • Tenant-keyed caches      │
       │ │ Public Schema:          │ │  │  • Distributed Locks        │
       │ │ Tenants, Domains, Users │ │  │  • Celery Broker            │
       │ └─────────────────────────┘ │  └──────────────┬──────────────┘
       │ ┌─────────────────────────┐ │                 │
       │ │ Tenant Schemas:         │ │                 ▼
       │ │ Vehicles, Bookings,     │ │  ┌─────────────────────────────┐
       │ │ Pricing, Payments, etc. │ │  │     Celery Workers & Beat   │
       │ └─────────────────────────┘ │  │  • Tenant-aware tasks       │
       └─────────────────────────────┘  │  • Periodic automated jobs  │
                                        └─────────────────────────────┘
```

---

## 4. Multi-Tenant Schema Separation

Tenant isolation is our highest-priority architectural guarantee:

1. **Public Schema**: Contains shared platform data:
   - Tenant metadata (`TenantModel`), Domain mapping (`DomainModel`)
   - Platform Users (`User`), Global Subscription Plans, Global Themes
2. **Tenant Schemas (`tenant_<id>`)**: Each tenant receives an entirely isolated PostgreSQL schema:
   - Memberships & Roles, Branches, Vehicles, Customers, Bookings, Pricing rules, Payments, Maintenance logs, Tenant Website settings, Audit trails.
3. **No Cross-Schema Querying**: Every request executes strictly inside the tenant schema resolved by domain hostname.
4. **Cache Partitioning**: Redis keys are explicitly scoped: `tenant:{tenant_id}:{resource}:{id}`.

---

## 5. Development Phases Roadmap

- [x] **Phase 0 — Architecture & Workspace Audit**: Architectural specifications, agent definitions, skills, repository blueprint.
- [x] **Phase 1 — Repository Initialization**: Initialize `frontend/` (.git) and `backend/` (.git), Docker Compose, env files.
- [x] **Phase 2 — Backend Infrastructure**: Django settings, PostgreSQL + django-tenants foundation, Redis, Celery & Celery Beat.
- [x] **Phase 3 — Authentication & Tenancy Core**: Unified User, Tenant, Domain, Membership, Roles, schema routing, isolation tests.
- [x] **Phase 4 — Rental Business Core**: Branches, Vehicles, Customers, Booking engine, Pricing service, Concurrency protection.
- [x] **Phase 5 — Payments & Notifications**: Payment provider abstraction, webhooks, idempotency, email & notification pipeline.
- [x] **Phase 6 — REST API & OpenAPI**: DRF ViewSets, serializers, permissions, pagination, filtering, OpenAPI 3.0 schema.
- [x] **Phase 7 — Frontend Foundation**: Next.js App Router, centralized API client, design system tokens, auth flow.
- [x] **Phase 8 — Premium Tenant Dashboard**: Complete back-office management console for rental operators.
- [x] **Phase 9 — Theme Engine**: Next.js Theme Registry, dynamic layout resolution, branding injection, live preview.
- [x] **Phase 10 — Luxury Theme**: Premium editorial automotive public website theme.
- [x] **Phase 11 — Modern Theme**: Clean, conversion-focused contemporary public website theme.
- [x] **Phase 12 — Additional Themes**: Classic, Adventure, Urban, Minimal themes.
- [x] **Phase 13 — Website Customization & CMS**: Visual branding controls, content blocks, SEO settings.
- [x] **Phase 14 — Custom Domains**: Secure SSL domain onboarding, CNAME verification, routing.
- [x] **Phase 15 — Security, Audit & Production Hardening**: Pentest verification, isolation audit, benchmark suite.

---

## 6. Architecture Documentation Index

Read the comprehensive architectural documentation in [`docs/`](./docs/):
- [Master Architecture Specification](./docs/architecture.md)
- [PostgreSQL Schema Multi-Tenancy](./docs/multi-tenancy.md)
- [Database Schema & Constraints](./docs/database.md)
- [REST API Standards & Error Handling](./docs/api.md)
- [Identity & Unified Authentication](./docs/authentication.md)
- [Role-Based Access Control (RBAC)](./docs/authorization.md)
- [Booking Engine & Concurrency Protection](./docs/booking-system.md)
- [Dynamic Pricing Engine](./docs/pricing.md)
- [Payment Gateway Abstraction & Ledger](./docs/payments.md)
- [Notification & Email Pipeline](./docs/notifications.md)
- [Frontend Multi-Theme Engine](./docs/theme-system.md)
- [Next.js App Router Architecture](./docs/frontend-architecture.md)
- [Docker & Production Deployment](./docs/deployment.md)
- [Security Hardening & Threat Model](./docs/security.md)
- [Comprehensive Testing Strategy](./docs/testing.md)

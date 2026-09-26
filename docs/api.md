# REST API Standards & OpenAPI Architecture

## 1. Global Conventions

1. **Prefix**: All application endpoints are versioned under `/api/v1/`.
2. **Protocol**: JSON payloads over HTTPS with strict `Content-Type: application/json`.
3. **Tenant Context**: Inferred strictly via incoming HTTP `Host` header.
4. **Idempotency**: All mutating financial and booking requests accept an `Idempotency-Key: <UUID>` header.

---

## 2. Standardized Response Formats

Every API response follows a consistent envelope structure.

### 2.1 Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "e81d7f1c-7212-4f81-a583-659ef8b0821b",
    "booking_reference": "BK-984210",
    "status": "confirmed",
    "total_price": "249.00"
  },
  "meta": {
    "timestamp": "2026-09-23T15:30:00Z"
  }
}
```

### 2.2 Paginated List Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "d73a8a3a-1811-4f11-b41e-3652617f6e3c",
      "brand": "Porsche",
      "model": "911 Carrera",
      "daily_rate": "350.00",
      "status": "available"
    }
  ],
  "pagination": {
    "count": 42,
    "page": 1,
    "page_size": 20,
    "total_pages": 3,
    "next": "https://tenant.platform.com/api/v1/vehicles/?page=2",
    "previous": null
  },
  "meta": {
    "timestamp": "2026-09-23T15:30:00Z"
  }
}
```

### 2.3 Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_UNAVAILABLE",
    "message": "The selected vehicle is already booked for the specified dates.",
    "details": {
      "conflicting_period": {
        "start": "2026-09-25T10:00:00Z",
        "end": "2026-09-28T10:00:00Z"
      }
    }
  },
  "meta": {
    "timestamp": "2026-09-23T15:30:00Z"
  }
}
```

---

## 3. Standard Error Codes Catalog

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Request payload failed schema or serializer validation. |
| `401 Unauthorized` | `UNAUTHENTICATED` | Missing, expired, or invalid JWT or session token. |
| `403 Forbidden` | `PERMISSION_DENIED` | Caller lacks the role or object permission in this tenant. |
| `403 Forbidden` | `TENANT_SUSPENDED` | The tenant subscription is inactive or cancelled. |
| `404 Not Found` | `NOT_FOUND` | The requested resource or domain does not exist. |
| `409 Conflict` | `BOOKING_UNAVAILABLE` | Concurrency check or date overlap detected for vehicle. |
| `409 Conflict` | `IDEMPOTENCY_CONFLICT` | A request with the same idempotency key is currently processing. |
| `422 Unprocessable`| `PAYMENT_FAILED` | Gateway rejected transaction (e.g. card declined). |
| `429 Too Many Req` | `RATE_LIMIT_EXCEEDED` | Request threshold reached for tenant or IP. |
| `500 Server Error` | `INTERNAL_SERVER_ERROR`| Unhandled error. Internal details masked from client. |

---

## 4. Endpoint Structure & RBAC Matrix

### 4.1 Public Endpoints (Renter Portal)
| Method | Path | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/website/config/` | Anonymous | Tenant branding, active theme, contact info, SEO |
| `GET` | `/api/v1/branches/` | Anonymous | Available pickup and return locations |
| `GET` | `/api/v1/vehicles/` | Anonymous | Filterable catalog of active vehicles |
| `GET` | `/api/v1/vehicles/{id}/` | Anonymous | Detailed vehicle specifications and gallery |
| `POST` | `/api/v1/pricing/quote/` | Anonymous | Calculates dynamic quote for dates and options |
| `POST` | `/api/v1/bookings/checkout/` | Anonymous/Customer | Atomically reserve vehicle and initialize payment |
| `GET` | `/api/v1/bookings/lookup/{ref}/` | Customer | Public lookup of reservation status via ref + email |

### 4.2 Protected Tenant Dashboard Endpoints
| Method | Path | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/v1/dashboard/overview/` | Staff+ | KPI aggregations, fleet utilization, overdue alerts |
| `CRUD` | `/api/v1/dashboard/fleet/` | Staff+ / Manager+ | Full fleet lifecycle, pricing, plate, maintenance |
| `CRUD` | `/api/v1/dashboard/bookings/` | Staff+ | Manage reservations, state transitions, manual edits |
| `CRUD` | `/api/v1/dashboard/customers/`| Staff+ | Customer verification, license documents, history |
| `CRUD` | `/api/v1/dashboard/pricing/` | Manager+ | Custom seasonal rates, discount codes, deposit rules |
| `GET/POST` | `/api/v1/dashboard/maintenance/`| Staff+ | Maintenance schedules, work orders, expense logs |
| `GET/PUT` | `/api/v1/dashboard/theme/` | Admin+ | Theme selection, custom branding, live preview toggle |
| `CRUD` | `/api/v1/dashboard/team/` | Owner / Admin | Manage staff invites, role assignments, removals |
| `GET` | `/api/v1/dashboard/audit/` | Admin+ | Immutable operational audit logs |

---

## 5. OpenAPI & Schema Generation

Using `drf-spectacular`:
- Schema JSON/YAML: `/api/v1/schema/`
- Interactive Swagger UI: `/api/v1/schema/swagger-ui/`
- Interactive Redoc: `/api/v1/schema/redoc/`
All serializers are strongly typed with descriptive field summaries and validation rules.

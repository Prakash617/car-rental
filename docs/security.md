# Security Hardening & Threat Model Specification

## 1. Security Architecture & Threat Model

| Threat Category | Potential Attack Vector | Platform Countermeasure |
| :--- | :--- | :--- |
| **Cross-Tenant Data Leakage** | Tenant A attempts to read or mutate Tenant B assets by spoofing IDs. | **PostgreSQL Schema Isolation**: Objects reside in physically separate schemas. Querying an ID from another tenant yields an automatic `404 Not Found`. |
| **Tenant Host Spoofing** | Attacker injects forged `Host` or `X-Forwarded-Host` headers to access another tenant schema. | **Edge Proxy Normalization**: Ingress proxy strictly validates `Host` against trusted platform wildcard and verified custom domain CNAME records before forwarding. |
| **Broken Object Level Auth (BOLA/IDOR)** | Authenticated staff attempts to alter bookings at a branch they are not assigned to. | **Server-Side Membership Scoping**: Permission classes verify branch assignments on every mutation request. |
| **Mass Assignment** | Client submits unauthorized fields (e.g. `is_platform_admin=true`, `daily_rate=0.01`). | **Strict DRF Serializers**: Explicit `fields` whitelist on all serializers with read-only protections on critical attributes. |
| **SQL & Schema Injection** | User input injected into schema switcher or raw SQL queries. | **Zero Raw SQL String Concatenation**: Schema names are strictly validated against `^[a-z0-9_]{1,63}$` and managed exclusively by `django-tenants`. |
| **Malicious File Uploads** | Attacker uploads web shell disguised as a vehicle JPEG image. | **Magic Byte & MIME Inspection**: Files are validated via `python-magic`, stripped of EXIF metadata, renamed to random UUIDs, and served from dedicated S3 buckets with `Content-Disposition: attachment` or strict image headers. |
| **Credential Brute Force** | Dictionary attack against login endpoints. | **Redis Sliding-Window Rate Limiting**: Exponential backoff and IP/email lockout after 5 consecutive failures. |
| **CSRF & Token Exfiltration**| XSS script steals authentication tokens from `localStorage`. | **HttpOnly, SameSite=Lax Cookies**: Tokens cannot be read by JavaScript. Double-submit cookie patterns protect mutating calls. |
| **Payment Webhook Tampering** | Attacker replays fake checkout success webhook to activate unpaid bookings. | **Cryptographic Signatures + Idempotency Ledger**: Webhooks verify HMAC SHA256 signatures and reject duplicate event IDs. |

---

## 2. File Upload Security Controls

Vehicles, customer driver licenses, and branding assets must undergo rigorous inspection:
```python
import magic
from rest_framework.exceptions import ValidationError

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"], # For contracts / licenses
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 # 5 MB

def validate_uploaded_document(file_obj):
    if file_obj.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError("File size exceeds 5 MB limit.")

    # Read first 2048 bytes for magic signature inspection
    header = file_obj.read(2048)
    file_obj.seek(0)
    detected_mime = magic.from_buffer(header, mime=True)

    if detected_mime not in ALLOWED_MIME_TYPES:
        raise ValidationError(f"Unsupported file type: {detected_mime}")
```

---

## 3. Operational Audit Logging

Every security-sensitive state change generates an immutable record in `apps.tenant.audit`:

```json
{
  "id": "c1f73b8e-3608-41df-a212-70b9ebfa3921",
  "actor_id": "b2f671c5-8f6a-4933-bf46-9d3e8e19e072",
  "actor_email": "admin@acmerentals.com",
  "action": "VEHICLE_RATE_MODIFIED",
  "target_type": "Vehicle",
  "target_id": "d73a8a3a-1811-4f11-b41e-3652617f6e3c",
  "changes": {
    "daily_rate": {"old": "120.00", "new": "150.00"}
  },
  "ip_address": "198.51.100.42",
  "user_agent": "Mozilla/5.0 ...",
  "created_at": "2026-09-23T15:45:00Z"
}
```
Audit logs cannot be updated or deleted by any tenant role, ensuring uncompromised forensic integrity.

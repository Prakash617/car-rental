# Payment Gateway Abstraction & Ledger Architecture

## 1. Architectural Principles

1. **Strict PCI-DSS Compliance**: Under zero circumstances does the platform handle, store, or transmit raw card numbers, CVVs, or expiration dates. All payment intake occurs via client-side tokenization (e.g. Stripe Elements) or hosted redirect gateways (e.g. eSewa, Khalti, PayPal).
2. **Provider Abstraction**: A unified `PaymentProvider` interface abstracts all gateway-specific API communication behind uniform contracts.
3. **Idempotency & Replay Defense**: All mutating payment intents and incoming webhook events are recorded in an immutable ledger with unique constraint verification.

---

## 2. Payment Provider Strategy Pattern

```mermaid
classDiagram
    class PaymentService {
        +create_payment_intent(booking, provider_name, amount)
        +capture_payment(payment_id)
        +refund_payment(payment_id, amount, reason)
        +authorize_security_deposit(booking, amount)
        +release_security_deposit(payment_id)
    }

    class PaymentProvider {
        <<interface>>
        +create_intent(booking, amount, currency, metadata)
        +confirm_intent(provider_ref)
        +refund(provider_ref, amount)
        +verify_webhook_signature(headers, payload)
        +parse_webhook_event(payload)
    }

    class StripeProvider {
        +create_intent()
        +confirm_intent()
        +refund()
    }

    class EsewaProvider {
        +create_intent()
        +confirm_intent()
        +refund()
    }

    class KhaltiProvider {
        +create_intent()
        +confirm_intent()
        +refund()
    }

    class CashBankProvider {
        +create_intent()
        +confirm_intent()
        +refund()
    }

    PaymentService --> PaymentProvider
    PaymentProvider <|-- StripeProvider
    PaymentProvider <|-- EsewaProvider
    PaymentProvider <|-- KhaltiProvider
    PaymentProvider <|-- CashBankProvider
```

---

## 3. Webhook Ingestion & Idempotency Pipeline

Webhooks are untrusted inbound requests. They require rigorous verification and idempotent handling:

```mermaid
sequenceDiagram
    autonumber
    participant Gateway as Payment Gateway (Stripe/eSewa/Khalti)
    participant Edge as Edge Webhook Ingress
    participant WebhookHandler as Webhook Verification Controller
    participant Ledger as Idempotency Ledger
    participant Celery as Celery Asynchronous Queue
    participant BookingSvc as Booking & Payment Service

    Gateway->>Edge: POST /api/v1/payments/webhooks/{provider}/ (Signature in headers)
    Edge->>WebhookHandler: Forward raw payload & headers
    WebhookHandler->>WebhookHandler: Cryptographically verify signature with secret
    alt Invalid Signature
        WebhookHandler-->>Gateway: HTTP 400 Bad Request (Drop)
    end
    WebhookHandler->>Ledger: INSERT INTO webhook_event (event_id, provider) VALUES (...)
    alt Duplicate Event ID (Conflict)
        WebhookHandler-->>Gateway: HTTP 200 OK (Acknowledge already processed)
    end
    WebhookHandler->>Celery: Dispatch process_payment_event.delay(event_id, tenant_schema)
    WebhookHandler-->>Gateway: HTTP 200 OK (Accepted)
    Celery->>BookingSvc: Update Booking to Confirmed & Record Succeeded Transaction
```

---

## 4. Security Deposit Authorization Lifecycle

Unlike immediate payment charges, car rental requires pre-authorizing security deposits:
1. **Pre-Authorization**: At pickup, deposit amount (e.g. $500) is placed on hold using `capture_method="manual"`.
2. **Hold Window**: Valid for 7 days (Stripe) or re-authorized automatically for long rentals.
3. **Settlement**:
   - **No Damages / Full Return**: Hold is cancelled immediately via API call. Renter pays zero.
   - **Tolls / Late Return / Scratches**: Partial capture executed for the exact damage amount; remaining balance released.

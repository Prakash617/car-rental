# Comprehensive Testing Strategy & Isolation Verification

## 1. Testing Pyramid & Principles

To guarantee that the SaaS platform is enterprise-ready, testing is structured into four rigorous layers:

```mermaid
pyramid
    title Testing Pyramid
    E2E & Playwright Tests: 10%
    API & Integration Tests: 25%
    Tenant Isolation & Concurrency Tests: 25%
    Unit & Service Engine Tests: 40%
```

---

## 2. Mandatory Tenant Isolation Test Suite

Tenant isolation is the core security promise of the system. Dedicated automated test suites rigorously verify isolation at both the database schema and API layers:

```python
import pytest
from apps.tenant.vehicles.models import Vehicle

@pytest.mark.django_db
class TestTenantIsolation:
    def test_cross_tenant_vehicle_isolation(self, tenant_a, tenant_b, client_a, client_b):
        """
        Vehicles created in Tenant A must never be visible, accessible,
        or mutable by Tenant B.
        """
        # 1. Create vehicle in Tenant A
        with tenant_a.activate():
            veh_a = Vehicle.objects.create(
                brand="Audi",
                model="RS6 Avant",
                license_plate="TEN-A-01",
                daily_rate=220.00
            )

        # 2. Query Tenant B database directly
        with tenant_b.activate():
            assert not Vehicle.objects.filter(license_plate="TEN-A-01").exists()
            assert Vehicle.objects.filter(id=veh_a.id).first() is None

        # 3. Query Tenant B API using Tenant A's vehicle ID
        response = client_b.get(f"/api/v1/vehicles/{veh_a.id}/")
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "NOT_FOUND"

    def test_cross_tenant_cache_leakage_defense(self, tenant_a, tenant_b, cache_service):
        """
        Ensures Redis keys are strictly partitioned and cannot leak across tenants.
        """
        cache_service.set(tenant_id=tenant_a.id, key="fleet_summary", value={"count": 10})
        
        # Querying under Tenant B must return None
        leaked_data = cache_service.get(tenant_id=tenant_b.id, key="fleet_summary")
        assert leaked_data is None
```

---

## 3. High-Concurrency Double-Booking Test Suite

Simulates real-world race conditions where multiple customers attempt to book the identical vehicle simultaneously:

```python
import pytest
import threading
from concurrent.futures import ThreadPoolExecutor
from apps.tenant.bookings.services import create_booking_intent

@pytest.mark.django_db(transaction=True)
def test_concurrent_booking_collision_serialized(tenant_a, sample_vehicle, customer_1, customer_2):
    """
    Spawns concurrent worker threads attempting to reserve the same vehicle
    for the exact same time window. Exactly one must succeed with 201 Created;
    the other must receive 409 Conflict.
    """
    pickup = "2026-11-01T10:00:00Z"
    return_dt = "2026-11-05T10:00:00Z"
    results = []

    def attempt_reservation(customer):
        with tenant_a.activate():
            try:
                booking = create_booking_intent(
                    vehicle_id=sample_vehicle.id,
                    customer_id=customer.id,
                    pickup_datetime=pickup,
                    return_datetime=return_dt
                )
                results.append(("SUCCESS", booking.id))
            except Exception as e:
                results.append(("CONFLICT", str(e)))

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_reservation, customer_1)
        f2 = executor.submit(attempt_reservation, customer_2)
        f1.result()
        f2.result()

    successes = [r for r in results if r[0] == "SUCCESS"]
    conflicts = [r for r in results if r[0] == "CONFLICT"]

    assert len(successes) == 1, "Exactly one booking must succeed"
    assert len(conflicts) == 1, "The second concurrent booking must be rejected with conflict"
```

---

## 4. Test Execution Commands

```bash
# Run complete test suite with coverage
uv run pytest --cov=apps --cov-report=term-missing

# Run isolation tests specifically
uv run pytest tests/isolation/

# Run concurrency tests specifically
uv run pytest tests/concurrency/ -s

# Frontend component & E2E tests
npm run test
npx playwright test
```

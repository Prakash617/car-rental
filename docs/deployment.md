# Infrastructure, Docker & Production Deployment

## 1. Container Topology & Docker Compose

The platform is orchestrated via Docker Compose for local development and containerized production environments:

```mermaid
flowchart TD
    Internet((Internet / Ingress)) --> Nginx["Ingress Proxy (Nginx / Cloudflare)"]
    
    subgraph ContainerNetwork["Docker Internal Network (car_rental_net)"]
        Nginx -->|Port 3000| Frontend["frontend (Next.js 15)"]
        Nginx -->|Port 8000| Backend["backend (Django / Gunicorn)"]
        
        Frontend -->|Host Header Preserved| Backend
        
        Backend -->|Port 5432| Postgres[("postgres (PostgreSQL 16)")]
        Backend -->|Port 6379| Redis[("redis (Redis 7)")]
        
        CeleryWorker["celery_worker (Celery 5)"] --> Postgres
        CeleryWorker --> Redis
        
        CeleryBeat["celery_beat (Celery Beat)"] --> Redis
    end
```

---

## 2. Docker Service Definitions & Health Checks

1. **`postgres`**:
   - Image: `postgres:16-alpine`
   - Volume: `pg_data:/var/lib/postgresql/data`
   - Healthcheck: `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB`
2. **`redis`**:
   - Image: `redis:7-alpine`
   - Healthcheck: `redis-cli ping`
3. **`backend`**:
   - Built via multi-stage `Dockerfile` with `uv` for minimal image size and fast caching.
   - Depends on `postgres` and `redis` with `condition: service_healthy`.
   - Entrypoint: waits for PostgreSQL readiness, executes `python manage.py migrate_schemas`, starts Gunicorn with Uvicorn workers.
4. **`frontend`**:
   - Built via multi-stage `Dockerfile` with Next.js `output: "standalone"`.
   - Minimal distroless/alpine node runtime image.
5. **`celery_worker`**:
   - Shares backend image.
   - Command: `celery -A config worker --loglevel=info --concurrency=4`
6. **`celery_beat`**:
   - Shares backend image.
   - Command: `celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler`

---

## 3. Production Environment Variables Blueprint

```bash
# === Application Environment ===
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=generate_a_cryptographically_secure_50_character_random_string
ALLOWED_HOSTS=.platform.com,.company.com

# === Database ===
POSTGRES_DB=car_rental_prod
POSTGRES_USER=car_rental_usr
POSTGRES_PASSWORD=secure_production_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgres://car_rental_usr:secure_production_password@postgres:5432/car_rental_prod

# === Redis & Caching ===
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# === Email Configuration ===
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=sendgrid_api_key
DEFAULT_FROM_EMAIL=notifications@platform.com

# === Storage Provider ===
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=aws_access_key
AWS_SECRET_ACCESS_KEY=aws_secret_key
AWS_STORAGE_BUCKET_NAME=car-rental-saas-media
AWS_S3_REGION_NAME=us-east-1

# === Payment Gateways ===
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ESEWA_MERCHANT_ID=...
KHALTI_SECRET_KEY=...

# === Frontend Settings ===
NEXT_PUBLIC_API_URL=https://api.platform.com
NEXT_PUBLIC_APP_URL=https://platform.com
```

---

## 4. Graceful Shutdown & Zero-Downtime Rolling Deploys

- Gunicorn processes handle `SIGTERM` by finishing in-flight HTTP requests before exit.
- Celery workers handle `SIGTERM` via `warm shutdown`, finishing running booking transactions before terminating.
- Database migrations use backward-compatible column additions to prevent downtime during schema rollout.

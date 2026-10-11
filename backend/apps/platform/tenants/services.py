import logging

from django.db import connection, transaction
from django_tenants.utils import schema_context

from apps.platform.domains.models import Domain
from apps.platform.platform_users.models import PlatformUser
from apps.platform.tenants.models import Tenant
from apps.tenant.memberships.models import Membership, RoleChoices

logger = logging.getLogger(__name__)


class TenantProvisioningService:
    @classmethod
    def provision_tenant(cls, validated_data: dict) -> dict:
        """
        Atomically provisions a new tenant:
        1. Creates or resolves PlatformUser in public schema.
        2. Creates Tenant record and triggers PostgreSQL schema generation.
        3. Maps default subdomain.
        4. Activates tenant schema and creates Owner Membership.
        """
        # Ensure we are in the public schema when provisioning a tenant
        connection.set_schema_to_public()

        email = validated_data["email"].lower().strip()
        subdomain = validated_data["subdomain"].lower().strip()
        schema_name = f"tenant_{subdomain.replace('-', '_')}"

        with transaction.atomic():
            # 1. Resolve or create PlatformUser
            user = PlatformUser.objects.filter(email=email).first()
            if not user:
                user = PlatformUser.objects.create_user(
                    email=email,
                    password=validated_data["password"],
                    first_name=validated_data["first_name"],
                    last_name=validated_data["last_name"],
                    phone_number=validated_data.get("phone_number", ""),
                )
            elif validated_data.get("password"):
                user.set_password(validated_data["password"])
                user.save()

            # 2. Create Tenant (triggers PostgreSQL schema creation automatically)
            tenant = Tenant.objects.create(
                schema_name=schema_name,
                name=validated_data["company_name"],
                slug=subdomain,
                timezone=validated_data.get("timezone", "Asia/Kathmandu"),
                currency=validated_data.get("currency", "NPR"),
                is_active=True,
            )

            # 3. Create primary Domain mapping (subdomain.localhost for zero-config local access)
            domain_name = f"{subdomain}.localhost"
            domain = Domain.objects.create(
                domain=domain_name,
                tenant=tenant,
                is_primary=True,
                is_verified=True,
            )
            # Also create fallback platform.local domain
            Domain.objects.create(
                domain=f"{subdomain}.platform.local",
                tenant=tenant,
                is_primary=False,
                is_verified=True,
            )

        # 4. In tenant schema context, initialize owner membership, branch, website config & starter fleet
        with schema_context(tenant.schema_name):
            membership = Membership.objects.create(
                user_id=user.id,
                role=RoleChoices.OWNER,
                is_active=True,
            )

            try:
                from apps.tenant.branches.models import Branch
                from apps.tenant.websites.models import WebsiteConfig
                from apps.tenant.vehicles.models import Vehicle, VehicleStatus

                branch = Branch.objects.create(
                    name=f"{tenant.name} Main Branch",
                    code=f"{tenant.slug[:4].upper()}-01",
                    city="Kathmandu",
                    address_line1="Central Operations Hub",
                    phone=user.phone_number or "+977 980 000 0000",
                    email=user.email,
                )

                cfg = WebsiteConfig.objects.first()
                if not cfg:
                    cfg = WebsiteConfig.objects.create()
                cfg.hero_title = f"{tenant.name} Fleet & Car Rentals"
                cfg.hero_subtitle = f"Experience premium automotive hire with {tenant.name}. Seamless booking and pristine vehicles."
                cfg.active_theme = "luxury"
                cfg.primary_color = "#e11d2e"
                cfg.accent_color = "#b01524"
                cfg.support_email = user.email
                cfg.support_phone = user.phone_number or "+977 980 000 0000"
                cfg.save()

                starter_fleet = [
                    {
                        "license_plate": f"{tenant.slug[:3].upper()}-001",
                        "brand": "Porsche",
                        "model": "911 GT3 RS",
                        "year": 2024,
                        "category": "luxury",
                        "transmission": "automatic",
                        "fuel_type": "petrol",
                        "color": "Guards Red",
                        "seats": 2,
                        "doors": 2,
                        "daily_rate": 25000,
                        "rate_4h": 12000,
                        "rate_8h": 18000,
                        "status": VehicleStatus.AVAILABLE,
                        "is_verified": True,
                        "features": ["GPS", "Bluetooth", "Air Conditioner(AC)", "Launch Control"],
                        "images": [{"url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80", "is_primary": True, "caption": "Porsche 911 GT3 RS"}],
                    },
                    {
                        "license_plate": f"{tenant.slug[:3].upper()}-002",
                        "brand": "BMW",
                        "model": "M4 Competition",
                        "year": 2024,
                        "category": "luxury",
                        "transmission": "automatic",
                        "fuel_type": "petrol",
                        "color": "Isle of Man Green",
                        "seats": 4,
                        "doors": 2,
                        "daily_rate": 18000,
                        "rate_4h": 9000,
                        "rate_8h": 14000,
                        "status": VehicleStatus.AVAILABLE,
                        "is_verified": True,
                        "features": ["GPS", "Bluetooth", "Air Conditioner(AC)", "Head-Up Display"],
                        "images": [{"url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "is_primary": True, "caption": "BMW M4 Competition"}],
                    },
                    {
                        "license_plate": f"{tenant.slug[:3].upper()}-003",
                        "brand": "Land Rover",
                        "model": "Range Rover SV",
                        "year": 2024,
                        "category": "suv",
                        "transmission": "automatic",
                        "fuel_type": "hybrid",
                        "color": "Santorini Black",
                        "seats": 5,
                        "doors": 4,
                        "daily_rate": 22000,
                        "rate_4h": 11000,
                        "rate_8h": 16000,
                        "status": VehicleStatus.AVAILABLE,
                        "is_verified": True,
                        "features": ["GPS", "Bluetooth", "Air Conditioner(AC)", "Panoramic Roof"],
                        "images": [{"url": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80", "is_primary": True, "caption": "Range Rover SV"}],
                    },
                ]
                for car in starter_fleet:
                    Vehicle.objects.create(**car, branch=branch)
            except Exception as e:
                logger.warning(f"Could not seed default fleet for {tenant.schema_name}: {e}")

        logger.info(f"Successfully provisioned tenant {tenant.schema_name} with owner {user.email}")
        return {
            "tenant": tenant,
            "domain": domain,
            "user": user,
            "membership": membership,
        }

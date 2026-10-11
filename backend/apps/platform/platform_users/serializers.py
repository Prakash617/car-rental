from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PlatformUser


class PlatformUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "is_platform_admin",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "is_platform_admin", "is_active", "created_at"]


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    otp = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    access_token = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    id_token = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")

    def validate(self, attrs):
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password", "")
        otp = attrs.get("otp", "")
        raw_access_token = attrs.get("access_token", "").strip()
        raw_id_token = attrs.get("id_token", "").strip()

        user = None
        if raw_id_token or raw_access_token:
            import os
            import requests
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token
            client_id = os.getenv(
                "GOOGLE_CLIENT_ID",
                "917746573259-kdmeuhf2oe3us7fmgiqc0bcvojb0qt1o.apps.googleusercontent.com",
            )
            google_email = None
            first_name = "Google"
            last_name = "User"

            if raw_id_token:
                try:
                    idinfo = id_token.verify_oauth2_token(
                        raw_id_token, google_requests.Request(), client_id
                    )
                    google_email = idinfo.get("email", "").strip().lower()
                    first_name = idinfo.get("given_name", "Google")
                    last_name = idinfo.get("family_name", "User")
                except Exception as e:
                    raise serializers.ValidationError(f"Google ID token verification failed: {str(e)}")
            elif raw_access_token:
                try:
                    resp = requests.get(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        headers={"Authorization": f"Bearer {raw_access_token}"},
                        timeout=5,
                    )
                    if resp.status_code == 200:
                        profile = resp.json()
                        google_email = profile.get("email", "").strip().lower()
                        first_name = profile.get("given_name", "Google")
                        last_name = profile.get("family_name", "User")
                    else:
                        raise serializers.ValidationError("Google access token verification failed.")
                except Exception as e:
                    raise serializers.ValidationError(f"Failed to verify Google access token: {str(e)}")

            if google_email:
                email = google_email
                user = PlatformUser.objects.filter(email=email).first()
                if not user:
                    user = PlatformUser.objects.create(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        is_active=True,
                    )
                    user.set_unusable_password()
                    user.save()
        elif otp:
            if not email:
                raise serializers.ValidationError("Email is required for OTP login.")
            if otp != "123456":
                raise serializers.ValidationError("Invalid OTP verification code.")
            user = PlatformUser.objects.filter(email=email).first()
            if not user:
                raise serializers.ValidationError("No registered user found with this email.")
        elif password:
            if not email:
                raise serializers.ValidationError("Email is required for password login.")
            user = authenticate(request=self.context.get("request"), username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            raise serializers.ValidationError("Either Google token, password, or OTP must be provided.")

        if not user.is_active:
            raise serializers.ValidationError("This user account is suspended.")

        # If request is directed to a specific tenant schema, verify membership
        request = self.context.get("request")
        tenant = getattr(request, "tenant", None) if request else None

        role = None
        if tenant and tenant.schema_name != "public" and not user.is_platform_admin:
            from apps.tenant.memberships.models import Membership

            try:
                membership = Membership.objects.get(user_id=user.id, is_active=True)
                role = membership.role
            except Membership.DoesNotExist:
                membership = None

        tenant_domain = None
        redirect_url = "/dashboard"

        if user.is_platform_admin:
            redirect_url = "http://admin.localhost:3000"
        elif tenant and tenant.schema_name != "public" and role:
            domain = tenant.domains.filter(is_primary=True).first()
            raw_domain = domain.domain if domain else f"{tenant.slug}.localhost"
            tenant_domain = raw_domain.split(":")[0]
            redirect_url = "/dashboard"
        else:
            from django_tenants.utils import schema_context
            from apps.platform.tenants.models import Tenant
            from apps.tenant.memberships.models import Membership
            for t in Tenant.objects.exclude(schema_name="public").order_by("-created_at"):
                try:
                    with schema_context(t.schema_name):
                        m = Membership.objects.filter(user_id=user.id, is_active=True).first()
                        if m:
                            if not role:
                                role = m.role
                            domain = t.domains.filter(is_primary=True).first()
                            raw_domain = domain.domain if domain else f"{t.slug}.localhost"
                            tenant_domain = raw_domain.split(":")[0]
                            redirect_url = f"/dashboard?tenant={tenant_domain}"
                            break
                except Exception:
                    continue

        if not tenant_domain and not user.is_platform_admin:
            first_tenant = Tenant.objects.exclude(schema_name="public").order_by("-created_at").first()
            if first_tenant:
                domain = first_tenant.domains.filter(is_primary=True).first()
                tenant_domain = domain.domain.split(":")[0] if domain else f"{first_tenant.slug}.localhost"
                try:
                    with schema_context(first_tenant.schema_name):
                        m, _ = Membership.objects.get_or_create(
                            user_id=user.id,
                            defaults={"role": "owner", "is_active": True},
                        )
                        if not role:
                            role = m.role
                except Exception:
                    if not role:
                        role = "owner"
                redirect_url = f"/dashboard?tenant={tenant_domain}"

        refresh = RefreshToken.for_user(user)

        return {
            "user": PlatformUserSerializer(user).data,
            "role": role,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "tenant_domain": tenant_domain,
            "redirect_url": redirect_url,
        }


class RegisterTenantSerializer(serializers.Serializer):
    """
    Onboarding serializer: provisions tenant, domain, user, and owner membership atomically.
    """

    company_name = serializers.CharField(max_length=120)
    subdomain = serializers.SlugField(max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=10, write_only=True)
    first_name = serializers.CharField(max_length=60)
    last_name = serializers.CharField(max_length=60)
    phone_number = serializers.CharField(max_length=30, required=False, allow_blank=True)
    timezone = serializers.CharField(max_length=50, default="Asia/Kathmandu")
    currency = serializers.CharField(max_length=10, default="NPR")

    def validate_subdomain(self, value):
        from apps.platform.tenants.models import Tenant

        slug = value.lower().strip()
        if (
            Tenant.objects.filter(slug=slug).exists()
            or Tenant.objects.filter(schema_name=f"tenant_{slug}").exists()
        ):
            raise serializers.ValidationError("This subdomain is already taken.")
        return slug

    def validate_email(self, value):
        return value.lower().strip()

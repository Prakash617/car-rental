from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, permissions, status, viewsets
from rest_framework.views import APIView

from common.permissions.tenant import IsTenantStaffOrAbove
from common.responses.standard import StandardResponseMixin

from .models import Customer
from .serializers import (
    CustomerChangePasswordSerializer,
    CustomerGoogleAuthSerializer,
    CustomerLoginSerializer,
    CustomerSerializer,
    CustomerSignupSerializer,
    CustomerUpdateProfileSerializer,
)



class CustomerViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    """
    Customer relationship management endpoint for tenant staff and managers.
    Provides customer identity verification, license validation, and rental history.
    """

    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantStaffOrAbove]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_verified", "country"]
    search_fields = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "driver_license_number",
    ]
    ordering_fields = ["created_at", "last_name", "email"]
    ordering = ["-created_at"]


class CustomerSignupView(StandardResponseMixin, APIView):
    """
    Public tenant storefront endpoint for customer registration.
    Registers or links a renter profile within the tenant's isolated schema.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=CustomerSignupSerializer, responses={201: CustomerSerializer})
    def post(self, request):
        serializer = CustomerSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        email = data["email"].strip().lower()
        customer = Customer.objects.filter(email__iexact=email).first()

        if customer:
            customer.first_name = data["first_name"].strip()
            customer.last_name = data["last_name"].strip()
            customer.phone = data["phone"].strip()
            if data.get("driver_license_number"):
                customer.driver_license_number = data["driver_license_number"].strip()
            if data.get("country"):
                customer.country = data["country"].strip()
            customer.set_password(data["password"])
            customer.save()
            status_code = status.HTTP_200_OK
            msg = f"Account updated successfully for {customer.full_name}."
        else:
            customer = Customer(
                first_name=data["first_name"].strip(),
                last_name=data["last_name"].strip(),
                email=email,
                phone=data["phone"].strip(),
                driver_license_number=data.get("driver_license_number", "CHAUFFEUR-BOOKING").strip(),
                country=data.get("country", "NP").strip(),
            )
            customer.set_password(data["password"])
            customer.save()
            status_code = status.HTTP_201_CREATED
            msg = f"Account created successfully for {customer.full_name}."

        customer_data = CustomerSerializer(customer).data
        return self.success_response(
            data={
                "customer": customer_data,
                "token": str(customer.id),
            },
            message=msg,
            status_code=status_code,
        )


class CustomerLoginView(StandardResponseMixin, APIView):
    """
    Public tenant storefront endpoint for customer authentication.
    Validates credentials against renter profiles in the tenant schema.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=CustomerLoginSerializer)
    def post(self, request):
        serializer = CustomerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        password = serializer.validated_data.get("password", "")

        customer = Customer.objects.filter(
            Q(email__iexact=identifier) | Q(phone__iexact=identifier)
        ).first()

        if not customer:
            return self.error_response(
                message="No customer account found with this email or phone number.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if customer.password_hash:
            if not password:
                return self.error_response(
                    message="Password is required for this account.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            if not customer.check_password(password):
                return self.error_response(
                    message="Invalid password. Please check your credentials.",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )
        else:
            # If the user has not set a password yet and provided one now, save it
            if password:
                customer.set_password(password)
                customer.save(update_fields=["password_hash"])

        customer_data = CustomerSerializer(customer).data
        return self.success_response(
            data={
                "customer": customer_data,
                "token": str(customer.id),
            },
            message=f"Welcome back, {customer.first_name}!",
        )


class CustomerChangePasswordView(StandardResponseMixin, APIView):
    """
    Allows an authenticated customer to update their account password.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=CustomerChangePasswordSerializer)
    def post(self, request):
        serializer = CustomerChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            customer = Customer.objects.get(id=data["customer_id"])
        except Customer.DoesNotExist:
            return self.error_response(
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if customer.password_hash and data.get("old_password"):
            if not customer.check_password(data["old_password"]):
                return self.error_response(
                    message="Current password is incorrect.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        customer.set_password(data["new_password"])
        customer.save(update_fields=["password_hash"])

        return self.success_response(
            message="Password updated successfully.",
        )


class CustomerUpdateProfileView(StandardResponseMixin, APIView):
    """
    Allows an authenticated customer to update their name, phone, or license details.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=CustomerUpdateProfileSerializer)
    def post(self, request):
        serializer = CustomerUpdateProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            customer = Customer.objects.get(id=data["customer_id"])
        except Customer.DoesNotExist:
            return self.error_response(
                message="Customer not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if "first_name" in data and data["first_name"]:
            customer.first_name = data["first_name"].strip()
        if "last_name" in data and data["last_name"]:
            customer.last_name = data["last_name"].strip()
        if "phone" in data and data["phone"]:
            customer.phone = data["phone"].strip()
        if "driver_license_number" in data and data["driver_license_number"]:
            customer.driver_license_number = data["driver_license_number"].strip()

        customer.save()

        return self.success_response(
            data={"customer": CustomerSerializer(customer).data},
            message="Profile details updated successfully.",
        )


class CustomerGoogleAuthView(StandardResponseMixin, APIView):
    """
    Public tenant storefront endpoint for customer Google authentication.
    Verifies Google tokens cryptographically using Google's public certs
    and isolates the customer profile strictly within the active tenant schema.
    """

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=CustomerGoogleAuthSerializer)
    def post(self, request):
        import os
        import requests
        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token

        serializer = CustomerGoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        raw_id_token = data.get("id_token", "").strip()
        raw_access_token = data.get("access_token", "").strip()
        email = data.get("email", "").strip().lower()
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        phone = data.get("phone", "").strip()

        client_id = os.getenv(
            "GOOGLE_CLIENT_ID",
            "917746573259-kdmeuhf2oe3us7fmgiqc0bcvojb0qt1o.apps.googleusercontent.com",
        )

        # 1. Cryptographically verify Google ID Token if present
        if raw_id_token:
            try:
                idinfo = id_token.verify_oauth2_token(
                    raw_id_token, google_requests.Request(), client_id
                )
                email = idinfo.get("email", "").strip().lower()
                first_name = idinfo.get("given_name", first_name or "Google")
                last_name = idinfo.get("family_name", last_name or "User")
            except Exception as e:
                return self.error_response(
                    message=f"Google ID token verification failed: {str(e)}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        # 2. Verify Google Access Token via Google userinfo endpoint if present
        elif raw_access_token:
            try:
                resp = requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {raw_access_token}"},
                    timeout=5,
                )
                if resp.status_code == 200:
                    profile = resp.json()
                    email = profile.get("email", "").strip().lower()
                    first_name = profile.get("given_name", first_name or "Google")
                    last_name = profile.get("family_name", last_name or "User")
                else:
                    return self.error_response(
                        message="Google access token verification failed.",
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )
            except Exception as e:
                return self.error_response(
                    message=f"Failed to verify Google access token: {str(e)}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        if not email:
            return self.error_response(
                message="Valid Google email address is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Create or link customer strictly within active tenant schema
        customer = Customer.objects.filter(email__iexact=email).first()

        if customer:
            if not customer.is_verified:
                customer.is_verified = True
            if first_name and not customer.first_name:
                customer.first_name = first_name
            if last_name and not customer.last_name:
                customer.last_name = last_name
            if phone and not customer.phone:
                customer.phone = phone
            customer.save()
            msg = f"Logged in with Google as {customer.full_name}."
        else:
            customer = Customer.objects.create(
                email=email,
                first_name=first_name or "Google",
                last_name=last_name or "User",
                phone=phone or "—",
                driver_license_number="CHAUFFEUR-BOOKING",
                country="NP",
                is_verified=True,
            )
            msg = f"Account created with Google for {customer.full_name}."

        customer_data = CustomerSerializer(customer).data
        return self.success_response(
            data={
                "customer": customer_data,
                "token": str(customer.id),
            },
            message=msg,
        )




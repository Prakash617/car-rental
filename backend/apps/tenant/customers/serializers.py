from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "driver_license_number",
            "license_expiry_date",
            "date_of_birth",
            "country",
            "is_verified",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at"]


class CustomerSignupSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=60)
    last_name = serializers.CharField(max_length=60)
    email = serializers.EmailField(max_length=255)
    phone = serializers.CharField(max_length=30)
    password = serializers.CharField(max_length=128, write_only=True, min_length=6)
    driver_license_number = serializers.CharField(max_length=50, required=False, default="CHAUFFEUR-BOOKING")
    country = serializers.CharField(max_length=2, required=False, default="NP")


class CustomerLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Email or Phone number")
    password = serializers.CharField(max_length=128, write_only=True, required=False, default="")


class CustomerChangePasswordSerializer(serializers.Serializer):
    customer_id = serializers.UUIDField()
    old_password = serializers.CharField(max_length=128, write_only=True, required=False, default="")
    new_password = serializers.CharField(max_length=128, write_only=True, min_length=6)


class CustomerUpdateProfileSerializer(serializers.Serializer):
    customer_id = serializers.UUIDField()
    first_name = serializers.CharField(max_length=60, required=False)
    last_name = serializers.CharField(max_length=60, required=False)
    phone = serializers.CharField(max_length=30, required=False)
    driver_license_number = serializers.CharField(max_length=50, required=False)


class CustomerGoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=False, default="", allow_blank=True)
    access_token = serializers.CharField(required=False, default="", allow_blank=True)
    email = serializers.EmailField(max_length=255, required=False, default="", allow_blank=True)
    first_name = serializers.CharField(max_length=60, required=False, default="", allow_blank=True)
    last_name = serializers.CharField(max_length=60, required=False, default="", allow_blank=True)
    phone = serializers.CharField(max_length=30, required=False, default="", allow_blank=True)
    google_id = serializers.CharField(max_length=128, required=False, default="", allow_blank=True)




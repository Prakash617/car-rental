from rest_framework import serializers

from .models import FAQ, BlogPost, CustomPage, WebsiteConfig


class WebsiteConfigSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    timezone = serializers.SerializerMethodField()

    class Meta:
        model = WebsiteConfig
        fields = [
            "id",
            "name",
            "active_theme",
            "primary_color",
            "accent_color",
            "font_heading",
            "logo_url",
            "favicon_url",
            "website_title",
            "support_email",
            "support_phone",
            "currency",
            "timezone",
            "hero_title",
            "hero_subtitle",
            "seo_meta_title",
            "seo_meta_description",
            "seo_keywords",
            "og_image_url",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]

    def get_name(self, obj):
        if getattr(obj, "website_title", None):
            return obj.website_title
        tenant = getattr(self.context.get("request"), "tenant", None)
        return tenant.name if tenant else "Apex Luxury Concierge"

    def get_currency(self, obj):
        tenant = getattr(self.context.get("request"), "tenant", None)
        return tenant.currency if tenant and tenant.currency else "NPR"

    def get_timezone(self, obj):
        tenant = getattr(self.context.get("request"), "tenant", None)
        return tenant.timezone if tenant and tenant.timezone else "Asia/Kathmandu"

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and "name" in request.data and not validated_data.get("website_title"):
            new_name = str(request.data["name"]).strip()
            if new_name:
                validated_data["website_title"] = new_name
                tenant = getattr(request, "tenant", None)
                if tenant and tenant.schema_name != "public":
                    tenant.name = new_name
                    tenant.save(update_fields=["name"])
        if request and "currency" in request.data:
            new_currency = str(request.data["currency"]).strip()
            if new_currency:
                tenant = getattr(request, "tenant", None)
                if tenant and tenant.schema_name != "public":
                    tenant.currency = new_currency
                    tenant.save(update_fields=["currency"])
        return super().update(instance, validated_data)


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = [
            "id",
            "question",
            "answer",
            "is_active",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CustomPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomPage
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "is_published",
            "show_in_navbar",
            "show_in_footer",
            "seo_title",
            "seo_description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "author_name",
            "author_avatar",
            "category",
            "tags",
            "read_time_minutes",
            "is_published",
            "views_count",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "views_count", "published_at", "created_at", "updated_at"]

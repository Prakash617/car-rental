import secrets
import uuid

from django.db import models

from apps.tenant.branches.models import Branch
from apps.tenant.customers.models import Customer
from apps.tenant.vehicles.models import Vehicle


class BookingStatus(models.TextChoices):
    PENDING = "pending", "Pending Confirmation / Payment"
    CONFIRMED = "confirmed", "Confirmed Reservation"
    ACTIVE = "active", "Active Rental (Checked Out)"
    COMPLETED = "completed", "Completed & Returned"
    CANCELLED = "cancelled", "Cancelled"
    REJECTED = "rejected", "Rejected / Expired"


class PaymentStatus(models.TextChoices):
    UNPAID = "unpaid", "Unpaid"
    PARTIALLY_PAID = "partially_paid", "Partially Paid"
    PAID = "paid", "Paid in Full"
    REFUNDED = "refunded", "Refunded"


class Booking(models.Model):
    """
    Core reservation record within the tenant schema.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_reference = models.CharField(
        "Reference Number", max_length=12, unique=True, db_index=True
    )

    vehicle = models.ForeignKey(Vehicle, on_delete=models.RESTRICT, related_name="bookings")
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, related_name="bookings")
    pickup_branch = models.ForeignKey(
        Branch, on_delete=models.RESTRICT, related_name="pickup_bookings", null=True, blank=True
    )
    return_branch = models.ForeignKey(
        Branch, on_delete=models.RESTRICT, related_name="return_bookings", null=True, blank=True
    )

    # Route & Trip Type (Sajilo Rental Marketplace Model)
    pickup_location = models.CharField("Pickup Location", max_length=120, default="Kathmandu", blank=True)
    destination_location = models.CharField("Destination", max_length=120, default="Pokhara", blank=True)
    stops = models.JSONField("Intermediate Stops", default=list, blank=True)
    trip_type = models.CharField("Trip Type", max_length=30, default="one_way")  # one_way, return, tour, marriage
    decoration_name = models.CharField("Marriage Decoration", max_length=100, blank=True, null=True)
    decoration_price = models.DecimalField("Decoration Price", max_digits=10, decimal_places=2, default=0.00)
    distance_km = models.DecimalField("Route Distance (km)", max_digits=8, decimal_places=2, default=0.00)

    # Customer snapshot (for instant inquiries & client dashboard)
    customer_name = models.CharField("Customer Name", max_length=120, blank=True, default="")
    customer_phone = models.CharField("Customer Phone", max_length=50, blank=True, default="")
    customer_email = models.EmailField("Customer Email", blank=True, default="")

    pickup_datetime = models.DateTimeField("Pickup Date & Time", db_index=True)
    return_datetime = models.DateTimeField("Return Date & Time", db_index=True)

    status = models.CharField(
        max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING
    )
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID
    )

    # Financial breakdown
    base_price = models.DecimalField("Base Rental Price", max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(
        "Discount Applied", max_digits=10, decimal_places=2, default=0.00
    )
    tax_amount = models.DecimalField("Tax Amount", max_digits=10, decimal_places=2, default=0.00)
    advance_amount = models.DecimalField("Advance Payment Required", max_digits=10, decimal_places=2, default=0.00)
    deposit_amount = models.DecimalField(
        "Security Deposit Required", max_digits=10, decimal_places=2, default=0.00
    )
    total_price = models.DecimalField("Total Payable Price", max_digits=10, decimal_places=2)

    # Operational notes & audit
    notes = models.TextField("Reservation Notes", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        ordering = ["-pickup_datetime"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(return_datetime__gt=models.F("pickup_datetime")),
                name="booking_return_after_pickup",
            )
        ]
        indexes = [
            models.Index(fields=["vehicle", "status"], name="idx_book_veh_status"),
            models.Index(fields=["pickup_datetime", "return_datetime"], name="idx_book_dates"),
            models.Index(fields=["customer"], name="idx_book_customer"),
        ]

    def __str__(self):
        return f"{self.booking_reference} - {self.vehicle} ({self.status})"

    @classmethod
    def generate_booking_reference(cls) -> str:
        """Generates a human-friendly unique reference code e.g. BK-784920"""
        for _ in range(10):
            code = f"BK-{secrets.randbelow(900000) + 100000}"
            if not cls.objects.filter(booking_reference=code).exists():
                return code
        return f"BK-{uuid.uuid4().hex[:8].upper()}"


class BookingAddon(models.Model):
    """Line items for extra services attached to a reservation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="addons")
    name = models.CharField("Add-on Name", max_length=100)
    price = models.DecimalField("Price", max_digits=10, decimal_places=2)
    quantity = models.PositiveSmallIntegerField(default=1)

    def __str__(self):
        return f"{self.name} x{self.quantity} (${self.price})"


class CarpoolRide(models.Model):
    """
    Published shared travel ride between cities/districts across Nepal.
    Matches Sajilo Rental Carpool marketplace architecture.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    origin_city = models.CharField("Departure City", max_length=100, default="Kathmandu", db_index=True)
    origin_point = models.CharField("Pickup Stop / Landmark", max_length=200, default="Kalanki / Koteshwor")
    destination_city = models.CharField("Arrival City", max_length=100, default="Pokhara", db_index=True)
    destination_point = models.CharField("Dropoff Stop / Landmark", max_length=200, default="Prithvi Chowk / Lakeside")
    departure_datetime = models.DateTimeField("Departure Date & Time", db_index=True)

    # Vehicle specifications
    vehicle_model = models.CharField("Vehicle Model", max_length=120, default="Toyota EV HiAce (14 Seater)")
    vehicle_type = models.CharField("Vehicle Category", max_length=50, default="EV Hiace")
    vehicle_image = models.TextField("Vehicle Photo URL", blank=True, default="")
    total_seats = models.PositiveIntegerField("Total Capacity", default=10)
    available_seats = models.PositiveIntegerField("Remaining Seats", default=4)
    price_per_seat = models.DecimalField("Fare per Passenger (NPR)", max_digits=10, decimal_places=2, default=950.00)

    # Driver profile
    driver_name = models.CharField("Driver Full Name", max_length=120, default="Ramesh Adhikari")
    driver_phone = models.CharField("Driver Phone", max_length=50, default="+977 9801234567")
    driver_rating = models.DecimalField("Driver Rating", max_digits=3, decimal_places=1, default=4.9)
    driver_trips = models.PositiveIntegerField("Completed Trips", default=145)
    is_driver_verified = models.BooleanField("Verified Chauffeur", default=True)

    # Features and policies
    features = models.JSONField("Amenities", default=list, blank=True)
    notes = models.TextField("Route Notes & Baggage Limit", blank=True, default="")
    status = models.CharField("Ride Status", max_length=20, default="active")  # active, full, completed, cancelled

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Carpool Ride"
        verbose_name_plural = "Carpool Rides"
        ordering = ["departure_datetime"]

    def __str__(self):
        return f"{self.origin_city} -> {self.destination_city} ({self.departure_datetime.strftime('%b %d %H:%M')})"


class CarpoolBookingRequest(models.Model):
    """
    Passenger booking request for reserved seat(s) on a published carpool ride.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.ForeignKey(CarpoolRide, on_delete=models.CASCADE, related_name="booking_requests")
    passenger_name = models.CharField("Passenger Name", max_length=120)
    passenger_phone = models.CharField("Contact Phone", max_length=50)
    passenger_email = models.EmailField("Email", blank=True, default="")
    seats_requested = models.PositiveIntegerField("Seats Reserved", default=1)
    pickup_point = models.CharField("Preferred Pickup Landmark", max_length=200, blank=True, default="")
    dropoff_point = models.CharField("Preferred Dropoff Landmark", max_length=200, blank=True, default="")
    total_amount = models.DecimalField("Total Fare (NPR)", max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField("Booking Request Status", max_length=20, default="approved")  # pending, approved, rejected
    notes = models.TextField("Passenger Request Notes", blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Carpool Booking Request"
        verbose_name_plural = "Carpool Booking Requests"
        ordering = ["-created_at"]


class CarpoolAlertSubscription(models.Model):
    """
    Route alert notification subscription when no rides are published for a route.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    origin_city = models.CharField("Origin City", max_length=100)
    destination_city = models.CharField("Destination City", max_length=100)
    preferred_date = models.DateField("Target Date", null=True, blank=True)
    phone = models.CharField("Alert Phone", max_length=50)
    email = models.EmailField("Alert Email", blank=True, default="")
    passenger_count = models.PositiveIntegerField("Seats Needed", default=1)
    is_active = models.BooleanField("Active Subscription", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Carpool Alert Subscription"
        verbose_name_plural = "Carpool Alert Subscriptions"
        ordering = ["-created_at"]


from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.tenant.pricing.services.calculator import PricingCalculatorService
from apps.tenant.vehicles.models import Vehicle
from common.permissions.tenant import IsTenantStaffOrAbove
from common.responses.standard import StandardResponseMixin

from .models import (
    Booking,
    BookingStatus,
    CarpoolAlertSubscription,
    CarpoolBookingRequest,
    CarpoolRide,
)
from .serializers import (
    BookingSerializer,
    CarpoolAlertSubscriptionSerializer,
    CarpoolBookingRequestSerializer,
    CarpoolRideSerializer,
    CreateBookingSerializer,
    QuoteRequestSerializer,
)
from .services.reservation import ReservationService


class QuoteView(StandardResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=QuoteRequestSerializer)
    def post(self, request):
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            vehicle = Vehicle.objects.get(id=data["vehicle_id"])
        except Vehicle.DoesNotExist:
            return self.error_response(
                message="Vehicle not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        quote = PricingCalculatorService.calculate_quote(
            vehicle=vehicle,
            pickup_datetime=data["pickup_datetime"],
            return_datetime=data["return_datetime"],
            addon_ids=data.get("addon_ids"),
            coupon_code=data.get("coupon_code"),
        )
        return self.success_response(data=quote)


class BookingViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    """
    Booking creation (open for public checkout) and lifecycle management (staff).
    Includes public lookup and cancellation.
    """

    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        "status",
        "payment_status",
        "vehicle",
        "pickup_branch",
        "return_branch",
    ]
    search_fields = [
        "booking_reference",
        "customer__first_name",
        "customer__last_name",
        "customer__email",
        "vehicle__license_plate",
    ]
    ordering_fields = ["created_at", "pickup_datetime", "total_price"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Booking.objects.select_related(
            "vehicle", "customer", "pickup_branch", "return_branch"
        ).prefetch_related("addons", "addons__addon")

    def get_permissions(self):
        if self.action in ["create", "lookup", "cancel", "my_bookings"]:
            return [AllowAny()]
        return [IsTenantStaffOrAbove()]

    @extend_schema(request=CreateBookingSerializer, responses={201: BookingSerializer})
    def create(self, request, *args, **kwargs):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        booking = ReservationService.create_reservation(
            vehicle_id=data["vehicle_id"],
            customer_data=data["customer"],
            pickup_branch_id=data.get("pickup_branch_id"),
            return_branch_id=data.get("return_branch_id"),
            pickup_datetime=data["pickup_datetime"],
            return_datetime=data["return_datetime"],
            pickup_location=data.get("pickup_location", ""),
            destination_location=data.get("destination_location", ""),
            stops=data.get("stops", []),
            trip_type=data.get("trip_type", "return"),
            decoration_name=data.get("decoration_name", ""),
            decoration_price=data.get("decoration_price", 0),
            distance_km=data.get("distance_km", 0),
            advance_amount=data.get("advance_amount", 0),
            addon_ids=data.get("addon_ids"),
            coupon_code=data.get("coupon_code"),
            notes=data.get("notes"),
        )

        return self.success_response(
            data=BookingSerializer(booking).data,
            message="Vehicle reservation initiated successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="my-bookings")
    def my_bookings(self, request):
        """
        Public lookup of customer reservations by email or phone.
        """
        from django.db.models import Q
        email = request.query_params.get("email", "").strip()
        phone = request.query_params.get("phone", "").strip()
        if not email and not phone:
            # If no param provided, return the most recent 10 bookings as demo/preview
            bookings = Booking.objects.select_related(
                "vehicle", "customer", "pickup_branch", "return_branch"
            ).prefetch_related("addons").order_by("-created_at")[:10]
            return self.success_response(data=BookingSerializer(bookings, many=True).data)

        q = Q()
        if email:
            q |= Q(customer__email__iexact=email) | Q(customer_email__iexact=email)
        if phone:
            q |= Q(customer__phone__icontains=phone) | Q(customer_phone__icontains=phone)

        bookings = Booking.objects.select_related(
            "vehicle", "customer", "pickup_branch", "return_branch"
        ).prefetch_related("addons").filter(q).order_by("-created_at")

        return self.success_response(data=BookingSerializer(bookings, many=True).data)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="email",
                description="Customer email address for verification",
                required=False,
                type=str,
            )
        ],
        responses={200: BookingSerializer},
    )
    @action(detail=False, methods=["get"], url_path=r"lookup/(?P<reference>[^/.]+)")
    def lookup(self, request, reference=None):
        """
        Public lookup of reservation status using booking reference and email verification.
        """
        email = request.query_params.get("email")
        query = Booking.objects.select_related(
            "vehicle", "customer", "pickup_branch", "return_branch"
        ).filter(booking_reference__iexact=reference)

        if email:
            query = query.filter(customer__email__iexact=email.strip())

        booking = query.first()
        if not booking:
            return self.error_response(
                message="No booking found with this reference number and email.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return self.success_response(data=BookingSerializer(booking).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """
        Cancels a pending or confirmed booking.
        """
        booking = self.get_object()
        if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
            return self.error_response(
                message=f"Cannot cancel booking with current status '{booking.status}'.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = BookingStatus.CANCELLED
        booking.save(update_fields=["status"])

        # Release vehicle status back to available if it was reserved
        if booking.vehicle.status == "reserved":
            booking.vehicle.status = "available"
            booking.vehicle.save(update_fields=["status"])

        from apps.tenant.audit.services import AuditService
        AuditService.log(
            actor_email=getattr(request.user, "email", "concierge@tenant.local"),
            action="CANCEL_BOOKING",
            resource_type="Booking",
            resource_id=str(booking.id),
            details={"reference": booking.booking_reference, "reason": request.data.get("reason", "")},
        )

        return self.success_response(
            data=BookingSerializer(booking).data,
            message="Booking cancelled successfully.",
        )

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """
        Staff action to confirm a pending booking.
        """
        booking = self.get_object()
        if booking.status != BookingStatus.PENDING:
            return self.error_response(
                message=f"Cannot confirm booking with current status '{booking.status}'.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = BookingStatus.CONFIRMED
        booking.save(update_fields=["status"])
        if booking.vehicle.status == "available":
            booking.vehicle.status = "reserved"
            booking.vehicle.save(update_fields=["status"])

        from apps.tenant.audit.services import AuditService
        AuditService.log(
            actor_email=getattr(request.user, "email", "concierge@tenant.local"),
            action="CONFIRM_BOOKING",
            resource_type="Booking",
            resource_id=str(booking.id),
            details={"reference": booking.booking_reference},
        )

        return self.success_response(
            data=BookingSerializer(booking).data,
            message="Reservation confirmed successfully.",
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """
        Staff action: customer has picked up vehicle; rental is now ACTIVE.
        """
        booking = self.get_object()
        if booking.status not in [BookingStatus.CONFIRMED, BookingStatus.PENDING]:
            return self.error_response(
                message=f"Cannot activate booking with current status '{booking.status}'.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = BookingStatus.ACTIVE
        booking.save(update_fields=["status"])
        booking.vehicle.status = "rented"
        booking.vehicle.save(update_fields=["status"])

        from apps.tenant.audit.services import AuditService
        AuditService.log(
            actor_email=getattr(request.user, "email", "concierge@tenant.local"),
            action="ACTIVATE_RENTAL",
            resource_type="Booking",
            resource_id=str(booking.id),
            details={"reference": booking.booking_reference, "vehicle": booking.vehicle.license_plate},
        )

        return self.success_response(
            data=BookingSerializer(booking).data,
            message="Rental contract activated. Vehicle marked as RENTED.",
        )

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """
        Staff action: customer has returned vehicle; rental is COMPLETED.
        """
        booking = self.get_object()
        if booking.status != BookingStatus.ACTIVE:
            return self.error_response(
                message=f"Cannot complete booking that is not currently active (status: '{booking.status}').",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = BookingStatus.COMPLETED
        booking.save(update_fields=["status"])
        booking.vehicle.status = "available"
        booking.vehicle.save(update_fields=["status"])

        from apps.tenant.audit.services import AuditService
        AuditService.log(
            actor_email=getattr(request.user, "email", "concierge@tenant.local"),
            action="COMPLETE_RENTAL",
            resource_type="Booking",
            resource_id=str(booking.id),
            details={"reference": booking.booking_reference, "vehicle": booking.vehicle.license_plate},
        )

        return self.success_response(
            data=BookingSerializer(booking).data,
            message="Rental marked as completed. Vehicle returned to fleet inventory.",
        )

    @action(detail=True, methods=["post"], url_path="assign-driver", permission_classes=[IsTenantStaffOrAbove])
    def assign_driver(self, request, pk=None):
        """
        Staff action: assign or change chauffeur name and phone for this booking.
        """
        booking = self.get_object()
        driver_name = request.data.get("driver_name", "").strip()
        driver_phone = request.data.get("driver_phone", "").strip()
        driver_license = request.data.get("driver_license", "").strip()

        if not driver_name:
            return self.error_response(
                message="Chauffeur name is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        booking.vehicle.driver_name = driver_name
        booking.vehicle.save(update_fields=["driver_name"])

        dispatch_note = f"[Chauffeur Dispatched]: {driver_name} (Phone: {driver_phone or '—'}, License: {driver_license or 'Verified'})"
        current_notes = booking.notes or ""
        if dispatch_note not in current_notes:
            booking.notes = f"{current_notes}\n{dispatch_note}".strip()
            booking.save(update_fields=["notes"])

        from apps.tenant.audit.services import AuditService
        AuditService.log(
            actor_email=getattr(request.user, "email", "concierge@tenant.local"),
            action="ASSIGN_CHAUFFEUR",
            resource_type="Booking",
            resource_id=str(booking.id),
            details={"reference": booking.booking_reference, "driver": driver_name},
        )

        return self.success_response(
            data=BookingSerializer(booking).data,
            message=f"Chauffeur {driver_name} assigned to booking {booking.booking_reference}.",
        )


class CarpoolRideViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    """
    Public Carpool & Shared Travel Marketplace endpoint matching sajilorental.com/carpool.
    Supports filtering by origin city, destination city, date, and seat count.
    Also handles passenger seat booking requests, driver ride publishing, and route alert subscriptions.
    """

    serializer_class = CarpoolRideSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["origin_city", "destination_city", "vehicle_type", "status"]
    search_fields = ["origin_city", "destination_city", "origin_point", "destination_point", "driver_name", "vehicle_model"]
    ordering_fields = ["departure_datetime", "price_per_seat", "available_seats"]
    ordering = ["departure_datetime"]

    def get_queryset(self):
        from django.utils import timezone
        import datetime

        # Ensure demo seed exists if table is empty
        if not CarpoolRide.objects.exists():
            now = timezone.now()
            default_rides = [
                {
                    "origin_city": "Kathmandu",
                    "origin_point": "Kalanki Chowk / Balkhu Gate",
                    "destination_city": "Pokhara",
                    "destination_point": "Prithvi Chowk / Lakeside Center",
                    "departure_datetime": now + datetime.timedelta(hours=4),
                    "vehicle_model": "Toyota EV HiAce Super Long",
                    "vehicle_type": "EV Hiace",
                    "vehicle_image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
                    "total_seats": 14,
                    "available_seats": 5,
                    "price_per_seat": 950.00,
                    "driver_name": "Rameshwor Thapa",
                    "driver_phone": "+977 9841238910",
                    "driver_rating": 4.9,
                    "driver_trips": 182,
                    "is_driver_verified": True,
                    "features": ["AC", "Luggage Storage", "EV Silent Drive", "Free Bottled Water"],
                    "notes": "Direct Mugling highway route. Max 1 medium suitcase per passenger.",
                },
                {
                    "origin_city": "Kathmandu",
                    "origin_point": "Koteshwor / Jadibuti Bus Stop",
                    "destination_city": "Chitwan (Bharatpur)",
                    "destination_point": "Chaubiskothi / Sauraha Gate",
                    "departure_datetime": now + datetime.timedelta(hours=6),
                    "vehicle_model": "Mahindra Scorpio S11 4x4",
                    "vehicle_type": "Scorpio",
                    "vehicle_image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
                    "total_seats": 7,
                    "available_seats": 3,
                    "price_per_seat": 1200.00,
                    "driver_name": "Dipesh Shrestha",
                    "driver_phone": "+977 9801928472",
                    "driver_rating": 4.8,
                    "driver_trips": 94,
                    "is_driver_verified": True,
                    "features": ["AC", "Spacious 4x4 Legroom", "Roof Luggage Carrier", "No Smoking"],
                    "notes": "Express travel to Bharatpur. Pickup from Koteshwor or Kalanki.",
                },
                {
                    "origin_city": "Pokhara",
                    "origin_point": "Lakeside Hallan Chowk",
                    "destination_city": "Kathmandu",
                    "destination_point": "Kalanki / Gongabu Bus Park",
                    "departure_datetime": now + datetime.timedelta(days=1, hours=2),
                    "vehicle_model": "Hyundai Ioniq 5 Luxury EV",
                    "vehicle_type": "Sedan Car (EV)",
                    "vehicle_image": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
                    "total_seats": 4,
                    "available_seats": 2,
                    "price_per_seat": 1600.00,
                    "driver_name": "Subash Gurung",
                    "driver_phone": "+977 9813894721",
                    "driver_rating": 5.0,
                    "driver_trips": 210,
                    "is_driver_verified": True,
                    "features": ["Executive EV Comfort", "Ultra Fast Route", "Phone Charger", "Air Conditioner"],
                    "notes": "Premium quiet EV ride from Lakeside to Kathmandu.",
                },
                {
                    "origin_city": "Kathmandu",
                    "origin_point": "Koteshwor Highway Stop",
                    "destination_city": "Dharan",
                    "destination_point": "Bhanu Chowk / Ghantaghar",
                    "departure_datetime": now + datetime.timedelta(days=1, hours=8),
                    "vehicle_model": "Toyota Coaster Deluxe Coach",
                    "vehicle_type": "Deluxe Bus",
                    "vehicle_image": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
                    "total_seats": 22,
                    "available_seats": 8,
                    "price_per_seat": 1500.00,
                    "driver_name": "Krishna Bahadur Rai",
                    "driver_phone": "+977 9842839102",
                    "driver_rating": 4.9,
                    "driver_trips": 320,
                    "is_driver_verified": True,
                    "features": ["Pushback Luxury Seats", "AC & Heating", "Large Trunk", "USB Ports"],
                    "notes": "BP Highway route via Sindhuli. Fast day journey to Dharan.",
                },
                {
                    "origin_city": "Kathmandu",
                    "origin_point": "Kalanki Ring Road",
                    "destination_city": "Butwal",
                    "destination_point": "Traffic Chowk / Milan Chowk",
                    "departure_datetime": now + datetime.timedelta(days=2, hours=3),
                    "vehicle_model": "Suzuki Ertiga Hybrid Smart",
                    "vehicle_type": "Mini Van",
                    "vehicle_image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
                    "total_seats": 6,
                    "available_seats": 4,
                    "price_per_seat": 1300.00,
                    "driver_name": "Anil KC",
                    "driver_phone": "+977 9857029384",
                    "driver_rating": 4.7,
                    "driver_trips": 87,
                    "is_driver_verified": True,
                    "features": ["AC", "Comfortable Seating", "Direct Narayanghat Route"],
                    "notes": "Smooth family-friendly ride to Butwal.",
                },
            ]
            for r in default_rides:
                CarpoolRide.objects.create(**r)

        include_all = self.request.query_params.get("all") in ["true", "1", "True"]
        status_filter = self.request.query_params.get("status")

        if include_all:
            qs = CarpoolRide.objects.all().order_by("-departure_datetime")
        elif status_filter:
            qs = CarpoolRide.objects.filter(status=status_filter).order_by("-departure_datetime")
        else:
            qs = CarpoolRide.objects.filter(status__in=["active", "full"]).order_by("departure_datetime")

        # Query filters
        origin = self.request.query_params.get("from") or self.request.query_params.get("origin_city")
        dest = self.request.query_params.get("to") or self.request.query_params.get("destination_city")
        date_str = self.request.query_params.get("date")
        seats = self.request.query_params.get("seats")

        if origin:
            qs = qs.filter(origin_city__icontains=origin.strip())
        if dest:
            qs = qs.filter(destination_city__icontains=dest.strip())
        if date_str:
            try:
                dt = datetime.date.fromisoformat(date_str)
                qs = qs.filter(departure_datetime__date=dt)
            except (ValueError, TypeError):
                pass
        if seats:
            try:
                s_int = int(seats)
                qs = qs.filter(available_seats__gte=s_int)
            except (ValueError, TypeError):
                pass

        return qs

    @action(detail=True, methods=["post"], url_path="request-seat", permission_classes=[AllowAny])
    def request_seat(self, request, pk=None):
        """
        Reserve seat(s) on a published carpool ride.
        Returns: 'Booking request sent — we will contact you soon.'
        """
        ride = self.get_object()
        data = request.data
        passenger_name = data.get("passenger_name", "").strip()
        passenger_phone = data.get("passenger_phone", "").strip()
        passenger_email = data.get("passenger_email", "").strip()
        pickup_point = data.get("pickup_point", ride.origin_point).strip()
        dropoff_point = data.get("dropoff_point", ride.destination_point).strip()
        notes = data.get("notes", "").strip()

        try:
            seats_requested = int(data.get("seats_requested", 1))
        except (ValueError, TypeError):
            seats_requested = 1

        if not passenger_name or not passenger_phone:
            return self.error_response(
                message="Passenger name and contact phone number are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if seats_requested <= 0:
            return self.error_response(
                message="At least 1 seat must be requested.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if ride.available_seats < seats_requested:
            return self.error_response(
                message=f"Only {ride.available_seats} seat(s) remain available on this vehicle.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = ride.price_per_seat * seats_requested

        booking_req = CarpoolBookingRequest.objects.create(
            ride=ride,
            passenger_name=passenger_name,
            passenger_phone=passenger_phone,
            passenger_email=passenger_email,
            seats_requested=seats_requested,
            pickup_point=pickup_point,
            dropoff_point=dropoff_point,
            total_amount=total_amount,
            status="approved",
            notes=notes,
        )

        # Decrement remaining seats
        ride.available_seats -= seats_requested
        if ride.available_seats == 0:
            ride.status = "full"
        ride.save(update_fields=["available_seats", "status"])

        return self.success_response(
            data={
                "request": CarpoolBookingRequestSerializer(booking_req).data,
                "ride": CarpoolRideSerializer(ride).data,
            },
            message="Booking request sent — we will contact you soon.",
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="subscribe-alert", permission_classes=[AllowAny])
    def subscribe_alert(self, request):
        """
        Subscribe for route notifications when no carpools match the user's travel date/route.
        """
        data = request.data
        origin = data.get("origin_city") or data.get("from", "Kathmandu")
        destination = data.get("destination_city") or data.get("to", "Pokhara")
        phone = data.get("phone", "").strip()
        email = data.get("email", "").strip()
        preferred_date = data.get("preferred_date")

        if not phone and not email:
            return self.error_response(
                message="Phone or email is required to receive route availability notifications.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        import datetime
        date_obj = None
        if preferred_date:
            try:
                date_obj = datetime.date.fromisoformat(preferred_date)
            except (ValueError, TypeError):
                pass

        subscription = CarpoolAlertSubscription.objects.create(
            origin_city=origin.strip(),
            destination_city=destination.strip(),
            preferred_date=date_obj,
            phone=phone,
            email=email,
            passenger_count=int(data.get("passenger_count", 1) or 1),
        )

        return self.success_response(
            data=CarpoolAlertSubscriptionSerializer(subscription).data,
            message="Subscribed to route alerts! We will notify you via SMS / Email once a vehicle is published.",
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="publish-ride", permission_classes=[AllowAny])
    def publish_ride(self, request):
        """
        Driver or fleet host publishing a new carpool departure.
        """
        data = request.data
        origin_city = data.get("origin_city", "").strip()
        destination_city = data.get("destination_city", "").strip()
        departure_datetime = data.get("departure_datetime")
        driver_name = data.get("driver_name", "").strip()
        driver_phone = data.get("driver_phone", "").strip()

        if not origin_city or not destination_city or not departure_datetime:
            return self.error_response(
                message="Departure city, destination city, and departure date/time are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if not driver_name or not driver_phone:
            return self.error_response(
                message="Driver name and direct phone number are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        from django.utils.dateparse import parse_datetime
        dt = parse_datetime(departure_datetime)
        if not dt:
            return self.error_response(
                message="Invalid departure_datetime format (use ISO 8601).",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        total_seats = int(data.get("total_seats", 4) or 4)
        available_seats = int(data.get("available_seats", total_seats) or total_seats)
        price_per_seat = float(data.get("price_per_seat", 1000.00) or 1000.00)

        ride = CarpoolRide.objects.create(
            origin_city=origin_city,
            origin_point=data.get("origin_point", f"{origin_city} Central").strip(),
            destination_city=destination_city,
            destination_point=data.get("destination_point", f"{destination_city} Central").strip(),
            departure_datetime=dt,
            vehicle_model=data.get("vehicle_model", "Standard Sedan / EV").strip(),
            vehicle_type=data.get("vehicle_type", "Sedan").strip(),
            vehicle_image=data.get("vehicle_image", "").strip(),
            total_seats=total_seats,
            available_seats=available_seats,
            price_per_seat=price_per_seat,
            driver_name=driver_name,
            driver_phone=driver_phone,
            driver_rating=4.9,
            driver_trips=12,
            is_driver_verified=True,
            features=data.get("features", ["AC", "Direct Route"]),
            notes=data.get("notes", "").strip(),
        )

        return self.success_response(
            data=CarpoolRideSerializer(ride).data,
            message=f"Shared ride from {origin_city} to {destination_city} published successfully!",
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="requests", permission_classes=[AllowAny])
    def list_requests(self, request):
        """
        List seat booking requests, optionally filtered by phone or email or ride_id.
        """
        qs = CarpoolBookingRequest.objects.select_related("ride").all().order_by("-created_at")
        phone = request.query_params.get("phone")
        email = request.query_params.get("email")
        ride_id = request.query_params.get("ride_id")
        req_status = request.query_params.get("status")

        if phone:
            qs = qs.filter(passenger_phone__icontains=phone.strip())
        if email:
            qs = qs.filter(passenger_email__iexact=email.strip())
        if ride_id:
            qs = qs.filter(ride_id=ride_id)
        if req_status:
            qs = qs.filter(status=req_status)

        return self.success_response(
            data=CarpoolBookingRequestSerializer(qs, many=True).data,
            message="Carpool booking requests retrieved",
        )

    @action(detail=False, methods=["post"], url_path=r"requests/(?P<req_id>[^/.]+)/status", permission_classes=[AllowAny])
    def update_request_status(self, request, req_id=None):
        """
        Update status of a seat booking request (pending, approved, rejected, cancelled).
        """
        req_obj = CarpoolBookingRequest.objects.select_related("ride").filter(id=req_id).first()
        if not req_obj:
            return self.error_response(message="Booking request not found", status_code=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status not in ["pending", "approved", "rejected", "cancelled"]:
            return self.error_response(message=f"Invalid status '{new_status}'", status_code=status.HTTP_400_BAD_REQUEST)

        old_status = req_obj.status
        req_obj.status = new_status
        req_obj.save(update_fields=["status"])

        # If transitioning to rejected or cancelled, restore remaining seats
        if new_status in ["rejected", "cancelled"] and old_status not in ["rejected", "cancelled"]:
            ride = req_obj.ride
            ride.available_seats = min(ride.total_seats, ride.available_seats + req_obj.seats_requested)
            if ride.status == "full" and ride.available_seats > 0:
                ride.status = "active"
            ride.save(update_fields=["available_seats", "status"])
        elif new_status == "approved" and old_status in ["rejected", "cancelled"]:
            ride = req_obj.ride
            ride.available_seats = max(0, ride.available_seats - req_obj.seats_requested)
            if ride.available_seats == 0:
                ride.status = "full"
            ride.save(update_fields=["available_seats", "status"])

        return self.success_response(
            data=CarpoolBookingRequestSerializer(req_obj).data,
            message=f"Request status updated to '{new_status}'",
        )

    @action(detail=False, methods=["get"], url_path="subscriptions", permission_classes=[AllowAny])
    def list_subscriptions(self, request):
        """
        List all route alert subscriptions for route planning.
        """
        qs = CarpoolAlertSubscription.objects.all().order_by("-created_at")
        return self.success_response(
            data=CarpoolAlertSubscriptionSerializer(qs, many=True).data,
            message="Route alert subscriptions retrieved",
        )

    @action(detail=True, methods=["post"], url_path="update-status", permission_classes=[AllowAny])
    def update_status(self, request, pk=None):
        """
        Update carpool departure status (active, full, completed, cancelled).
        """
        ride = self.get_object()
        new_status = request.data.get("status")
        if new_status not in ["active", "full", "completed", "cancelled"]:
            return self.error_response(message=f"Invalid ride status '{new_status}'", status_code=status.HTTP_400_BAD_REQUEST)
        ride.status = new_status
        ride.save(update_fields=["status"])
        return self.success_response(
            data=CarpoolRideSerializer(ride).data,
            message=f"Ride status changed to {new_status}",
        )

    @action(detail=True, methods=["delete", "post"], url_path="delete-ride", permission_classes=[AllowAny])
    def delete_ride(self, request, pk=None):
        """
        Delete a carpool departure.
        """
        ride = self.get_object()
        ride.delete()
        return self.success_response(
            data={"id": str(pk)},
            message="Ride deleted successfully",
        )


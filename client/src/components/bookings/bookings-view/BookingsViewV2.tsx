//types
import type { JSX } from "react";
import type { BookingMinimal } from "@/types/entities/booking.types";

//libs
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

//services
import { getPagedMinimalBookingsByDateRange } from "services/bookingServiceV2";

function BookingsViewV2(): JSX.Element {
  const { hotelId } = useParams<{ hotelId?: string }>();
  const [bookings, setBookings] = useState<BookingMinimal[]>([]);

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    getPagedMinimalBookingsByDateRange(hotelId, 0, 10)
      .then((response) => {
        if (response.isSuccessful) {
          setBookings(response.item?.pagedItems || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
  }, [hotelId]);

  useEffect(() => {
    console.log("Bookings updated:", bookings);
  }, [bookings]);

  return <div>BookingsViewV2</div>;
}

export default BookingsViewV2;

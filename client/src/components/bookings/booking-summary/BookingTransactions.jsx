import React from "react";
import EntityTransactionsView from "components/transactions/EntityTransactionsView";
import { BOOKING_STATUS_IDS } from "components/bookings/constants";

function BookingTransactions({ hotelId, booking, setBooking }) {
  return (
    <div>
      <h5>Transacciones</h5>
      <EntityTransactionsView
        hotelId={hotelId}
        entity={booking}
        setEntity={setBooking}
        showTotals={false}
        showAddButton={
          booking?.status?.id !== BOOKING_STATUS_IDS.CANCELLED &&
          booking?.status?.id !== BOOKING_STATUS_IDS.NO_SHOW &&
          booking?.status?.id !== BOOKING_STATUS_IDS.COMPLETED
        }
      />
    </div>
  );
}

export default BookingTransactions;

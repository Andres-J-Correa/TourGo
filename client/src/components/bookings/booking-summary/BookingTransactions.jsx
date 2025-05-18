import React from "react";
import EntityTransactionsView from "components/transactions/EntityTransactionsView";

function BookingTransactions({ hotelId, booking, setBooking }) {
  return (
    <div>
      <h5>Transacciones</h5>
      <EntityTransactionsView
        hotelId={hotelId}
        entity={booking}
        setEntity={setBooking}
        showTotals={false}
      />
    </div>
  );
}

export default BookingTransactions;

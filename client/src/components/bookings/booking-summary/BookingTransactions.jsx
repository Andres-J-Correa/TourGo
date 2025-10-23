import React from "react";
import EntityTransactionsView from "components/transactions/EntityTransactionsView";
import { BOOKING_STATUS_IDS } from "components/bookings/constants";
import { useLanguage } from "contexts/LanguageContext";

function BookingTransactions({ hotelId, booking, setBooking }) {
  const { t } = useLanguage();
  return (
    <div>
      <h5>{t("booking.transactions.title")}</h5>
      <EntityTransactionsView
        hotelId={hotelId}
        entity={booking}
        setEntity={setBooking}
        showTotals={false}
        showAddButton={
          booking?.status?.id === BOOKING_STATUS_IDS.ACTIVE ||
          booking?.status?.id === BOOKING_STATUS_IDS.ARRIVED
        }
      />
    </div>
  );
}

export default BookingTransactions;

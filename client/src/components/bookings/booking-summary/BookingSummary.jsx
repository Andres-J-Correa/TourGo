import React from "react";
import { Row, Col } from "reactstrap";

import { groupRoomBookings } from "components/bookings/booking-summary/helpers";
import CustomerInfo from "components/bookings/booking-summary/CustomerInfo";
import BookingDetails from "components/bookings/booking-summary/BookingDetails";
import BookingFinancials from "components/bookings/booking-summary/BookingFinancials";
import RoomList from "components/bookings/booking-summary/RoomList";
import BookingAuditableInfo from "components/bookings/booking-summary/BookingAuditableInfo";
import BookingGeneralCharges from "components/bookings/booking-summary/BookingGeneralCharges";
import { useLanguage } from "contexts/LanguageContext";

const BookingSummary = ({
  bookingData,
  roomBookings = [],
  extraCharges = [],
  parentSize = "lg",
}) => {
  const { customer } = bookingData || {};
  const groupedRooms = groupRoomBookings(roomBookings);
  const { t } = useLanguage();

  return (
    <>
      <Row>
        <Col xs={12} md={5} className="border-end">
          <CustomerInfo customer={customer} />
        </Col>

        <Col>
          <BookingDetails bookingData={bookingData} />
        </Col>
      </Row>

      <hr />
      {bookingData?.notes && (
        <>
          <Row>
            <Col>
              <strong>{t("booking.summary.notes")}</strong>
              <p>{bookingData?.notes}</p>
            </Col>
          </Row>
          <hr />
        </>
      )}

      <BookingFinancials bookingData={bookingData} />

      <hr />

      <RoomList
        rooms={groupedRooms}
        extraCharges={extraCharges}
        parentSize={parentSize}
      />

      <hr />

      <BookingGeneralCharges bookingData={bookingData} />

      <BookingAuditableInfo booking={bookingData} />
    </>
  );
};

export default BookingSummary;

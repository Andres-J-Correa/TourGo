import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";

import { groupRoomBookings } from "components/bookings/booking-summary/helpers";
import CustomerInfo from "components/bookings/booking-summary/CustomerInfo";
import BookingDetails from "components/bookings/booking-summary/BookingDetails";
import BookingFinancials from "components/bookings/booking-summary/BookingFinancials";
import RoomList from "components/bookings/booking-summary/RoomList";
import BookingTransactions from "components/bookings/booking-summary/BookingTransactions";
import BookingAuditableInfo from "components/bookings/booking-summary/BookingAuditableInfo";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";

const BookingSummary = ({
  bookingData,
  setBooking,
  hotelId,
  roomBookings = [],
  extraCharges = [],
}) => {
  const { customer } = bookingData || {};
  const groupedRooms = groupRoomBookings(roomBookings);

  return (
    <Card className="mb-4 bg-body-tertiary shadow">
      <CardHeader tag="h4" className="text-bg-dark text-center">
        Reserva # {bookingData?.id}
        <BookingStatusBadge
          className="float-end"
          statusId={bookingData?.status?.id}
        />
      </CardHeader>
      <CardBody className="text-dark">
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
            {" "}
            <Row>
              <Col>
                <strong>Notas:</strong>
                <p>{bookingData?.notes}</p>
              </Col>
            </Row>
            <hr />
          </>
        )}

        <BookingFinancials bookingData={bookingData} />

        <hr />

        <RoomList rooms={groupedRooms} extraCharges={extraCharges} />

        <hr />

        <BookingTransactions
          hotelId={hotelId}
          booking={bookingData}
          setBooking={setBooking}
        />

        <hr />

        <BookingAuditableInfo booking={bookingData} />
      </CardBody>
      <br />
    </Card>
  );
};

export default BookingSummary;

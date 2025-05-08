import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";

import { groupRoomBookings } from "components/bookings/booking-summary/helpers";
import CustomerInfo from "components/bookings/booking-summary/CustomerInfo";
import BookingDetails from "components/bookings/booking-summary/BookingDetails";
import BookingFinancials from "components/bookings/booking-summary/BookingFinancials";
import RoomList from "components/bookings/booking-summary/RoomList";

const ReservationSummary = ({
  bookingData,
  roomBookings = [],
  extraCharges = [],
}) => {
  const { customer } = bookingData;
  const groupedRooms = groupRoomBookings(roomBookings);

  return (
    <Card className="mb-4 bg-body-tertiary shadow">
      <CardHeader tag="h4" className="text-bg-dark">
        Resumen de Reserva
      </CardHeader>
      <CardBody className="text-dark">
        <Row>
          <Col className="border-end">
            <CustomerInfo customer={customer} />
          </Col>

          <Col>
            <BookingDetails bookingData={bookingData} />
          </Col>
        </Row>

        <hr />
        {bookingData.notes && (
          <>
            {" "}
            <Row>
              <Col>
                <strong>Notas:</strong>
                <p>{bookingData.notes}</p>
              </Col>
            </Row>
            <hr />
          </>
        )}

        <BookingFinancials bookingData={bookingData} />

        <hr />

        <RoomList
          rooms={groupedRooms}
          bookingData={bookingData}
          extraCharges={extraCharges}
        />
      </CardBody>
    </Card>
  );
};

export default ReservationSummary;

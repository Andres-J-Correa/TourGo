import React from "react";
import { Row, Col } from "reactstrap";
import RoomCard from "./RoomCard";

const RoomList = ({ rooms, bookingData, extraCharges }) => (
  <>
    <h5>Habitaciones</h5>
    <Row className="justify-content-around">
      {rooms.map((room, idx) => (
        <Col key={`${room.roomName}-${idx}`} md={4} className="d-flex">
          <RoomCard
            room={room}
            bookingNights={bookingData.nights}
            extraCharges={extraCharges}
          />
        </Col>
      ))}
    </Row>
  </>
);

export default RoomList;

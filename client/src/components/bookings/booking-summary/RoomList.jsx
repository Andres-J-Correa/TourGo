import React from "react";
import { Row, Col } from "reactstrap";
import RoomCard from "./RoomCard";

const RoomList = ({ rooms, extraCharges, parentSize }) => (
  <>
    <h5>Habitaciones</h5>
    <Row className="justify-content-around">
      {rooms.map((room, idx) => (
        <Col
          key={`${room.roomName}-${idx}`}
          lg={parentSize === "lg" ? 4 : 6}
          md={parentSize === "lg" ? 6 : 12}
          sm={12}
          className="d-flex justify-content-center">
          <RoomCard
            room={room}
            bookingNights={room.segments?.length || 0}
            extraCharges={extraCharges}
          />
        </Col>
      ))}
    </Row>
  </>
);

export default RoomList;

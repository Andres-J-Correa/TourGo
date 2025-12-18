import React from "react";
import { Row, Col } from "reactstrap";
import RoomCard from "./RoomCard";
import { useLanguage } from "contexts/LanguageContext"; // added

// Helper to get column sizes based on parentSize
const getColSizes = (parentSize) => ({
  lg: parentSize === "lg" ? 4 : 6,
  md: parentSize === "lg" ? 6 : 12,
  sm: 12,
});

const RoomList = ({ rooms, extraCharges, parentSize }) => {
  const colSizes = getColSizes(parentSize);
  const { t } = useLanguage(); // added

  return (
    <>
      <h5>{t("booking.roomList.title")}</h5>
      <Row className="justify-content-around">
        {rooms.map((room, idx) => (
          <Col
            key={`${room.roomName}-${idx}`}
            lg={colSizes.lg}
            md={colSizes.md}
            sm={colSizes.sm}
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
};

export default RoomList;

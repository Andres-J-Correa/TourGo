import { type RoomMovementItem } from "../types";
import { type Room } from "types/entities/room.types";
import { type JSX } from "react";

import { useState } from "react";
import { Row, Col } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext";
import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";

interface RoomsPaneProps {
  arrivingRooms: RoomMovementItem[];
  departingRooms: RoomMovementItem[];
  forCleaningRooms: RoomMovementItem[];
  availableRooms: Room[];
  hotelId: string | undefined;
}

function RoomsPane({
  arrivingRooms,
  departingRooms,
  forCleaningRooms,
  availableRooms,
  hotelId,
}: RoomsPaneProps): JSX.Element {
  const [offCanvasData, setOffCanvasData] = useState<{
    isOpen: boolean;
    bookingId: string | null;
  }>({
    isOpen: false,
    bookingId: null,
  });

  const { t } = useLanguage();

  const toggleOffCanvas =
    (bookingId: string | null = null) =>
    () => {
      setOffCanvasData({
        isOpen: !offCanvasData.isOpen,
        bookingId,
      });
    };

  const renderRoomList = (rooms: RoomMovementItem[], prefix: string) => {
    if (rooms.length === 0) return <p>{t("hotels.landing.none")}</p>;

    return (
      <ol>
        {rooms.map((item) => (
          <li key={`${prefix}-${item.room.id}-${item.bookingId}`}>
            {item.isRoomChange && (
              <strong className="text-info">
                [{t("hotels.landing.roomChange")}]
              </strong>
            )}{" "}
            <strong>{item.room.name}</strong> —{" "}
            <span
              className="link-primary cursor-pointer"
              title={t("hotels.landing.viewBookingDetails")}
              onClick={toggleOffCanvas(item.bookingId)}>
              {item.firstName} {item.lastName}
            </span>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <>
      <BookingViewOffCanvas
        offCanvasOpen={offCanvasData.isOpen}
        handleToggleOffcanvas={toggleOffCanvas()}
        bookingId={offCanvasData.bookingId}
        hotelId={hotelId}
      />
      <Row className="mb-4">
        <Col md={12}>
          <strong>{t("hotels.landing.infoTitle")}</strong>
          <p className="mb-0 text-dark">{t("hotels.landing.infoText")}</p>
          <ul>
            <li>{t("hotels.landing.infoArrivingOrDeparting")}</li>
            <li>{t("hotels.landing.infoRoomChanges")}</li>
          </ul>
        </Col>

        <Col md={12} lg={6} xl={4}>
          <strong>
            {t("hotels.landing.arriving")}
            {arrivingRooms?.length > 0 ? ` (${arrivingRooms.length})` : ""}
          </strong>
          {renderRoomList(arrivingRooms, "arriving")}
        </Col>

        <Col md={12} lg={6} xl={4}>
          <strong>
            {t("hotels.landing.departing")}
            {departingRooms?.length > 0 ? ` (${departingRooms.length})` : ""}
          </strong>
          {renderRoomList(departingRooms, "departing")}
        </Col>

        <Col md={12} lg={6} xl={4}>
          <strong>
            {t("hotels.landing.forCleaning")}
            {forCleaningRooms?.length > 0
              ? ` (${forCleaningRooms.length})`
              : ""}
          </strong>
          {renderRoomList(forCleaningRooms, "for-cleaning")}
        </Col>

        <hr />

        <Col md={12}>
          <strong>
            {t("hotels.landing.availableRooms")}
            {availableRooms?.length > 0 ? ` (${availableRooms.length})` : ""}
          </strong>
          {availableRooms?.length === 0 ? (
            <p>{t("hotels.landing.none")}</p>
          ) : (
            <ol className="available-rooms-list">
              {availableRooms.map((item) => (
                <li key={`available-rooms-${item.id}`}>
                  <strong>{item.name}</strong>
                </li>
              ))}
            </ol>
          )}
        </Col>
      </Row>
    </>
  );
}

export default RoomsPane;

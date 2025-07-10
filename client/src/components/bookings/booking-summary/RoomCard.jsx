import React from "react";
import { Card, CardBody, ListGroup, ListGroupItem } from "reactstrap";
import { formatCurrency } from "utils/currencyHelper";
import dayjs from "dayjs";
import { calculateRoomCharges } from "./helpers";
import "./BookingSummary.css";
import { useLanguage } from "contexts/LanguageContext"; // added

const RoomCard = ({ room, bookingNights, extraCharges }) => {
  const { t } = useLanguage(); // added
  const subtotal = room?.segments?.reduce((sum, seg) => sum + seg.price, 0);
  const charges = calculateRoomCharges(extraCharges, subtotal, bookingNights);
  const total =
    subtotal + (charges ? charges?.reduce((acc, c) => acc + c.total, 0) : 0);

  return (
    <Card className="mb-3 flex-fill shadow bg-light room-card-print">
      <CardBody className="d-flex flex-column text-dark">
        <div className="room-card-line">
          <h5 className="text-center">{room.roomName}</h5>
          <p className="text-center">{room.roomDescription}</p>
        </div>

        <ListGroup className="mt-2 flex-grow-1">
          {room?.segments?.map((seg, i) => (
            <ListGroupItem key={i} className="line-item px-2">
              <span className="line-label">
                <strong>{t("booking.roomCard.night")}</strong>
              </span>
              {dayjs(seg.date).format("DD/MM/YYYY")}
              <div className="line-fill" />
              <span className="line-amount">
                <strong>{t("booking.roomCard.price")}</strong>{" "}
                {formatCurrency(seg.price, "COP")}
              </span>
            </ListGroupItem>
          ))}
        </ListGroup>

        <div className="p-2">
          <div className="line-item">
            <span className="line-label">{t("booking.roomCard.subtotal")}</span>
            <div className="line-fill" />
            <span className="line-amount">
              {formatCurrency(subtotal, "COP")}
            </span>
          </div>

          {charges?.map((charge, idx) => (
            <div className="line-item" key={`charge-${idx}`}>
              <span className="line-label">{charge.name}</span>
              <div className="line-fill" />
              <span className="line-amount">
                {formatCurrency(charge.total, "COP")}
              </span>
            </div>
          ))}

          <hr className="mt-1" />

          <div className="line-item line-total">
            <span className="line-label">{t("booking.roomCard.total")}</span>
            <div className="line-fill" />
            <span className="line-amount">{formatCurrency(total, "COP")}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default RoomCard;

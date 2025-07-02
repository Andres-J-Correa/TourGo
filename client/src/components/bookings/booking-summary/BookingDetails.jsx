import React from "react";
import { Row, Col } from "reactstrap";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useLanguage } from "contexts/LanguageContext"; // added

dayjs.extend(utc);

const BookingDetails = ({ bookingData }) => {
  const { t } = useLanguage(); // added
  return (
    <>
      <h5>{t("booking.details.title")}</h5>
      <hr className="mb-1 mt-0" />
      <Row>
        <Col xl={4} lg={6} md={12} className="mb-2">
          <strong>{t("booking.details.arrival")}</strong>
          <p>{dayjs(bookingData?.arrivalDate).format("DD/MM/YYYY")}</p>
        </Col>
        <Col xl={4} lg={6} md={12} className="mb-2">
          <strong>{t("booking.details.eta")}</strong>{" "}
          <p>
            {bookingData?.eta
              ? dayjs.utc(bookingData?.eta).format("DD/MM/YYYY - h:mm a")
              : "-"}
          </p>
        </Col>
        <Col xl={4} lg={6} md={12} className="mb-2">
          <strong>{t("booking.details.externalId")}</strong>
          <p>{bookingData?.externalId ? bookingData?.externalId : "-"}</p>
        </Col>
      </Row>
      <Row>
        <Col xl={4} lg={6} md={12} className="mb-2">
          <strong>{t("booking.details.departure")}</strong>
          <p>{dayjs(bookingData?.departureDate).format("DD/MM/YYYY")}</p>
        </Col>
        <Col xl={3} lg={6} md={12} className="mb-2">
          <strong>{t("booking.details.provider")}</strong>
          <p>
            {bookingData?.bookingProvider?.name
              ? bookingData?.bookingProvider.name
              : "-"}
          </p>
        </Col>
        <Col xs={4} lg="auto">
          <strong>{t("booking.details.nights")}</strong>{" "}
          <p>{bookingData?.nights}</p>
        </Col>
        <Col xs={4} lg="auto">
          <strong>{t("booking.details.adults")}</strong>{" "}
          <p>{bookingData?.adultGuests}</p>
        </Col>
        <Col xs={4} lg="auto">
          <strong>{t("booking.details.children")}</strong>{" "}
          <p>{bookingData?.childGuests}</p>
        </Col>
      </Row>
    </>
  );
};

export default BookingDetails;

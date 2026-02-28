import React from "react";
import { Row, Col } from "reactstrap";
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext";

function BookingAuditableInfo({ booking }) {
  const { t } = useLanguage();
  return (
    <Row>
      <Col xs={12} md={6} xl={3}>
        <strong>{t("booking.auditableInfo.createdBy")}</strong>
        <p className="mb-0">
          {booking?.createdBy?.firstName} {booking?.createdBy?.lastName}
        </p>
      </Col>
      <Col xs={12} md={6} xl={3}>
        <strong>{t("booking.auditableInfo.dateCreated")}</strong>
        <p className="mb-0">
          {dayjs(booking?.dateCreated).format("DD/MM/YYYY h:mm a")}
        </p>
      </Col>
      <Col xs={12} md={6} xl={3}>
        <strong>{t("booking.auditableInfo.modifiedBy")}</strong>
        <p className="mb-0">
          {booking?.modifiedBy?.firstName} {booking?.modifiedBy?.lastName}
        </p>
      </Col>
      <Col xs={12} md={6} xl={3}>
        <strong>{t("booking.auditableInfo.dateModified")}</strong>
        <p className="mb-0">
          {dayjs(booking?.dateModified).format("DD/MM/YYYY h:mm a")}
        </p>
      </Col>
    </Row>
  );
}

export default BookingAuditableInfo;

import React from "react";
import { Row, Col } from "reactstrap";
import { formatPhoneNumber } from "utils/phoneHelper";
import { useLanguage } from "contexts/LanguageContext";

const CustomerInfo = ({ customer }) => {
  const { t } = useLanguage();
  return (
    <>
      <h5>{t("booking.customerInfo.title")}</h5>
      <hr className="mb-1 mt-0" />
      <Row>
        <Col md={7}>
          <Row>
            <strong>{t("booking.customerInfo.name")}</strong>
            <p>
              {customer?.firstName} {customer?.lastName}
            </p>
          </Row>
          <Row>
            <strong>{t("booking.customerInfo.email")}</strong>
            <p>{customer?.email}</p>
          </Row>
        </Col>
        <Col md={5}>
          <Row>
            <strong>{t("booking.customerInfo.document")}</strong>
            <p>{customer?.documentNumber}</p>
          </Row>
          <Row>
            <strong>{t("booking.customerInfo.phone")}</strong>
            <p>{formatPhoneNumber(customer?.phone)}</p>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default CustomerInfo;

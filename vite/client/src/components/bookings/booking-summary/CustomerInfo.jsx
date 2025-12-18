import { Row, Col } from "reactstrap";
import PhoneWspLink from "components/commonUI/PhoneWspLink";
import { useLanguage } from "contexts/LanguageContext";

const CustomerInfo = ({ customer }) => {
  const { t } = useLanguage();

  return (
    <>
      <h5>{t("booking.customerInfo.title")}</h5>
      <hr className="mb-1 mt-0" />
      <Row>
        <Col md={12} lg={7}>
          <Row>
            <strong>{t("booking.customerInfo.name")}</strong>
            <p>
              {customer?.firstName} {customer?.lastName}
            </p>
          </Row>
          <Row>
            <strong>{t("booking.customerInfo.email")}</strong>
            <p>{customer?.email || "N/A"}</p>
          </Row>
        </Col>
        <Col md={12} lg={5}>
          <Row>
            <strong>{t("booking.customerInfo.document")}</strong>
            <p>{customer?.documentNumber}</p>
          </Row>
          <Row>
            <strong>{t("booking.customerInfo.phone")}</strong>
            <p>
              <PhoneWspLink phone={customer?.phone} />
            </p>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default CustomerInfo;

import { Row, Col } from "reactstrap";
import { formatPhoneNumber } from "utils/phoneHelper";
import { useLanguage } from "contexts/LanguageContext";
import Swal from "sweetalert2";
import { isValidPhoneNumber } from "libphonenumber-js";
const getWhatsappLink = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${cleaned}`;
};

const CustomerInfo = ({ customer }) => {
  const { t } = useLanguage();
  const handlePhoneClick = () => {
    const phone = customer?.phone;
    if (!isValidPhoneNumber(phone)) {
      Swal.fire({
        icon: "error",
        title: t("booking.invalidPhoneSwalTitle"),
        text: t("booking.invalidPhoneSwalText"),
      });
      return;
    }
    const whatsappLink = getWhatsappLink(phone);
    window.open(whatsappLink, "_blank");
  };
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
            <p>{customer?.email}</p>
          </Row>
        </Col>
        <Col md={12} lg={5}>
          <Row>
            <strong>{t("booking.customerInfo.document")}</strong>
            <p>{customer?.documentNumber}</p>
          </Row>
          <Row>
            <strong>{t("booking.customerInfo.phone")}</strong>
            {!!customer?.phone ? (
              <p>
                <span
                  className="link-primary cursor-pointer"
                  onClick={handlePhoneClick}>
                  {formatPhoneNumber(customer.phone)}
                </span>
              </p>
            ) : (
              <p>N/A</p>
            )}
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default CustomerInfo;

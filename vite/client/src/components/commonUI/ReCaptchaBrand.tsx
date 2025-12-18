import { Col, Row } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext";

function ReCaptchaBrand() {
  const { t } = useLanguage();

  return (
    <Row className="my-3">
      <Col xs={12}>
        <span>{t("commonUI.reCaptchaBrand.text")}</span>{" "}
        <a href="https://policies.google.com/privacy">
          {t("commonUI.reCaptchaBrand.privacyPolicy")}
        </a>{" "}
        <span>{t("commonUI.reCaptchaBrand.and")}</span>{" "}
        <a href="https://policies.google.com/terms">
          {t("commonUI.reCaptchaBrand.termsOfService")}
        </a>{" "}
        <span>{t("commonUI.reCaptchaBrand.apply")}.</span>
      </Col>
    </Row>
  );
}

export default ReCaptchaBrand;

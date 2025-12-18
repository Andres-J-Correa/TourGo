import React from "react";
import { Col, Row } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import underMaintenance from "assets/images/under-maintenance.jpg";
import { useLanguage } from "contexts/LanguageContext";

function SiteUnderMaintenance() {
  const { t } = useLanguage();
  return (
    <Row>
      <h1 className="text-center text-dark mb-4">
        {t("commonUI.siteUnderMaintenance.title")}
      </h1>
      <p className="text-center text-secondary mb-4">
        {t("commonUI.siteUnderMaintenance.message")}
      </p>

      <Col
        xs={12}
        className="d-flex flex-wrap align-content-center justify-content-center">
        <LazyLoadImage
          src={underMaintenance}
          alt={t("commonUI.siteUnderMaintenance.alt")}
          className="img-fluid border-radius-lg"
          effect="blur"
          wrapperClassName="p-1"
          style={{ maxHeight: "500px", width: "100%", objectFit: "cover" }}
        />
      </Col>
    </Row>
  );
}

export default SiteUnderMaintenance;

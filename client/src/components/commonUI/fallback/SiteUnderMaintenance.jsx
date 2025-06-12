import React from "react";
import { Col, Row } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import underMaintenance from "assets/images/under-maintenance.jpg";

function SiteUnderMaintenance() {
  return (
    <Row>
      <h1 className="text-center text-dark mb-4">Sitio en Mantenimiento</h1>
      <p className="text-center text-secondary mb-4">
        Estamos trabajando para mejorar su experiencia. Por favor, vuelva más
        tarde.
      </p>

      <Col
        xs={12}
        className="d-flex flex-wrap align-content-center justify-content-center">
        <LazyLoadImage
          src={underMaintenance}
          alt="site under construction"
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

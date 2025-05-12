import React from "react";
import { Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import underConstruction from "assets/images/under-construction.jpg";

const SiteUnderConstruction = () => {
  return (
    <Col
      xs={12}
      className="d-flex flex-wrap align-content-center justify-content-center">
      <LazyLoadImage
        src={underConstruction}
        alt="404 not found"
        className="img-fluid border-radius-lg"
        effect="blur"
        height={"auto"}
        wrapperClassName="p-1"
      />
    </Col>
  );
};

export default React.memo(SiteUnderConstruction);

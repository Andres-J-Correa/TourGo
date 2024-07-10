import React from "react";
import { Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import noRecordsBackground from "assets/images/404-not-found.webp";

const NoRecords404 = () => {
  return (
    <Col xs={12} className="align-content-center min-vh-100">
      <LazyLoadImage
        src={noRecordsBackground}
        alt="404 not found"
        className="img-fluid border-radius-lg"
        effect="blur"
        width="100%"
        wrapperClassName="p-3"
      />
    </Col>
  );
};

export default React.memo(NoRecords404);

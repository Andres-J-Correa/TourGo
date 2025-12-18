import React from "react";
import { Row, Spinner } from "reactstrap";

function SimpleLoader({ isVisible }) {
  if (!isVisible) return null;

  return (
    <Row className="justify-content-center py-5">
      <Spinner color="dark" style={{ scale: "2" }} />
    </Row>
  );
}

export default SimpleLoader;

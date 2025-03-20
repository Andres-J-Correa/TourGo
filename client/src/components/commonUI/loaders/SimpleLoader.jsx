import React from "react";
import { Row, Spinner } from "reactstrap";

function SimpleLoader() {
  return (
    <Row className="justify-content-center">
      <Spinner color="dark" style={{ scale: "2" }} />
    </Row>
  );
}

export default SimpleLoader;

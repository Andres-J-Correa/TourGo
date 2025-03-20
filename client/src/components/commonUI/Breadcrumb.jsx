import React from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";

const Breadcrumb = ({ breadcrumbs, active }) => {
  return (
    <Row>
      <Col xs="12">
        <div className="page-title-box d-flex align-items-center justify-content-between">
          <div className="ms-auto">
            <ol className="breadcrumb m-0">
              {breadcrumbs?.map((breadcrumb, index) => (
                <li key={`breadcrumb-${index}`} className={`breadcrumb-item`}>
                  {breadcrumb.path ? (
                    <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                  ) : (
                    breadcrumb.label
                  )}
                </li>
              ))}
              <li className="breadcrumb-item active">{active}</li>
            </ol>
          </div>
        </div>
      </Col>
    </Row>
  );
};

Breadcrumb.propTypes = {
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ).isRequired,
  active: PropTypes.string.isRequired,
};

export default Breadcrumb;

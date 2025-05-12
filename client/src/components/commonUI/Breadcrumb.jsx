import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";

const Breadcrumb = ({ breadcrumbs, active }) => {
  const [mappedBreadcrumbs, setMappedBreadcrumbs] = useState([]);

  useEffect(() => {
    if (breadcrumbs?.length > 0) {
      const mapped = [];
      breadcrumbs.forEach((breadcrumb, index) => {
        if (breadcrumb) {
          mapped.push(
            <li key={`breadcrumb-${index}`} className={`breadcrumb-item`}>
              {breadcrumb.path ? (
                <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
              ) : (
                breadcrumb.label
              )}
            </li>
          );
        }
      });
      setMappedBreadcrumbs(mapped);
    }
  }, [breadcrumbs]);

  return (
    <Row>
      <Col xs="12">
        <div className="page-title-box d-flex align-items-center justify-content-between">
          <div className="ms-auto">
            <ol className="breadcrumb m-0">
              {mappedBreadcrumbs}
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
  ),
  active: PropTypes.string.isRequired,
};

export default Breadcrumb;

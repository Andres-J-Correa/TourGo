//types
import type { JSX } from "react";
import type { BreadcrumbsProps } from "./Breadcrumbs.types";

//libs
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";

const Breadcrumbs = ({
  breadcrumbs,
  active,
}: BreadcrumbsProps): JSX.Element => {
  const [mappedBreadcrumbs, setMappedBreadcrumbs] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (breadcrumbs.length > 0) {
      const mapped: JSX.Element[] = [];

      breadcrumbs.forEach((breadcrumb, index) => {
        if (!!breadcrumb) {
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
    <Row className="no-print">
      <Col xs="12">
        <div className="page-title-box d-flex align-items-center justify-content-end">
          <ol className="breadcrumb m-0 justify-content-end">
            {mappedBreadcrumbs}
            <li className="breadcrumb-item active">{active}</li>
          </ol>
        </div>
      </Col>
    </Row>
  );
};

export default React.memo(Breadcrumbs);

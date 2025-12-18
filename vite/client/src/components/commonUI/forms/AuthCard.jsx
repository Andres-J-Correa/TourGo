import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardHeader, CardFooter, Col } from "reactstrap";

const AuthCard = ({
  title,
  subtitle,
  children,
  footer,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
}) => {
  return (
    <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl} xxl={xxl} className="mx-auto">
      <Card className="z-index-0 shadow-lg pb-3">
        <CardHeader className="p-0 position-relative mt-n4 mx-3 z-index-2 shadow-lg">
          <div className="bg-gradient-success border-radius-lg py-3 pe-1 text-center py-4">
            <h4 className="font-weight-bolder text-white mt-1 mb-0">{title}</h4>
            <p className="mb-1 text-sm text-white">{subtitle}</p>
          </div>
        </CardHeader>
        <CardBody className="pb-0">{children}</CardBody>
        {footer && (
          <CardFooter className="text-center mt-2 pt-0 px-sm-4 px-1">
            {footer}
          </CardFooter>
        )}
      </Card>
    </Col>
  );
};

AuthCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  xxl: PropTypes.number,
};

export default AuthCard;

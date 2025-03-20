import React from "react";
import { Alert as ExternalAlert } from "reactstrap";
import PropTypes from "prop-types";

const Alert = ({ message, type, className, children }) => {
  return (
    <ExternalAlert
      className={`alert-${type} ${className}`}
      transition={{ timeout: 0 }}>
      {children || <div dangerouslySetInnerHTML={{ __html: message }}></div>}
    </ExternalAlert>
  );
};

Alert.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
  ]),
  children: PropTypes.node,
  className: PropTypes.string,
};

export default React.memo(Alert);

import React, { useMemo } from "react";
import { Alert as ExternalAlert } from "reactstrap";
import DOMPurify from "dompurify";
import PropTypes from "prop-types";
import { useLanguage } from "contexts/LanguageContext"; // added

const Alert = ({ message, type, className, children }) => {
  const { t } = useLanguage(); // added
  const sanitizedMessage = useMemo(() => {
    return (
      DOMPurify.sanitize(message) || `<p>${t("commonUI.alert.noContent")}</p>`
    );
  }, [message, t]);

  return (
    <ExternalAlert
      className={`alert-${type} ${className}`}
      transition={{ timeout: 0 }}>
      {children || (
        <div dangerouslySetInnerHTML={{ __html: sanitizedMessage }}></div>
      )}
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

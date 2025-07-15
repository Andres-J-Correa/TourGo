//types
import type { JSX } from "react";

//libs
import React, { useMemo } from "react";
import { Alert as ExternalAlert } from "reactstrap";
import DOMPurify from "dompurify";

//services & utils
import { useLanguage } from "contexts/LanguageContext";

interface AlertProps {
  message?: string;
  type?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  className?: string;
  children?: React.ReactNode;
}

const Alert = ({
  message,
  type = "info",
  className,
  children,
}: AlertProps): JSX.Element => {
  const { t } = useLanguage();
  const sanitizedMessage = useMemo(() => {
    if (!message) {
      return `<p>${t("commonUI.alert.noContent")}</p>`;
    }

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

export default React.memo(Alert);

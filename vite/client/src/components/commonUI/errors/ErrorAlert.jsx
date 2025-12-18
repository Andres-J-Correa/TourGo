import React from "react";
import { useFormikContext } from "formik";
import Alert from "components/commonUI/Alert";

const ErrorAlert = () => {
  const { errors, touched } = useFormikContext();

  const firstErrorKey = Object.keys(errors).find(
    (field) => touched[field] && errors[field]
  );

  return (
    firstErrorKey && (
      <Alert
        type="danger"
        key={"alert_" + firstErrorKey}
        message={errors[firstErrorKey]}
      />
    )
  );
};

export default ErrorAlert;

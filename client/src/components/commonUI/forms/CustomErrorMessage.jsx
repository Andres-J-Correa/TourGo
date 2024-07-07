import React from "react";
import { useField } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./forms.css";

const CustomErrorMessage = ({ name }) => {
  const [, meta] = useField(name);

  return (
    <React.Fragment>
      {meta.touched && meta.error ? (
        <FontAwesomeIcon
          className="custom-error-message"
          color="red"
          icon={faCircleExclamation}
          size="sm"
          title={meta.error}
        />
      ) : (
        meta.touched &&
        meta.value && (
          <FontAwesomeIcon
            className="custom-error-message"
            color="green"
            icon={faCircleCheck}
            size="sm"
          />
        )
      )}
    </React.Fragment>
  );
};

export default CustomErrorMessage;

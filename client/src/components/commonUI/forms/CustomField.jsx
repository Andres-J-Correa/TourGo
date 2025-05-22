import React, { useState, useMemo } from "react";
import { Field } from "formik";
import { FormGroup, Label } from "reactstrap";
import CustomErrorMessage from "./CustomErrorMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faAsterisk,
} from "@fortawesome/free-solid-svg-icons";
import "./forms.css";

const CustomField = ({ isRequired, ...props }) => {
  const isPasswordField = useMemo(() => {
    return props.name.toLowerCase().includes("password");
  }, [props.name]);

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const inputType = isPasswordField && isPasswordVisible ? "text" : props.type;

  return (
    <FormGroup floating>
      <Field
        {...props}
        type={inputType}
        className={`form-control ${props.className || ""}`}
        placeholder={props.placeholder}>
        {props.children}
      </Field>
      <Label for={props.name} className="text-body-secondary">
        {props.placeholder}
      </Label>

      {isPasswordField && (
        <div
          className="password-toggle-icon"
          onClick={togglePasswordVisibility}>
          <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
        </div>
      )}

      {isRequired && (
        <div
          title="Campo requerido"
          className="required-icon position-absolute text-danger"
          style={{
            top: "-7px",
            right: "-3px",
            fontSize: "0.65rem",
            zIndex: 1,
          }}>
          <FontAwesomeIcon icon={faAsterisk} />
        </div>
      )}

      <CustomErrorMessage name={props.name} />
    </FormGroup>
  );
};

export default CustomField;

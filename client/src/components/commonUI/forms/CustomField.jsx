import React, { useState, useMemo } from "react";
import { Field } from "formik";
import { FormGroup, Label } from "reactstrap";
import CustomErrorMessage from "./CustomErrorMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./forms.css";

const CustomField = ({ ...props }) => {
  const isPasswordField = useMemo(() => {
    return props.name.toLowerCase().includes("password");
  }, [props.name]);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  // Toggle input type between "password" and "text"
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const inputType = isPasswordField && !isPasswordVisible ? "password" : "text";

  return (
    <FormGroup floating>
      <Field
        {...props}
        type={inputType}
        className={`form-control ${props.className}`}
        placeholder={props.placeholder}
      />
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
      <CustomErrorMessage name={props.name} />
    </FormGroup>
  );
};

export default CustomField;

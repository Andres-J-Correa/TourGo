import React from "react";
import { Field } from "formik";
import { FormGroup, Label } from "reactstrap";
import CustomErrorMessage from "./CustomErrorMessage";

const CustomField = ({ ...props }) => {
  return (
    <FormGroup floating>
      <Field
        {...props}
        className={`form-control ${props.className}`}
        placeholder={props.placeholder}
      />
      <Label for={props.name} className="text-body-secondary">
        {props.placeholder}
      </Label>
      <CustomErrorMessage name={props.name} />
    </FormGroup>
  );
};

export default CustomField;

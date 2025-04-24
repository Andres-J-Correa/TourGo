import React, { forwardRef } from "react";
import { useField } from "formik";
import PhoneInput from "react-phone-number-input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import "react-phone-number-input/style.css";

const CustomInput = forwardRef(
  ({ value, onChange, className, isRequired, ...rest }, ref) => (
    <>
      {isRequired && (
        <div
          title="Campo requerido"
          className="required-icon position-absolute text-danger"
          style={{
            top: "-7px",
            right: "-3px",
            fontSize: "0.65rem",
          }}>
          <FontAwesomeIcon icon={faAsterisk} />
        </div>
      )}

      <input
        ref={ref}
        value={value}
        onChange={onChange}
        className="form-control border-0"
        {...rest}
      />
    </>
  )
);

const PhoneInputField = ({ ...props }) => {
  const [field, meta, helpers] = useField(props.name);
  return (
    <PhoneInput
      {...props}
      {...field}
      value={meta.value}
      defaultCountry="CO"
      onChange={(value) => {
        helpers.setValue(value);
      }}
      inputComponent={CustomInput}
    />
  );
};

export default PhoneInputField;

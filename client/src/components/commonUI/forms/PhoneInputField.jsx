import React, { forwardRef } from "react";
import { useField } from "formik";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const CustomInput = forwardRef(
  ({ value, onChange, className, ...rest }, ref) => (
    <input
      ref={ref}
      value={value}
      onChange={onChange}
      className="form-control border-0"
      {...rest}
    />
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

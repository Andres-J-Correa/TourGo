import React, { forwardRef } from "react";
import { useField } from "formik";
import PhoneInput from "react-phone-number-input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import "react-phone-number-input/style.css";
import { useLanguage } from "contexts/LanguageContext";

const CustomInput = forwardRef(
  ({ value, onChange, className, isRequired, ...rest }, ref) => {
    const { t } = useLanguage();
    return (
      <>
        {isRequired && (
          <div
            title={t("commonUI.customField.required")}
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
          className={`${className || ""} my-1 form-control border-0`}
          {...rest}
        />
      </>
    );
  }
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

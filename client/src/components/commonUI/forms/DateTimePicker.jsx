import React from "react";
import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import CustomErrorMessage from "./CustomErrorMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePickers.css"; // Custom styles for the date picker
import "./forms.css"; // Custom styles for the form elements

const CustomDateTimePicker = ({ isRequired, ...props }) => {
  const [field, , helpers] = useField(props.name);
  const { setFieldValue } = useFormikContext();

  const handleChange = (date) => {
    setFieldValue(field.name, date);
    helpers.setTouched(true);
  };

  return (
    <div className="position-relative">
      <DatePicker
        {...props}
        id={props.name}
        selected={field.value ? new Date(field.value) : null}
        onChange={props.onChange || handleChange}
        showTimeSelect
        timeFormat="h:mm aa"
        dateFormat="dd/MM/yyyy - h:mm aa"
        placeholderText={props.placeholder}
        className={`form-control custom-datepicker-input ${
          props.className || ""
        }`}
        autoComplete="off"
        popperClassName="custom-datepicker"
        style={{ height: "58px" }}
      />
      {isRequired && (
        <div
          title="Campo requerido"
          className="required-icon position-absolute text-danger"
          style={{ top: "-7px", right: "-3px", fontSize: "0.65rem" }}>
          <FontAwesomeIcon icon={faAsterisk} />
        </div>
      )}

      <CustomErrorMessage name={props.name} />
    </div>
  );
};

export default CustomDateTimePicker;

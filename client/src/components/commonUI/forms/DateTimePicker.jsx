import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import CustomErrorMessage from "./CustomErrorMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import "./DatePickers.css"; // Custom styles for the date picker
import "./forms.css"; // Custom styles for the form elements
import { useLanguage } from "contexts/LanguageContext";

import { useIsMobile } from "hooks/useIsMobile";

const CustomDateTimePicker = ({ isRequired, ...props }) => {
  const [field, , helpers] = useField(props.name);
  const { setFieldValue } = useFormikContext();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const handleChange = (date) => {
    setFieldValue(field.name, dayjs(date).format("YYYY-MM-DDTHH:mm:ss"));
    helpers.setTouched(true);
  };

  return (
    <div className="position-relative">
      <DatePicker
        {...props}
        id={props.name}
        selected={
          dayjs(field.value).isValid() ? dayjs(field.value).toDate() : null
        }
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
        timeCaption={t("commonUI.dateTimePicker.time")}
        withPortal={isMobile}
        onFocus={(e) => e.target.blur()}
      />
      {isRequired && (
        <div
          title={t("commonUI.customField.required")}
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

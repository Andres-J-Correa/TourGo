import React, { useState, useMemo, useCallback } from "react";
import { Field, useField } from "formik";
import Select, { components } from "react-select";
import { FormGroup, Label } from "reactstrap";
import CustomErrorMessage from "./CustomErrorMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faAsterisk,
  faAngleDown,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import "./forms.css";
import { useLanguage } from "contexts/LanguageContext"; // added

const CustomField = ({
  isRequired,
  useReactSelect,
  isMulti,
  isHeaderSelectable,
  options,
  ...props
}) => {
  const { t } = useLanguage();
  const [field, meta, helpers] = useField(props.name);

  const isPasswordField = useMemo(() => {
    return props.name?.toLowerCase().includes("password");
  }, [props.name]);

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const inputType = isPasswordField && isPasswordVisible ? "text" : props.type;

  const onGroupHeadingClick = useCallback(
    (data) => {
      if (!isMulti || !isHeaderSelectable) return;
      const groupOptions = data.options;
      const currentValues = Array.isArray(field.value) ? field.value : [];

      const toSelect = groupOptions.filter(
        (option) =>
          !currentValues.some((selected) => selected.value === option.value)
      );

      const newSelected = [...currentValues, ...toSelect];
      helpers.setValue(newSelected);
    },
    [isMulti, isHeaderSelectable, field.value, helpers]
  );

  const GroupHeading = useMemo(() => {
    return (props) => (
      <div
        className={isMulti && isHeaderSelectable ? "cursor-pointer" : ""}
        onClick={() => onGroupHeadingClick(props.data)}>
        <components.GroupHeading {...props} />
      </div>
    );
  }, [isMulti, isHeaderSelectable, onGroupHeadingClick]);

  const DropdownIndicator = useMemo(() => {
    return (props) => (
      <components.DropdownIndicator {...props}>
        <FontAwesomeIcon
          size="sm"
          color={meta.touched && meta.error ? "tomato" : ""}
          icon={meta.touched && meta.error ? faCircleExclamation : faAngleDown}
        />
      </components.DropdownIndicator>
    );
  }, [meta]);

  const ValueContainer = useMemo(() => {
    return ({ children, ...args }) => (
      <components.ValueContainer {...args}>
        <components.Placeholder {...args} isFocused={args.isFocused}>
          {args.selectProps.placeholder}
        </components.Placeholder>
        {React.Children.map(children, (child) =>
          child && child.type !== components.Placeholder ? child : null
        )}
      </components.ValueContainer>
    );
  }, []);

  const optionsMap = useMemo(() => {
    const map = new Map();
    const traverse = (opts) => {
      if (!opts) return;
      opts.forEach((opt) => {
        if (opt.options) {
          traverse(opt.options);
        } else {
          map.set(opt.value, opt);
        }
      });
    };
    traverse(options);
    return map;
  }, [options]);

  if (useReactSelect) {
    const getSelectValue = () => {
      if (!options) return field.value;

      const getValue = (val) => {
        const value = val?.value ?? val;
        return optionsMap.get(value) || val;
      };

      if (isMulti) {
        return Array.isArray(field.value) ? field.value.map(getValue) : [];
      }
      return getValue(field.value);
    };

    return (
      <div className="position-relative mb-3">
        <Select
          {...field}
          {...props}
          noOptionsMessage={() => t("common.noOptions")}
          placeholder={props.placeholder}
          options={options}
          isMulti={isMulti}
          components={{ GroupHeading, DropdownIndicator, ValueContainer }}
          onChange={(val, meta) => {
            if (props.onChange) {
              props.onChange(val, meta);
            } else {
              helpers.setValue(val.value);
            }
            helpers.setTouched(true);
          }}
          value={getSelectValue()}
          styles={{
            control: (provided, state) => ({
              ...provided,
              border: "var(--bs-border-width) solid var(--bs-border-color)",
              borderRadius: "var(--bs-border-radius)",
              borderColor: state.isFocused && "var(--bs-primary-color)",
              color: state.isFocused && "var(--bs-body-color)",
              backgroundColor: state.isFocused && "var(--bs-body-bg)",
              outline: state.isFocused && "0",
              boxShadow:
                state.isFocused && "0 0 0 .25rem rgba(13, 110, 253, .25)",
            }),
            menu: (provided) => ({
              ...provided,
              zIndex: 9999,
            }),
            placeholder: (provided, state) => ({
              ...provided,
              position: "absolute",
              top: state.hasValue || state.selectProps.inputValue ? "0" : "50%",
              transform:
                !state.hasValue &&
                !state.selectProps.inputValue &&
                "translateY(-50%)",
              left: "0",
              zIndex: 2,
              overflow: "hidden",
              textAlign: "start",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              gridArea: "auto",
              padding: "0.4rem .65rem",
              fontSize:
                (state.hasValue || state.selectProps.inputValue) && "0.85rem",
              color: "var(--bs-secondary-color)",
              transition: "all 0.15s ease-in-out",
              margin: 0,
            }),
            valueContainer: (provided) => ({
              ...provided,
              position: "relative",
              paddingTop: "1.1rem",
              paddingBottom: "0.3rem",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "var(--bs-secondary-color)",
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected && "var(--bs-dark)",
            }),
          }}
        />
        {isRequired && (
          <div
            title={t("commonUI.customField.required")}
            className="required-icon text-danger">
            <FontAwesomeIcon icon={faAsterisk} />
          </div>
        )}
      </div>
    );
  }

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
          onClick={togglePasswordVisibility}
          title={
            isPasswordVisible
              ? t("commonUI.customField.hidePassword")
              : t("commonUI.customField.showPassword")
          }>
          <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
        </div>
      )}

      {isRequired && (
        <div
          title={t("commonUI.customField.required")}
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

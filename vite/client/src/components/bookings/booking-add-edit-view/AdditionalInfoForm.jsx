import React, { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import { Row, Col } from "reactstrap";
import { faPlusSquare, faMinusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { useNumericFormat } from "react-number-format";

import CustomField from "components/commonUI/forms/CustomField";
import DateTimePicker from "components/commonUI/forms/DateTimePicker";

import { setLocalStorageForm } from "utils/localStorageHelper";
import { LOCAL_STORAGE_FORM_KEYS } from "components/bookings/booking-add-edit-view/constants";
import { useLanguage } from "contexts/LanguageContext";

function AdditionalInfoForm({ submitting, bookingProviderOptions }) {
  const [mappedBookingProviderOptions, setMappedBookingProviderOptions] =
    useState([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const { setFieldValue, values } = useFormikContext();
  const { t } = useLanguage();

  const { format, removeFormatting } = useNumericFormat({
    thousandSeparator: ".",
    decimalSeparator: ",",
  });

  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    setFieldValue(fieldName, value); // Update Formik state
    setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
      ...values,
      [fieldName]: value,
    });
  };

  const handleComissionChange = (e) => {
    const rawValue = e.target.value;
    // Remove formatting for internal numeric value
    const numericValue = removeFormatting(rawValue);
    setFieldValue("externalCommission", numericValue); // Update Formik state
  };

  const handleEtaChange = (date) => {
    const val = dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
    setFieldValue("eta", val); // Update Formik state
    setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
      ...values,
      eta: val,
    });
  };

  const handleBookingProviderChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedValue = e.target.value;
    const selectedName = selectedOption.getAttribute("data-name");

    setFieldValue("bookingProviderId", selectedValue); // Update Formik state
    setFieldValue("bookingProviderName", selectedName); // Update Formik state

    if (!selectedValue) {
      setFieldValue("externalId", "", false); // Clear externalId if no provider is selected
      setFieldValue("externalCommission", "", false); // Clear externalCommission if no provider is selected
    }
  };

  useEffect(() => {
    if (bookingProviderOptions.length > 0) {
      const options = bookingProviderOptions.map((p) => (
        <option
          key={`booking-provider-${p.id}`}
          value={p.id}
          data-name={p.name}>
          {p.name}
        </option>
      ));
      setMappedBookingProviderOptions(options);
    }
  }, [bookingProviderOptions]);

  return (
    <>
      <h5 className="mt-4 mb-3">{t("booking.additionalInfo.requiredInfo")}</h5>
      <Row>
        <Col md="4">
          <CustomField
            name="adultGuests"
            type="number"
            placeholder={t("booking.additionalInfo.adultGuests")}
            isRequired={true}
            disabled={submitting}
            onChange={(e) => handleInputChange(e, "adultGuests")}
          />
        </Col>
      </Row>
      <h5
        className="mt-4 mb-3 cursor-pointer d-flex"
        onClick={() => setShowOptionalFields(!showOptionalFields)}>
        {t("booking.additionalInfo.optionalInfo")}
        <FontAwesomeIcon
          icon={showOptionalFields ? faMinusSquare : faPlusSquare}
          className="ms-2 my-auto"
        />
      </h5>
      {showOptionalFields && (
        <>
          <Row>
            <Col md="4">
              <CustomField
                name="childGuests"
                type="number"
                placeholder={t("booking.additionalInfo.childGuests")}
                disabled={submitting}
                onChange={(e) => handleInputChange(e, "childGuests")}
              />
            </Col>
            <Col md="4">
              <DateTimePicker
                name="eta"
                placeholder={t("booking.additionalInfo.eta")}
                onChange={(date) => handleEtaChange(date)}
                disabled={submitting}
              />
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <CustomField
                as="select"
                name="bookingProviderId"
                className="form-select"
                placeholder={t("booking.additionalInfo.bookingProvider")}
                disabled={submitting}
                onChange={handleBookingProviderChange}>
                <option value="">
                  {t("booking.additionalInfo.noProvider")}
                </option>
                {mappedBookingProviderOptions}
              </CustomField>
            </Col>
            <Col md="4">
              <CustomField
                name="externalId"
                type="text"
                placeholder={t("booking.additionalInfo.externalId")}
                isRequired={Boolean(values.bookingProviderId)}
                disabled={submitting || !Boolean(values.bookingProviderId)}
                onChange={(e) => handleInputChange(e, "externalId")}
              />
            </Col>
            <Col md="4">
              <CustomField
                name="externalCommission"
                type="text"
                placeholder={t("booking.additionalInfo.externalCommission")}
                value={format(String(values.externalCommission) || "")}
                isRequired={Boolean(values.bookingProviderId)}
                disabled={submitting || !Boolean(values.bookingProviderId)}
                onChange={handleComissionChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <CustomField
                as="textarea"
                name="notes"
                placeholder={t("booking.additionalInfo.notes")}
                disabled={submitting}
                onChange={(e) => handleInputChange(e, "notes")}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

export default AdditionalInfoForm;

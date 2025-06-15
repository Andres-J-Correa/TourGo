import React, { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import { Row, Col } from "reactstrap";

import { setLocalStorageForm } from "utils/localStorageHelper";
import { LOCAL_STORAGE_FORM_KEYS } from "components/bookings/booking-add-edit-view/constants";
import CustomField from "components/commonUI/forms/CustomField";
import DateTimePicker from "components/commonUI/forms/DateTimePicker";

import dayjs from "dayjs";

function AdditionalInfoForm({ submitting, bookingProviderOptions }) {
  const [mappedBookingProviderOptions, setMappedBookingProviderOptions] =
    useState([]);
  const { setFieldValue, values } = useFormikContext();

  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    setFieldValue(fieldName, value); // Update Formik state
    setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
      ...values,
      [fieldName]: value,
    });
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
      <h5 className="mt-4 mb-3">Información adicional</h5>
      <Row>
        <Col md="4">
          <CustomField
            name="adultGuests"
            type="number"
            placeholder="Número de Personas (5 años o más)"
            isRequired={true}
            disabled={submitting}
            onChange={(e) => handleInputChange(e, "adultGuests")}
          />
        </Col>
        <Col md="4">
          <CustomField
            name="childGuests"
            type="number"
            placeholder="Número de Niños (0-4 años)"
            disabled={submitting}
            onChange={(e) => handleInputChange(e, "childGuests")}
          />
        </Col>
        <Col md="4">
          <DateTimePicker
            name="eta"
            placeholder="Fecha y Hora estimada de llegada"
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
            placeholder="Proveedor de reservas (Booking/Airbnb...)"
            disabled={submitting}
            onChange={handleBookingProviderChange}>
            <option value="">Sin Proveedor</option>
            {mappedBookingProviderOptions}
          </CustomField>
        </Col>
        <Col md="4">
          <CustomField
            name="externalId"
            type="text"
            placeholder="Identificación externa (Booking/Airbnb...)"
            isRequired={Boolean(values.bookingProviderId)}
            disabled={submitting || !Boolean(values.bookingProviderId)}
            onChange={(e) => handleInputChange(e, "externalId")}
          />
        </Col>
        <Col md="4">
          <CustomField
            name="externalCommission"
            type="number"
            placeholder="Comision externa"
            step="0.01"
            isRequired={Boolean(values.bookingProviderId)}
            disabled={submitting || !Boolean(values.bookingProviderId)}
            onChange={(e) => handleInputChange(e, "externalCommission")}
          />
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <CustomField
            as="textarea"
            name="notes"
            placeholder="Notas"
            disabled={submitting}
            onChange={(e) => handleInputChange(e, "notes")}
          />
        </Col>
      </Row>
    </>
  );
}

export default AdditionalInfoForm;

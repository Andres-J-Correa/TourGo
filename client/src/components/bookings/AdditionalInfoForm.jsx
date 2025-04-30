import React, { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import { Row, Col } from "reactstrap";

import { setLocalStorageForm } from "utils/localStorageHelper";
import { LOCAL_STORAGE_FORM_KEYS } from "components/bookings/constants";
import { getBookingProvidersByHotelId } from "services/bookingService";
import CustomField from "components/commonUI/forms/CustomField";

import dayjs from "dayjs";
import { toast } from "react-toastify";

function AdditionalInfoForm({ submitting, hotelId }) {
  const [bookingProviderOptions, setBookingProviderOptions] = useState([]);
  const { setFieldValue, values } = useFormikContext();

  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    setFieldValue(fieldName, value); // Update Formik state
    setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
      ...values,
      [fieldName]: value,
    });
  };

  const handleEtaChange = (e, fieldName) => {
    const value = e.target.value;
    if (dayjs(value).isValid()) {
      handleInputChange(e, fieldName);
    }
  };

  const onGetBookingProvidersSuccess = (res) => {
    if (res.isSuccessful) {
      const options = res.items.map((p) => (
        <option key={`booking-provider-${p.id}`} value={p.id}>
          {p.name}
        </option>
      ));
      setBookingProviderOptions(options);
    }
  };

  const onGetBookingProvidersError = (err) => {
    if (err.response?.status !== 404) {
      toast.error("Error al cargar los proveedores de reservas.");
    }
  };

  useEffect(() => {
    if (hotelId) {
      getBookingProvidersByHotelId(hotelId)
        .then(onGetBookingProvidersSuccess)
        .catch(onGetBookingProvidersError);
    }
  }, [hotelId]);

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
          <CustomField
            name="eta"
            type="datetime-local"
            placeholder="Fecha y Hora estimada de llegada"
            onChange={(e) => handleEtaChange(e, "eta")}
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
            onChange={(e) => handleInputChange(e, "bookingProviderId")}>
            <option value="">Sin Proveedor</option>
            {bookingProviderOptions}
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
      <CustomField
        as="textarea"
        name="notes"
        placeholder="Notas"
        disabled={submitting}
        onChange={(e) => handleInputChange(e, "notes")}
      />
    </>
  );
}

export default AdditionalInfoForm;

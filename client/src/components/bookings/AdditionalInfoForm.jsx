import React from "react";
import { Formik, Form } from "formik";
import { Row, Col, Button, Spinner } from "reactstrap";

import {
  setLocalStorageForm,
  getLocalStorageForm,
} from "utils/localStorageHelper";
import {
  LOCAL_STORAGE_FORM_KEYS,
  bookingKeysToCompare,
  deepCompareBooking,
} from "components/bookings/constants";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import dayjs from "dayjs";

function AdditionalInfoForm({
  initialValues,
  onSubmit,
  validationSchema,
  submitting,
  innerRef,
}) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      innerRef={innerRef}
      enableReinitialize>
      {({ handleChange, values }) => {
        const handleInputChange = (e) => {
          handleChange(e);
          const previousForm = getLocalStorageForm(
            LOCAL_STORAGE_FORM_KEYS.CURRENT
          );
          setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
            ...previousForm,
            ...values,
            [e.target.name]: e.target.value,
          });
        };

        const isUpdate = Boolean(initialValues?.id);
        let formChanged = false;

        if (isUpdate) {
          const previousForm = getLocalStorageForm(
            LOCAL_STORAGE_FORM_KEYS.PREVIOUS
          );
          formChanged = deepCompareBooking(
            values,
            previousForm,
            bookingKeysToCompare
          );
        }

        const isSubmitDisabled = submitting || (isUpdate && formChanged);

        return (
          <Form>
            <h5 className="mt-4 mb-3">Información adicional</h5>

            <Row>
              <Col md="4">
                <CustomField
                  name="adultGuests"
                  type="number"
                  placeholder="Número de Personas (5 años o más)"
                  isRequired
                  disabled={submitting}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md="4">
                <CustomField
                  name="childGuests"
                  type="number"
                  placeholder="Número de Niños (0-4 años)"
                  disabled={submitting}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md="4">
                <CustomField
                  name="eta"
                  type="datetime-local"
                  placeholder="Fecha y Hora estimada de llegada"
                  onChange={(e) => {
                    return dayjs(e.target.value).isValid()
                      ? handleInputChange(e)
                      : values.eta;
                  }}
                  disabled={submitting}
                />
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <CustomField
                  name="externalId"
                  type="text"
                  placeholder="Identificación externa (Booking/Airbnb...)"
                  disabled={submitting}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md="6">
                <CustomField
                  name="externalCommission"
                  type="number"
                  placeholder="Comision externa"
                  step="0.01"
                  disabled={submitting}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <CustomField
              as="textarea"
              name="notes"
              placeholder="Notas"
              disabled={submitting}
              onChange={handleInputChange}
            />

            <ErrorAlert />

            <div className="text-center my-3">
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="bg-gradient-success">
                {submitting ? <Spinner size="sm" /> : "Guardar Reserva"}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

export default AdditionalInfoForm;

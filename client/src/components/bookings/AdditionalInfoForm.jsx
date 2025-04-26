import React from "react";
import { Formik, Form } from "formik";
import { Row, Col, Button, Spinner } from "reactstrap";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import dayjs from "dayjs";

function AdditionalInfoForm({
  initialValues,
  onSubmit,
  innerRef,
  validationSchema,
  submitting,
}) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      innerRef={innerRef}
      validationSchema={validationSchema}
      enableReinitialize>
      {({ handleChange, values }) => (
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
              />
            </Col>
            <Col md="4">
              <CustomField
                name="childGuests"
                type="number"
                placeholder="Número de Niños (0-4 años)"
                disabled={submitting}
              />
            </Col>
            <Col md="4">
              <CustomField
                name="eta"
                type="datetime-local"
                placeholder="Fecha y Hora estimada de llegada"
                onChange={(e) => {
                  return dayjs(e.target.value).isValid()
                    ? handleChange(e)
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
              />
            </Col>
            <Col md="6">
              <CustomField
                name="externalCommission"
                type="number"
                placeholder="Comision externa"
                step="0.01"
                disabled={submitting}
              />
            </Col>
          </Row>

          <CustomField
            as="textarea"
            name="notes"
            placeholder="Notas"
            disabled={submitting}
          />

          <ErrorAlert />

          <div className="text-center my-3">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-success">
              {submitting ? <Spinner size="sm" /> : "Guardar Reserva"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default AdditionalInfoForm;

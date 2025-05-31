import React from "react";
import { Formik, Form } from "formik";
import { Button, Col, InputGroup, InputGroupText, Row } from "reactstrap";
import * as Yup from "yup";

import CustomField from "components/commonUI/forms/CustomField";

const initialValues = {
  name: "",
  amount: "",
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es obligatorio").max(100),
  amount: Yup.number()
    .required("El monto es obligatorio")
    .min(0, "El monto debe ser mayor o igual a 0"),
});

function PersonalizedChargeForm({ onSubmit }) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize>
      <Form>
        <Row>
          <Col md="4">
            <InputGroup>
              <CustomField
                name="name"
                type="text"
                placeholder="Nombre del cargo"
                isRequired={true}
              />
              <InputGroupText className="mb-3">$</InputGroupText>
              <CustomField
                name="amount"
                type="number"
                placeholder="Monto"
                isRequired={true}
              />
            </InputGroup>
          </Col>
          <Col md="auto" className="align-content-center">
            <div className="text-center">
              <Button type="submit" className="btn bg-success text-white mb-3">
                Agregar
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Formik>
  );
}

export default PersonalizedChargeForm;

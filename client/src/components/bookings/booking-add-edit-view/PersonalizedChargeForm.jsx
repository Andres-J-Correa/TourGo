import React from "react";
import { Formik, Form } from "formik";
import { Button, Col, InputGroup, InputGroupText, Row } from "reactstrap";
import * as Yup from "yup";

import CustomField from "components/commonUI/forms/CustomField";
import { useLanguage } from "contexts/LanguageContext";

const initialValues = {
  name: "",
  amount: "",
};

function PersonalizedChargeForm({ onSubmit }) {
  const { t } = useLanguage();

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("booking.personalizedChargeForm.nameRequired"))
      .max(100),
    amount: Yup.number()
      .required(t("booking.personalizedChargeForm.amountRequired"))
      .min(0, t("booking.personalizedChargeForm.amountMin")),
  });

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
                placeholder={t(
                  "booking.personalizedChargeForm.namePlaceholder"
                )}
                isRequired={true}
              />
              <InputGroupText className="mb-3">$</InputGroupText>
              <CustomField
                name="amount"
                type="number"
                placeholder={t(
                  "booking.personalizedChargeForm.amountPlaceholder"
                )}
                isRequired={true}
              />
            </InputGroup>
          </Col>
          <Col md="auto" className="align-content-center">
            <div className="text-center">
              <Button type="submit" className="btn bg-success text-white mb-3">
                {t("booking.personalizedChargeForm.add")}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Formik>
  );
}

export default PersonalizedChargeForm;

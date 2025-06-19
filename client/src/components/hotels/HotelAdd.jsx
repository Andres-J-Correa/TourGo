import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { Button, Row, Col, FormGroup } from "reactstrap";
import { add } from "services/hotelService";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { useAddValidationSchema } from "./constants";
import { useAppContext } from "contexts/GlobalAppContext";
import VerifyAccountFallback from "components/commonUI/VerifyAccountFallback";
import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import Swal from "sweetalert2";
import { useLanguage } from "contexts/LanguageContext";

const HotelAdd = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const addValidationSchema = useAddValidationSchema();
  const { t } = useLanguage();

  const breadcrumbs = [
    { label: t("hotels.breadcrumbs.home"), path: "/" },
    { label: t("hotels.breadcrumbs.hotels"), path: "/hotels" },
  ];

  // Form Submission
  const handleAddHotel = async (values) => {
    try {
      Swal.fire({
        title: t("hotels.add.loadingTitle"),
        text: t("hotels.add.loadingText"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await add(values);
      Swal.close();

      if (response.isSuccessful) {
        await Swal.fire({
          icon: "success",
          title: t("hotels.add.successTitle"),
          text: t("hotels.add.successText"),
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
        navigate(`/hotels/${response.item}`);
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("hotels.add.errorText"),
      });
    }
  };

  if (!user.current.isVerified) {
    return (
      <>
        <Breadcrumb
          breadcrumbs={breadcrumbs}
          active={t("hotels.add.breadcrumbActive")}
        />
        <h2 className="display-6 mb-4">{t("hotels.add.title")}</h2>
        <VerifyAccountFallback />
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("hotels.add.breadcrumbActive")}
      />
      <h2 className="display-6 mb-4">{t("hotels.add.title")}</h2>
      <ErrorBoundary>
        <Formik
          initialValues={{
            name: "",
            phone: "",
            address: "",
            email: "",
            taxId: "",
          }}
          validationSchema={addValidationSchema}
          onSubmit={handleAddHotel}>
          <Form>
            <Row>
              <Col md="6">
                <CustomField
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder={t("hotels.add.placeholders.name")}
                  isRequired={true}
                />
              </Col>

              <Col md="6">
                <CustomField
                  name="address"
                  type="text"
                  className="form-control"
                  placeholder={t("hotels.add.placeholders.address")}
                  isRequired={true}
                />
              </Col>

              <Col md="6">
                <CustomField
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder={t("hotels.add.placeholders.email")}
                  isRequired={true}
                />
              </Col>

              <Col md="6">
                <FormGroup className="position-relative">
                  <PhoneInputField
                    name="phone"
                    type="text"
                    className="form-control d-flex"
                    placeholder={t("hotels.add.placeholders.phone")}
                    autoComplete="tel"
                    isRequired={true}
                  />
                  <CustomErrorMessage name="phone" />
                </FormGroup>
              </Col>

              <Col md="6">
                <CustomField
                  name="taxId"
                  type="text"
                  className="form-control"
                  placeholder={t("hotels.add.placeholders.taxId")}
                  isRequired={true}
                />
              </Col>
              <ErrorAlert />
            </Row>

            {/* Submit Button */}
            <div className="mt-3 text-center">
              <Button type="submit" className="bg-dark text-white">
                {t("hotels.add.submit")}
              </Button>
            </div>
          </Form>
        </Formik>
      </ErrorBoundary>
    </>
  );
};

export default HotelAdd;

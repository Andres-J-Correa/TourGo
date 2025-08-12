import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Card, CardBody, CardTitle, Button, Row, Col } from "reactstrap";
import Swal from "sweetalert2";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ReCaptchaBrand from "../commonUI/ReCaptchaBrand";

import { inviteStaff } from "services/staffService";
import {
  HOTEL_ROLES,
  HOTEL_ROLES_BY_ID,
  HOTEL_ROLES_IDS,
} from "components/hotels/constants";
import { useLanguage } from "contexts/LanguageContext";

const initialValues = {
  email: "",
  roleId: "",
};

function StaffInviteForm() {
  const { getTranslatedErrorMessage, t, culture } = useLanguage();
  const { hotelId } = useParams();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("staff.inviteForm.emailInvalid"))
      .required(t("staff.inviteForm.emailRequired")),
    roleId: Yup.number()
      .required(t("staff.inviteForm.roleRequired"))
      .min(1, t("staff.inviteForm.roleInvalid"))
      .max(3, t("staff.inviteForm.roleInvalid")),
  });

  const roleOptions = useMemo(() => {
    const options = [];
    HOTEL_ROLES.forEach((role) => {
      if (role.id === HOTEL_ROLES_IDS.OWNER) return;
      options.push(
        <option key={role.id} value={role.id}>
          {t(role.name)}
        </option>
      );
    });
    return options;
  }, [t]);

  const handleSubmit = async (values, { resetForm }) => {
    const result = await Swal.fire({
      title: t("staff.inviteForm.confirmTitle"),
      text: t("staff.inviteForm.confirmText", {
        email: values.email,
        role: t(HOTEL_ROLES_BY_ID[values.roleId]),
      }),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: t("staff.inviteForm.confirmButton"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#0d6efd",
    });

    if (!result.isConfirmed) return;

    if (!executeRecaptcha) {
      Swal.fire({
        title: t("common.error"),
        text: t("common.recaptchaError"),
        icon: "error",
        confirmButtonText: t("common.ok"),
      });
      return;
    }

    try {
      Swal.fire({
        title: t("staff.inviteForm.sendingTitle"),
        text: t("staff.inviteForm.sendingText"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = await executeRecaptcha("invite_staff");

      const response = await inviteStaff(
        hotelId,
        { ...values, captchaToken: token },
        culture
      );

      Swal.close();

      if (response?.isSuccessful) {
        resetForm();
        await Swal.fire({
          icon: "success",
          title: t("staff.inviteForm.successTitle"),
          text: t("staff.inviteForm.successText"),
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Error al invitar al staff");
      }
    } catch (error) {
      const errorMessage = getTranslatedErrorMessage(error);

      Swal.close();

      Swal.fire({
        title: t("common.error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("common.ok"),
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg mt-3">
      <CardBody className="p-3">
        <CardTitle tag="h5">{t("staff.inviteForm.title")}</CardTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({ values, initialValues }) => (
            <Form>
              <ErrorAlert />
              <Row>
                <Col md="5">
                  <CustomField
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder={t("staff.inviteForm.emailPlaceholder")}
                    isRequired={true}
                  />
                </Col>
                <Col md="3">
                  <CustomField
                    name="roleId"
                    as="select"
                    placeholder={t("staff.inviteForm.rolePlaceholder")}
                    isRequired={true}>
                    <option value="">{t("staff.inviteForm.selectRole")}</option>
                    {roleOptions}
                  </CustomField>
                </Col>
                <Col md="auto" className="align-content-center">
                  <div className="text-center">
                    <Button
                      type="submit"
                      className="btn bg-success text-white mb-3">
                      {t("staff.inviteForm.invite")}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
        <ReCaptchaBrand />
      </CardBody>
    </Card>
  );
}

export default StaffInviteForm;

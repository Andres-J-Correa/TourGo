//types
import type { JSX } from "react";
import type { CustomerFormV2Props } from "./customerFormV2.types";
import type { CustomerPayload } from "types/customer.types";

//libs
import { useState, useMemo } from "react";
import { Button, Row, Col, FormGroup, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";

//components
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import useCustomerValidationSchemas from "./useCustomerValidationSchemas";
import { add, update, getByDocumentNumber } from "services/customerServiceV2";

function CustomerFormV2({
  hotelId,
  customer,
  isUpdate,
  onChangeSuccessful = () => {},
  handleCustomerChange,
  canUpdate = true,
  disableButtons,
}: CustomerFormV2Props): JSX.Element {
  const [creating, setCreating] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { t } = useLanguage();
  const { customerAddEditSchema, searchCustomerSchema } =
    useCustomerValidationSchemas();

  const initialValues: CustomerPayload = useMemo(
    () => ({
      documentNumber: customer?.documentNumber || "",
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
    }),
    [customer]
  );

  const handleDocumentSubmit = async (values: { documentNumber: string }) => {
    if (!hotelId) return;

    setSubmitting(true);

    Swal.fire({
      title: t("booking.customerForm.searching"),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await getByDocumentNumber(
      hotelId,
      values.documentNumber.trim()
    );

    Swal.close();

    if (res.isSuccessful) {
      handleCustomerChange(res.item);

      await Swal.fire({
        icon: "success",
        title: t("booking.customerForm.found"),
        timer: 1500,
        didClose: () => {
          onChangeSuccessful();
        },
      });
    } else {
      if (res.error.response?.status === 404) {
        setCreating(true);

        Swal.fire({
          icon: "info",
          title: t("booking.customerForm.notFound"),
          text: t("booking.customerForm.completeData"),
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: t("booking.customerForm.searchError"),
        });
      }
    }

    setSubmitting(false);
  };

  const trimPayload = (payload: CustomerPayload): CustomerPayload => {
    return {
      ...payload,
      documentNumber: payload.documentNumber.trim(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
    };
  };

  const handleCustomerCreate = async (
    values: CustomerPayload
  ): Promise<void> => {
    if (!hotelId) return;

    setSubmitting(true);

    Swal.fire({
      title: t("booking.customerForm.creating"),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const trimmedData: CustomerPayload = trimPayload(values);

    const res = await add(trimmedData, hotelId);

    Swal.close();

    if (res.isSuccessful) {
      handleCustomerChange({
        ...trimmedData,
        id: res.item,
      });
      setCreating(false);

      await Swal.fire({
        icon: "success",
        title: t("booking.customerForm.created"),
        timer: 1500,
        didClose: () => {
          onChangeSuccessful();
        },
      });
    } else {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("booking.customerForm.createError"),
      });
    }

    setSubmitting(false);
  };

  const handleCustomerUpdate = async (values: CustomerPayload) => {
    if (!customer?.id || !hotelId) return;

    const result = await Swal.fire({
      title: t("booking.customerForm.updateConfirmTitle"),
      text: t("booking.customerForm.updateConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.customerForm.updateConfirmYes"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    Swal.fire({
      title: t("booking.customerForm.updating"),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const trimmedData: CustomerPayload = trimPayload(values);

    const res = await update(trimmedData, hotelId, customer.id);
    Swal.close();
    if (res.isSuccessful) {
      handleCustomerChange({
        ...trimmedData,
        id: customer.id,
      });
      setEditing(false);
      await Swal.fire({
        icon: "success",
        title: t("booking.customerForm.updated"),
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("booking.customerForm.updateError"),
      });
    }

    setSubmitting(false);
  };

  const handleCancelEdit = (resetForm: () => void) => {
    setEditing(false);
    resetForm();
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={
          creating || editing ? customerAddEditSchema : searchCustomerSchema
        }
        onSubmit={
          creating
            ? handleCustomerCreate
            : editing
            ? handleCustomerUpdate
            : handleDocumentSubmit
        }
        enableReinitialize>
        {({ values, setFieldValue, resetForm }) => {
          const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const docValue = e.target.value;
            if ((customer?.id || creating) && !editing) {
              handleCustomerChange({
                documentNumber: docValue,
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
              });
              setCreating(false);
              setEditing(false);
            }
            setFieldValue("documentNumber", docValue);
          };

          return (
            <Form>
              <Row className="mb-3">
                <Col md="6">
                  <CustomField
                    name="documentNumber"
                    placeholder={t("booking.customerForm.documentNumber")}
                    onChange={handleDocChange}
                    value={values.documentNumber}
                    disabled={submitting || (isUpdate && !editing)}
                    isRequired={true}
                  />
                </Col>
                <Col md="6" className="text-end">
                  {customer?.id && !editing && canUpdate && (
                    <Button
                      onClick={() => setEditing(true)}
                      color="warning"
                      disabled={submitting || disableButtons}
                      className="me-2">
                      {t("booking.customerForm.edit")}
                    </Button>
                  )}
                  {editing && (
                    <Button
                      type="button"
                      color="secondary"
                      className="me-2"
                      disabled={submitting}
                      onClick={() => handleCancelEdit(resetForm)}>
                      {t("common.cancel")}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={
                      submitting || disableButtons || (isUpdate && !editing)
                    }
                    className="bg-gradient-success">
                    {submitting ? (
                      <Spinner size="sm" />
                    ) : creating ? (
                      t("booking.customerForm.save")
                    ) : editing ? (
                      t("booking.customerForm.update")
                    ) : (
                      t("booking.customerForm.search")
                    )}
                  </Button>
                </Col>
              </Row>

              {(creating || customer?.id) && (
                <>
                  <Row>
                    <Col md="6">
                      <CustomField
                        name="firstName"
                        placeholder={t("booking.customerForm.firstName")}
                        disabled={(!!customer?.id && !editing) || submitting}
                        isRequired={creating || editing}
                      />
                    </Col>
                    <Col md="6">
                      <CustomField
                        name="lastName"
                        placeholder={t("booking.customerForm.lastName")}
                        disabled={(!!customer?.id && !editing) || submitting}
                        isRequired={creating || editing}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup className="position-relative">
                        <PhoneInputField
                          name="phone"
                          type="text"
                          className="form-control d-flex"
                          placeholder={t("booking.customerForm.phone")}
                          autoComplete="tel"
                          disabled={(!!customer?.id && !editing) || submitting}
                          isRequired={creating || editing}
                        />
                        <CustomErrorMessage name="phone" />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <CustomField
                        name="email"
                        placeholder={t("booking.customerForm.email")}
                        disabled={(!!customer?.id && !editing) || submitting}
                        isRequired={false}
                        autoComplete="email"
                      />
                    </Col>
                  </Row>
                  <ErrorAlert />
                </>
              )}
            </Form>
          );
        }}
      </Formik>
    </>
  );
}

export default CustomerFormV2;

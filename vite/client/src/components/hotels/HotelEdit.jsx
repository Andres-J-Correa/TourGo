import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import { getDetailsById, updateById, deleteById } from "services/hotelService";
import {
  useAddValidationSchema,
  HOTEL_ROLES_IDS,
} from "components/hotels/constants";
import { useAppContext } from "contexts/GlobalAppContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { useLanguage } from "contexts/LanguageContext";

const HotelEdit = ({ hotelId }) => {
  const [hotel, setHotel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const { hotel: currentHotel } = useAppContext();
  const addValidationSchema = useAddValidationSchema();

  const navigate = useNavigate();
  const { t } = useLanguage();

  // Handles form cancel action
  const handleCancel = (resetForm) => {
    resetForm();
    setIsEditing(false);
  };

  const updateHotel = (values) => {
    setIsUploading(true);
    updateById(values, hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setHotel((prev) => ({ ...prev, ...values }));
          toast.success(t("hotels.edit.success"));
          setIsEditing(false);
        }
      })
      .catch(() => {
        toast.error(t("hotels.edit.updateError"));
      })
      .finally(() => {
        setIsUploading(false);
        currentHotel.refresh();
      });
  };

  const handleSubmit = (values) => {
    Swal.fire({
      title: t("hotels.edit.confirmUpdateTitle"),
      text: t("hotels.edit.confirmUpdateText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("hotels.edit.confirmYes"),
      cancelButtonText: t("hotels.edit.confirmNo"),
    }).then((result) => {
      if (result.isConfirmed) {
        updateHotel(values);
      }
    });
  };

  const deletehotel = () => {
    setIsUploading(true);
    deleteById(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          toast.success(t("hotels.edit.deleteSuccess"));
          setTimeout(() => {
            navigate("/hotels");
          }, 2000);
        }
      })
      .catch(() => {
        toast.error(t("hotels.edit.deleteError"));
      })
      .finally(() => setIsUploading(false));
  };

  const handleDelete = () => {
    Swal.fire({
      title: t("hotels.edit.confirmDeleteTitle"),
      text: t("hotels.edit.confirmDeleteText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("hotels.edit.confirmYes"),
      cancelButtonText: t("hotels.edit.confirmNo"),
    }).then((result) => {
      if (result.isConfirmed) {
        deletehotel();
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    getDetailsById(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setHotel(res.item);
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          toast.error(t("hotels.edit.loadError"));
        }
      })
      .finally(() => setIsLoading(false));
  }, [hotelId, t]);

  return (
    <>
      <h4 className="display-6 mb-4">{t("hotels.edit.title")}</h4>
      <SimpleLoader isVisible={isLoading} />
      {!isLoading && (
        <div>
          {/* Form for Editable Fields */}
          <Formik
            initialValues={{
              name: hotel?.name,
              phone: hotel?.phone,
              address: hotel?.address,
              email: hotel?.email,
              taxId: hotel?.taxId,
            }}
            validationSchema={addValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize>
            {({ resetForm }) => (
              <Form>
                <Row>
                  <Col md="6">
                    <CustomField
                      name="name"
                      type="text"
                      placeholder={t("hotels.add.placeholders.name")}
                      className="form-control"
                      disabled={!isEditing || isUploading}
                    />
                  </Col>

                  <Col md="6">
                    <CustomField
                      name="phone"
                      type="text"
                      placeholder={t("hotels.add.placeholders.phone")}
                      className="form-control"
                      disabled={!isEditing || isUploading}
                    />
                  </Col>

                  <Col md="6">
                    <CustomField
                      name="address"
                      type="text"
                      placeholder={t("hotels.add.placeholders.address")}
                      className="form-control"
                      disabled={!isEditing || isUploading}
                    />
                  </Col>

                  <Col md="6">
                    <CustomField
                      name="email"
                      type="email"
                      placeholder={t("hotels.add.placeholders.email")}
                      className="form-control"
                      disabled={!isEditing || isUploading}
                    />
                  </Col>

                  <Col md="6">
                    <CustomField
                      name="taxId"
                      type="text"
                      placeholder={t("hotels.add.placeholders.taxId")}
                      className="form-control"
                      disabled={!isEditing || isUploading}
                    />
                  </Col>
                </Row>

                {/* Action Buttons */}
                <div className="mt-3">
                  {isEditing && (
                    <>
                      <Button
                        type="submit"
                        className="me-2 bg-success text-white"
                        disabled={isUploading}>
                        {isUploading ? (
                          <Spinner size="sm" />
                        ) : (
                          t("hotels.edit.save")
                        )}
                      </Button>
                      <Button
                        type="button"
                        className="me-2 bg-secondary text-white"
                        disabled={isUploading}
                        onClick={() => handleCancel(resetForm)}>
                        {t("hotels.edit.cancel")}
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            )}
          </Formik>
          {!isEditing && (
            <>
              <Button
                className="bg-dark text-white"
                type="button"
                disabled={isUploading}
                onClick={() => setIsEditing(true)}>
                {t("hotels.edit.edit")}
              </Button>
              {currentHotel.current.roleId === HOTEL_ROLES_IDS.OWNER && (
                <Button
                  className="ms-2 bg-danger text-white"
                  type="button"
                  onClick={handleDelete}
                  disabled={isUploading}>
                  {isUploading ? (
                    <Spinner size="sm" />
                  ) : (
                    t("hotels.edit.delete")
                  )}
                </Button>
              )}
            </>
          )}
          <Row className="mt-4">
            <Col>
              <strong>{t("hotels.edit.owner")}:</strong>{" "}
              <p>
                {hotel?.owner
                  ? `${hotel.owner.firstName} ${hotel.owner.lastName}`
                  : t("hotels.edit.na")}
              </p>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <strong>{t("hotels.edit.createdBy")}:</strong>
              <p>
                {hotel?.createdBy?.firstName} {hotel?.createdBy?.lastName}
              </p>
            </Col>
            <Col>
              <strong>{t("hotels.edit.dateCreated")}:</strong>
              <p>{dayjs(hotel?.dateCreated).format("DD/MM/YYYY h:mm a")}</p>
            </Col>
            <Col>
              <strong>{t("hotels.edit.modifiedBy")}:</strong>
              <p>
                {hotel?.modifiedBy?.firstName} {hotel?.modifiedBy?.lastName}
              </p>
            </Col>
            <Col>
              <strong>{t("hotels.edit.dateModified")}</strong>
              <p>{dayjs(hotel?.dateModified).format("DD/MM/YYYY h:mm a")}</p>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default HotelEdit;

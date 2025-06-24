// External Libraries
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { isEqual } from "lodash";
import Swal from "sweetalert2";
import dayjs from "dayjs";

// Internal Services/Utilities
import {
  add,
  deleteById,
  getBookingProvidersByHotelId,
  updateById,
} from "services/bookingProviderService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";

// Components
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import DataTable from "components/commonUI/tables/DataTable";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .required("El nombre es requerido"),
});

function BookingProvidersView() {
  const { hotelId } = useParams();
  const { user } = useAppContext();
  const { getTranslatedErrorMessage, t } = useLanguage(); // changed
  const [bookingProviders, setBookingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("active");
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
  });

  const breadcrumbs = [
    { label: t("booking.breadcrumb.home"), path: "/" },
    { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
    { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
  ];

  const filteredData = useMemo(() => {
    switch (isActiveFilter) {
      case "active":
        return bookingProviders.filter((item) => item.isActive === true);
      case "inactive":
        return bookingProviders.filter((item) => item.isActive === false);
      default:
        return bookingProviders;
    }
  }, [bookingProviders, isActiveFilter]);

  const toggleForm = useCallback(() => {
    let isHiding = showForm;
    setShowForm((prev) => {
      isHiding = prev;
      return !prev;
    });
    if (isHiding) {
      setInitialValues({ name: "", categoryId: "" });
    }
  }, [showForm]);

  const currentUser = useMemo(() => {
    return {
      id: user.current?.id,
      firstName: user.current?.firstName,
      lastName: user.current?.lastName,
    };
  }, [user]);

  const handleSubmit = async (values) => {
    const { id, ...data } = values;

    const result = await Swal.fire({
      title: id
        ? t("booking.providers.confirmUpdateTitle")
        : t("booking.providers.confirmAddTitle"),
      text: t("booking.providers.confirmText"),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: t("booking.providers.confirmSave"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: Boolean(id),
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("booking.providers.savingTitle"),
        text: t("booking.providers.savingText"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      setIsUploading(true);
      let response;
      if (values.id) {
        response = await updateById(values, hotelId);
      } else {
        response = await add(values, hotelId);
      }

      Swal.close();

      if (response?.isSuccessful) {
        if (id) {
          setBookingProviders((prev) => {
            const copyOfPrev = [...prev];
            const index = copyOfPrev.findIndex((item) => item.id === id);
            if (index !== -1) {
              copyOfPrev[index] = {
                ...copyOfPrev[index],
                ...data,
                modifiedBy: {
                  ...currentUser,
                },
                dateModified: new Date(),
              };
              return copyOfPrev;
            }
            return prev;
          });
        } else {
          setBookingProviders((prev) => [
            ...prev,
            {
              ...data,
              id: response.item,
              createdBy: {
                ...currentUser,
              },
              dateCreated: new Date(),
              modifiedBy: {
                ...currentUser,
              },
              dateModified: new Date(),
              isActive: true,
            },
          ]);
        }
        toggleForm();
        await Swal.fire({
          icon: "success",
          title: t("booking.providers.saveSuccessTitle"),
          text: t("booking.providers.saveSuccessText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al guardar el proveedor de reservas");
      }
    } catch (error) {
      Swal.close(); // Close loading
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("booking.providers.saveErrorText"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateClick = (bookingProvider) => {
    setInitialValues({
      id: bookingProvider.id,
      name: bookingProvider.name,
    });
    setShowForm(true);
  };

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: t("booking.providers.deleteConfirmTitle"),
        text: t("booking.providers.deleteConfirmText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("booking.providers.deleteConfirmYes"),
        cancelButtonText: t("common.cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setIsUploading(true);
        Swal.fire({
          title: t("booking.providers.deletingTitle"),
          text: t("booking.providers.deletingText"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id, hotelId);
        if (response.isSuccessful) {
          setBookingProviders((prev) => {
            const copyOfPrev = [...prev];
            const index = copyOfPrev.findIndex((item) => item.id === id);
            if (index !== -1) {
              copyOfPrev[index] = {
                ...copyOfPrev[index],
                modifiedBy: {
                  ...currentUser,
                },
                dateModified: new Date(),
                isActive: false,
              };
              return copyOfPrev;
            }
            return prev;
          });
          await Swal.fire({
            icon: "success",
            title: t("booking.providers.deleteSuccessTitle"),
            text: t("booking.providers.deleteSuccessText"),
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
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
      } finally {
        setIsUploading(false);
      }
    },
    [currentUser, getTranslatedErrorMessage, t, hotelId]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        maxSize: 50,
      },
      {
        accessorKey: "name",
        header: t("booking.providers.name"),
      },
      {
        accessorKey: "isActive",
        header: t("booking.providers.active"),
        maxSize: 70,
        cell: (info) => (info.getValue() ? t("common.yes") : t("common.no")),
      },
      {
        header: t("booking.providers.actions"),
        enableSorting: false,
        maxSize: 140,
        cell: (info) => {
          const bookingProvider = info.row.original;
          return (
            <>
              {bookingProvider.isActive && (
                <div style={{ minWidth: "max-content" }}>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateClick(bookingProvider);
                    }}>
                    {t("booking.providers.edit")}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(bookingProvider.id);
                    }}>
                    {t("booking.providers.delete")}
                  </Button>
                </div>
              )}
            </>
          );
        },
      },
    ],
    [handleDeleteClick, t]
  );

  const onGetBookingProvidersSuccess = (response) => {
    if (response.isSuccessful) {
      setBookingProviders(response.items);
    }
  };

  const onGetBookingProvidersError = useCallback(
    (error) => {
      if (error?.response?.status !== 404) {
        toast.error(t("booking.providers.loadError"));
      }
    },
    [t]
  );

  useEffect(() => {
    setLoading(true);
    getBookingProvidersByHotelId(hotelId)
      .then(onGetBookingProvidersSuccess)
      .catch(onGetBookingProvidersError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, onGetBookingProvidersError]);

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("booking.providers.title")}
      />
      <ErrorBoundary>
        <h3>{t("booking.providers.title")}</h3>

        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? t("booking.providers.editTitle")
                  : t("booking.providers.newTitle")}
              </CardTitle>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize>
                {({ values }) => (
                  <Form>
                    <ErrorAlert />
                    <Row>
                      <Col md="4">
                        <CustomField
                          name="name"
                          type="text"
                          className="form-control"
                          placeholder={t("booking.providers.namePlaceholder")}
                          isRequired={true}
                        />
                      </Col>

                      <Col md="auto" className="align-content-center">
                        <div className="text-center">
                          <Button
                            disabled={
                              isUploading ||
                              isEqual(
                                { ...values, name: values.name.trim() },
                                {
                                  ...initialValues,
                                  name: initialValues.name.trim(),
                                }
                              )
                            }
                            type="submit"
                            className="btn bg-success text-white mb-3">
                            {isUploading ? (
                              <Spinner size="sm" color="light" />
                            ) : initialValues.id ? (
                              t("booking.providers.update")
                            ) : (
                              t("booking.providers.add")
                            )}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Formik>
            </CardBody>
          </Card>
        )}
        <div className="mt-4">
          <Button color={showForm ? "warning" : "dark"} onClick={toggleForm}>
            {showForm ? t("common.cancel") : t("booking.providers.addProvider")}
          </Button>
        </div>
        <div className="mb-3 float-end">
          <Label for="isActiveFilter" className="text-dark">
            {t("booking.providers.filterByStatus")}
          </Label>
          <Input
            id="isActiveFilter"
            type="select"
            style={{ width: "auto" }}
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}>
            <option value="active">{t("booking.providers.active")}</option>
            <option value="inactive">{t("booking.providers.inactive")}</option>
            <option value="all">{t("booking.providers.all")}</option>
          </Input>
        </div>
        <div className="table-responsive w-100">
          <DataTable
            data={filteredData}
            columns={columns}
            loading={loading}
            sorting={sorting}
            onSortingChange={setSorting}
            expandedRowRender={(row) => (
              <div className="p-2 border border-info-subtle bg-light">
                <Row>
                  <Col md={6}>
                    <strong>{t("booking.auditableInfo.createdBy")}</strong>{" "}
                    {row.original.createdBy?.firstName}{" "}
                    {row.original.createdBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>{t("booking.auditableInfo.dateCreated")}</strong>{" "}
                    {dayjs(row.original.dateCreated).format(
                      "DD/MM/YYYY - h:mm A"
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <strong>{t("booking.auditableInfo.modifiedBy")}</strong>{" "}
                    {row.original.modifiedBy?.firstName}{" "}
                    {row.original.modifiedBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>{t("booking.auditableInfo.dateModified")}</strong>{" "}
                    {dayjs(row.original.dateModified).format(
                      "DD/MM/YYYY - h:mm A"
                    )}
                  </Col>
                </Row>
              </div>
            )}
          />
        </div>
      </ErrorBoundary>
    </>
  );
}

export default BookingProvidersView;

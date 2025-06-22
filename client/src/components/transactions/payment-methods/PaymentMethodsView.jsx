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
  getPaymentMethodsByHotelId,
  updateById,
} from "services/paymentMethodService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";

// Components
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import DataTable from "components/commonUI/tables/DataTable"; // Add this import

function PaymentMethodsView() {
  const { t } = useLanguage();
  const { hotelId } = useParams();
  const { user } = useAppContext();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("active");
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, t("transactions.paymentMethods.validation.nameMin", { min: 2 }))
      .max(
        100,
        t("transactions.paymentMethods.validation.nameMax", { max: 100 })
      )
      .required(t("transactions.paymentMethods.validation.nameRequired")),
  });

  const breadcrumbs = [
    { label: t("common.breadcrumbs.home"), path: "/" },
    { label: t("common.breadcrumbs.hotels"), path: "/hotels" },
    { label: t("common.breadcrumbs.hotel"), path: `/hotels/${hotelId}` },
  ];

  const filteredData = useMemo(() => {
    switch (isActiveFilter) {
      case "active":
        return paymentMethods.filter((item) => item.isActive === true);
      case "inactive":
        return paymentMethods.filter((item) => item.isActive === false);
      default:
        return paymentMethods;
    }
  }, [paymentMethods, isActiveFilter]);

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
      title: `Está seguro de que desea ${
        id ? "actualizar" : "agregar"
      } el método de pago?`,
      text: id
        ? "Esta acción puede afectar transacciones existentes."
        : "Revise los datos antes de continuar.",
      icon: id ? "warning" : "info",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      reverseButtons: Boolean(id),
      confirmButtonColor: id ? "red" : "#0d6efd",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Guardando método de pago",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      setIsUploading(true);
      let response;
      if (values.id) {
        response = await updateById(values, id, hotelId);
      } else {
        response = await add(values, hotelId);
      }

      Swal.close();

      if (response?.isSuccessful) {
        if (id) {
          setPaymentMethods((prev) => {
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
          setPaymentMethods((prev) => [
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
          title: "Método de pago guardado",
          text: "El método de pago se ha guardado correctamente",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al guardar el método de pago");
      }
    } catch (error) {
      Swal.close(); // Close loading
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el método de pago, intente nuevamente.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateClick = (paymentMethod) => {
    setInitialValues({
      id: paymentMethod.id,
      name: paymentMethod.name,
    });
    setShowForm(true);
  };

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "¿Está seguro?",
        text: "No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setIsUploading(true);
        Swal.fire({
          title: "Eliminando el método de pago",
          text: "Por favor espera",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id, hotelId);
        if (response.isSuccessful) {
          setPaymentMethods((prev) => {
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
            title: "Método de pago eliminado",
            text: "El método de pago se ha eliminado correctamente",
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        Swal.close(); // Close loading
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el método de pago, intente nuevamente.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [currentUser, hotelId]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: t("transactions.paymentMethods.table.id"),
        maxSize: 50,
      },
      {
        accessorKey: "name",
        header: t("transactions.paymentMethods.table.name"),
      },
      {
        accessorKey: "isActive",
        header: t("transactions.paymentMethods.table.active"),
        cell: (info) => (info.getValue() ? t("common.yes") : t("common.no")),
        maxSize: 70,
      },
      {
        header: t("transactions.paymentMethods.table.actions"),
        enableSorting: false,
        maxSize: 140,
        cell: (info) => {
          const paymentMethod = info.row.original;
          return (
            <>
              {paymentMethod.isActive && (
                <div style={{ minWidth: "max-content" }}>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateClick(paymentMethod);
                    }}>
                    {t("transactions.paymentMethods.table.edit")}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(paymentMethod.id);
                    }}>
                    {t("transactions.paymentMethods.table.delete")}
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

  const onGetPaymentMethodsSuccess = (response) => {
    if (response.isSuccessful) {
      setPaymentMethods(response.items);
    }
  };

  const onGetPaymentMethodsError = (error) => {
    if (error?.response?.status !== 404) {
      toast.error("Error al cargar los métodos de pago");
    }
  };

  useEffect(() => {
    setLoading(true);
    getPaymentMethodsByHotelId(hotelId)
      .then(onGetPaymentMethodsSuccess)
      .catch(onGetPaymentMethodsError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId]);

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("transactions.paymentMethods.title")}
      />
      <ErrorBoundary>
        <h3>{t("transactions.paymentMethods.title")}</h3>
        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? t("transactions.paymentMethods.editTitle")
                  : t("transactions.paymentMethods.newTitle")}
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
                          placeholder={t(
                            "transactions.paymentMethods.namePlaceholder"
                          )}
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
                              t("transactions.paymentMethods.update")
                            ) : (
                              t("transactions.paymentMethods.add")
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
            {showForm
              ? t("common.cancel")
              : t("transactions.paymentMethods.addPaymentMethod")}
          </Button>
        </div>
        <div className="mb-3 float-end">
          <Label for="isActiveFilter" className="text-dark">
            {t("transactions.paymentMethods.filterByStatus")}
          </Label>
          <Input
            id="isActiveFilter"
            type="select"
            style={{ width: "auto" }}
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}>
            <option value="active">
              {t("transactions.paymentMethods.active")}
            </option>
            <option value="inactive">
              {t("transactions.paymentMethods.inactive")}
            </option>
            <option value="all">{t("transactions.paymentMethods.all")}</option>
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
                    <strong>
                      {t("transactions.paymentMethods.createdBy")}
                    </strong>{" "}
                    {row.original.createdBy?.firstName}{" "}
                    {row.original.createdBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>
                      {t("transactions.paymentMethods.dateCreated")}
                    </strong>{" "}
                    {dayjs(row.original.dateCreated).format(
                      "DD/MM/YYYY - h:mm A"
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <strong>
                      {t("transactions.paymentMethods.modifiedBy")}
                    </strong>{" "}
                    {row.original.modifiedBy?.firstName}{" "}
                    {row.original.modifiedBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>
                      {t("transactions.paymentMethods.dateModified")}
                    </strong>{" "}
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

export default PaymentMethodsView;

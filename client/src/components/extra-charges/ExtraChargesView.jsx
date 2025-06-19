// External Libraries
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import Swal from "sweetalert2";
import dayjs from "dayjs";

// Internal Services/Utilities
import {
  getByHotelId,
  add,
  updateById,
  deleteById,
} from "services/extraChargeService";
import { useAppContext } from "contexts/GlobalAppContext";
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import ChargeTypesExplanationIcon from "components/extra-charges/ChargeTypesExplanationIcon";
import {
  EXTRA_CHARGE_TYPES,
  formatExtraChargeAmount,
  EXTRA_CHARGE_TYPES_BY_ID,
  EXTRA_CHARGE_TYPE_IDS,
  useAddValidationSchema,
} from "components/extra-charges/constants";
import { useLanguage } from "contexts/LanguageContext"; // already imported
import DataTable from "components/commonUI/tables/DataTable"; // Add this import

const ExtraChargesView = () => {
  const { hotelId } = useParams();
  const { user } = useAppContext(); // Assuming you have user context
  const [extraCharges, setExtraCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("active");
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    typeId: "",
    amount: "",
  });

  const { getTranslatedErrorMessage, t } = useLanguage(); // changed
  const validationSchema = useAddValidationSchema();

  const breadcrumbs = [
    { label: t("booking.breadcrumb.home"), path: "/" },
    { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
    { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
  ];

  const filteredData = useMemo(() => {
    switch (isActiveFilter) {
      case "active":
        return extraCharges.filter((item) => item.isActive === true);
      case "inactive":
        return extraCharges.filter((item) => item.isActive === false);
      default:
        return extraCharges;
    }
  }, [extraCharges, isActiveFilter]);

  const toggleForm = useCallback(() => {
    let isHiding = showForm;
    setShowForm((prev) => {
      return !prev;
    });
    if (isHiding) {
      setInitialValues({ name: "", typeId: "", amount: "" });
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
    const amount =
      Number(values.typeId) === 1 ? values.amount / 100 : values.amount;

    const result = await Swal.fire({
      title: id
        ? t("extraCharges.confirmUpdateTitle")
        : t("extraCharges.confirmAddTitle"),
      text: id
        ? t("extraCharges.confirmUpdateText")
        : t("extraCharges.confirmAddText"),
      icon: id ? "warning" : "info",
      showCancelButton: true,
      confirmButtonText: t("extraCharges.confirmSave"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: Boolean(id),
      confirmButtonColor: id ? "red" : "#0d6efd",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("extraCharges.savingTitle"),
        text: t("extraCharges.savingText"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      setIsUploading(true);
      let response;
      if (values.id) {
        response = await updateById({ ...values, amount }, id);
      } else {
        response = await add({ ...values, amount }, hotelId);
      }

      Swal.close();

      if (response?.isSuccessful) {
        if (id) {
          setExtraCharges((prev) => {
            const copyOfPrev = [...prev];
            const index = copyOfPrev.findIndex((item) => item.id === id);
            if (index !== -1) {
              copyOfPrev[index] = {
                ...copyOfPrev[index],
                ...data,
                amount,
                type: { id: values.typeId },
                modifiedBy: { ...currentUser },
                dateModified: new Date(),
              };
              return copyOfPrev;
            }
            return prev;
          });
        } else {
          setExtraCharges((prev) => [
            ...prev,
            {
              ...data,
              amount,
              id: response.item,
              type: { id: values.typeId },
              createdBy: { ...currentUser },
              dateCreated: new Date(),
              modifiedBy: { ...currentUser },
              dateModified: new Date(),
              isActive: true,
            },
          ]);
        }
        toggleForm();
        await Swal.fire({
          icon: "success",
          title: t("extraCharges.saveSuccessTitle"),
          text: t("extraCharges.saveSuccessText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al guardar el cargo adicional");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("extraCharges.saveErrorText"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateClick = (charge) => {
    const amount =
      Number(charge.type.id) === 1 ? charge.amount * 100 : charge.amount;
    setInitialValues({
      id: charge.id,
      name: charge.name,
      typeId: charge.type.id,
      amount,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: t("extraCharges.deleteConfirmTitle"),
        text: t("extraCharges.deleteConfirmText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("extraCharges.deleteConfirmYes"),
        cancelButtonText: t("common.cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setIsUploading(true);
        Swal.fire({
          title: t("extraCharges.deletingTitle"),
          text: t("extraCharges.deletingText"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id);
        if (response.isSuccessful) {
          setExtraCharges((prev) => {
            const copyOfPrev = [...prev];
            const index = copyOfPrev.findIndex((item) => item.id === id);
            if (index !== -1) {
              copyOfPrev[index] = {
                ...copyOfPrev[index],
                modifiedBy: { ...currentUser },
                dateModified: new Date(),
                isActive: false,
              };
              return copyOfPrev;
            }
            return prev;
          });
          await Swal.fire({
            icon: "success",
            title: t("extraCharges.deleteSuccessTitle"),
            text: t("extraCharges.deleteSuccessText"),
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
    [currentUser, getTranslatedErrorMessage, t]
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
        header: t("extraCharges.name"),
        minSize: 200,
      },
      {
        accessorKey: "amount",
        header: t("extraCharges.amount"),
        maxSize: 200,
        cell: (info) =>
          formatExtraChargeAmount(info.getValue(), info.row.original.type.id),
      },
      {
        accessorKey: "type",
        header: t("extraCharges.type"),
        cell: (info) =>
          t(EXTRA_CHARGE_TYPES_BY_ID[info.getValue().id]) ||
          t("extraCharges.na"),
      },
      {
        accessorKey: "isActive",
        header: t("extraCharges.active"),
        maxSize: 70,
        cell: (info) => (info.getValue() ? t("common.yes") : t("common.no")),
      },
      {
        header: t("extraCharges.actions"),
        enableSorting: false,
        maxSize: 140,
        cell: (info) => {
          const charge = info.row.original;
          return (
            <>
              {charge.isActive && (
                <div style={{ minWidth: "max-content" }}>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateClick(charge);
                    }}>
                    {t("extraCharges.edit")}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(charge.id);
                    }}>
                    {t("extraCharges.delete")}
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

  const onGetExtraChargesSuccess = (response) => {
    if (response.isSuccessful) {
      setExtraCharges(response.items);
    }
  };

  const onGetExtraChargesError = useCallback(
    (error) => {
      if (error?.response?.status !== 404) {
        toast.error(t("extraCharges.loadError"));
      }
    },
    [t]
  );

  useEffect(() => {
    setLoading(true);
    getByHotelId(hotelId)
      .then(onGetExtraChargesSuccess)
      .catch(onGetExtraChargesError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, onGetExtraChargesError]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active={t("extraCharges.title")} />
      <h3>
        {t("extraCharges.title")}
        <ChargeTypesExplanationIcon />
      </h3>

      <ErrorBoundary>
        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? t("extraCharges.editTitle")
                  : t("extraCharges.newTitle")}
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
                          placeholder={t("extraCharges.namePlaceholder")}
                          isRequired={true}
                        />
                      </Col>
                      <Col md="4">
                        <InputGroup>
                          {values.typeId && Number(values.typeId) !== 1 && (
                            <InputGroupText className="mb-3">$</InputGroupText>
                          )}
                          <CustomField
                            name="amount"
                            type="number"
                            className="form-control"
                            placeholder={t("extraCharges.amountPlaceholder")}
                            isRequired={true}
                          />
                          {values.typeId && Number(values.typeId) === 1 && (
                            <InputGroupText className="mb-3">%</InputGroupText>
                          )}
                          <CustomField
                            name="typeId"
                            as="select"
                            className="form-select"
                            placeholder={t("extraCharges.typePlaceholder")}
                            isRequired={true}>
                            <option value="" disabled>
                              {t("extraCharges.typeSelect")}
                            </option>
                            {EXTRA_CHARGE_TYPES.filter(
                              (type) =>
                                type.value !== EXTRA_CHARGE_TYPE_IDS.CUSTOM
                            ).map((type) => (
                              <option key={type.value} value={type.value}>
                                {t(type.label)}
                              </option>
                            ))}
                          </CustomField>
                        </InputGroup>
                      </Col>
                      <Col md="auto" className="align-content-center">
                        <div className="text-center">
                          <Button
                            disabled={isUploading}
                            type="submit"
                            className="btn bg-success text-white mb-3">
                            {isUploading ? (
                              <Spinner size="sm" color="light" />
                            ) : initialValues.id ? (
                              t("extraCharges.update")
                            ) : (
                              t("extraCharges.add")
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
            {showForm ? t("common.cancel") : t("extraCharges.addExtraCharge")}
          </Button>
        </div>
        <div className="mb-3 float-end">
          <Label for="isActiveFilter" className="text-dark">
            {t("extraCharges.filterByStatus")}
          </Label>
          <Input
            id="isActiveFilter"
            type="select"
            style={{ width: "auto" }}
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}>
            <option value="active">{t("extraCharges.active")}</option>
            <option value="inactive">{t("extraCharges.inactive")}</option>
            <option value="all">{t("extraCharges.all")}</option>
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
                    <strong>{t("extraCharges.createdBy")}</strong>{" "}
                    {row.original.createdBy?.firstName}{" "}
                    {row.original.createdBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>{t("extraCharges.dateCreated")}</strong>{" "}
                    {dayjs(row.original.dateCreated).format(
                      "DD/MM/YYYY - h:mm A"
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <strong>{t("extraCharges.modifiedBy")}</strong>{" "}
                    {row.original.modifiedBy?.firstName}{" "}
                    {row.original.modifiedBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>{t("extraCharges.dateModified")}</strong>{" "}
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
};

export default ExtraChargesView;

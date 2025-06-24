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
  InputGroup,
  InputGroupText,
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
  getTransactionSubcategories,
  updateById,
} from "services/transactionsSubcategoryService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";

// Components
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import DataTable from "components/commonUI/tables/DataTable"; // Add this import
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";

// Constants/Static Data
import { TRANSACTION_CATEGORIES } from "components/transactions/constants";

function TransactionSubcategoriesView() {
  const { hotelId } = useParams();
  const { user } = useAppContext();
  const { t } = useLanguage();
  const [transactionSubcategories, setTransactionSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("active");
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    categoryId: "",
  });

  const breadcrumbs = [
    { label: t("common.breadcrumbs.home"), path: "/" },
    { label: t("common.breadcrumbs.hotels"), path: "/hotels" },
    { label: t("common.breadcrumbs.hotel"), path: `/hotels/${hotelId}` },
  ];

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, (params) =>
        t("transactions.subcategories.validation.nameMin", params)
      )
      .max(100, (params) =>
        t("transactions.subcategories.validation.nameMax", params)
      )
      .required(t("transactions.subcategories.validation.nameRequired")),
    categoryId: Yup.string().required(
      t("transactions.subcategories.validation.categoryRequired")
    ),
  });

  const filteredData = useMemo(() => {
    switch (isActiveFilter) {
      case "active":
        return transactionSubcategories.filter(
          (item) => item.isActive === true
        );
      case "inactive":
        return transactionSubcategories.filter(
          (item) => item.isActive === false
        );
      default:
        return transactionSubcategories;
    }
  }, [transactionSubcategories, isActiveFilter]);

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
        ? t("transactions.subcategories.confirmUpdateTitle")
        : t("transactions.subcategories.confirmAddTitle"),
      text: id
        ? t("transactions.subcategories.confirmUpdateText")
        : t("transactions.subcategories.confirmAddText"),
      icon: id ? "warning" : "info",
      showCancelButton: true,
      confirmButtonText: t("transactions.subcategories.confirmSave"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: Boolean(id),
      confirmButtonColor: id ? "red" : "#0d6efd",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("transactions.subcategories.savingTitle"),
        text: t("transactions.subcategories.savingText"),
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
          setTransactionSubcategories((prev) => {
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
          setTransactionSubcategories((prev) => [
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
          title: t("transactions.subcategories.saveSuccessTitle"),
          text: t("transactions.subcategories.saveSuccessText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al guardar la subcategoría");
      }
    } catch (error) {
      Swal.close(); // Close loading
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("transactions.subcategories.saveErrorText"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateClick = (subcategory) => {
    setInitialValues({
      id: subcategory.id,
      name: subcategory.name,
      categoryId: subcategory.categoryId,
    });
    setShowForm(true);
  };

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: t("transactions.subcategories.deleteConfirmTitle"),
        text: t("transactions.subcategories.deleteConfirmText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("transactions.subcategories.deleteConfirmYes"),
        cancelButtonText: t("common.cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setIsUploading(true);
        Swal.fire({
          title: t("transactions.subcategories.deletingTitle"),
          text: t("transactions.subcategories.deletingText"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id, hotelId);
        if (response.isSuccessful) {
          setTransactionSubcategories((prev) => {
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
            title: t("transactions.subcategories.deleteSuccessTitle"),
            text: t("transactions.subcategories.deleteSuccessText"),
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        Swal.close(); // Close loading
        await Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: t("transactions.subcategories.saveErrorText"),
        });
      } finally {
        setIsUploading(false);
      }
    },
    [currentUser, t, hotelId]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: t("rooms.table.id"),
        maxSize: 50,
      },
      {
        accessorKey: "name",
        header: t("transactions.subcategories.name"),
      },
      {
        accessorKey: "categoryId",
        header: t("transactions.subcategories.category"),
        maxSize: 150,
        cell: (info) => {
          const category = TRANSACTION_CATEGORIES.find(
            (cat) => Number(cat.id) === Number(info.getValue())
          );
          return category ? t(category.name) : t("hotels.edit.na");
        },
      },
      {
        accessorKey: "isActive",
        header: t("rooms.table.active"),
        maxSize: 70,
        cell: (info) =>
          info.getValue()
            ? t("extraCharges.active")
            : t("extraCharges.inactive"),
      },
      {
        header: t("extraCharges.actions"),
        enableSorting: false,
        maxSize: 140,
        cell: (info) => {
          const subcategory = info.row.original;
          return (
            <>
              {subcategory.isActive && (
                <div style={{ minWidth: "max-content" }}>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateClick(subcategory);
                    }}>
                    {t("extraCharges.edit")}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(subcategory.id);
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

  const onGetTransactionSubcategoriesSuccess = (response) => {
    if (response.isSuccessful) {
      setTransactionSubcategories(response.items);
    }
  };

  const onGetTransactionSubcategoriesError = useCallback(
    (error) => {
      if (error?.response?.status !== 404) {
        toast.error(t("transactions.errors.loadTransactionSubcategories"));
      }
    },
    [t]
  );

  useEffect(() => {
    setLoading(true);
    getTransactionSubcategories(hotelId)
      .then(onGetTransactionSubcategoriesSuccess)
      .catch(onGetTransactionSubcategoriesError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, onGetTransactionSubcategoriesError]);

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("transactions.subcategories.title")}
      />
      <ErrorBoundary>
        <h3>{t("transactions.subcategories.title")}</h3>
        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? t("transactions.subcategories.editTitle")
                  : t("transactions.subcategories.newTitle")}
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
                          placeholder={t("transactions.subcategories.name")}
                          isRequired={true}
                        />
                      </Col>
                      <Col md="4">
                        <InputGroup>
                          <CustomField
                            name="categoryId"
                            as="select"
                            className="form-control"
                            placeholder={t(
                              "transactions.subcategories.category"
                            )}
                            isRequired={true}>
                            <option value="">
                              {t("transactions.subcategories.category")}
                            </option>
                            {TRANSACTION_CATEGORIES.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {t(cat.name)}
                              </option>
                            ))}
                          </CustomField>
                          <InputGroupText className="mb-3">
                            <TransactionCategoriesExplanationIcon />
                          </InputGroupText>
                        </InputGroup>
                      </Col>
                      <Col md="4" className="align-content-center">
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
            {showForm
              ? t("transactions.subcategories.cancel")
              : t("transactions.subcategories.add")}
          </Button>
        </div>
        <div className="mb-3 float-end">
          <Label for="isActiveFilter" className="text-dark">
            {t("transactions.subcategories.filterByStatus")}
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
}

export default TransactionSubcategoriesView;

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
import Swal from "sweetalert2";
import dayjs from "dayjs";

// Internal Services/Utilities
import {
  getByHotelId,
  add,
  updateById,
  deleteById,
} from "services/roomService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import DataTable from "components/commonUI/tables/DataTable";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";

const RoomsView = () => {
  const { hotelId } = useParams();
  const { user } = useAppContext(); // Assuming you have user context
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("active");
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    capacity: "",
    description: "",
  });

  const { getTranslatedErrorMessage, t } = useLanguage();

  const breadcrumbs = useMemo(() => {
    return hotelId
      ? new BreadcrumbBuilder(t)
          .addHotel(hotelId)
          .addActive(t("rooms.breadcrumbActive"))
          .build()
      : null;
  }, [hotelId, t]);

  const filteredData = useMemo(() => {
    switch (isActiveFilter) {
      case "active":
        return rooms.filter((item) => item.isActive === true);
      case "inactive":
        return rooms.filter((item) => item.isActive === false);
      default:
        return rooms;
    }
  }, [rooms, isActiveFilter]);

  const toggleForm = useCallback(() => {
    let isHiding = showForm;
    setShowForm((prev) => {
      isHiding = prev;
      return !prev;
    });
    if (isHiding) {
      setInitialValues({ name: "", capacity: "", description: "" });
    }
  }, [showForm]);

  const currentUser = useMemo(() => {
    return {
      id: user.current?.id,
      firstName: user.current?.firstName,
      lastName: user.current?.lastName,
    };
  }, [user]);

  const roomsTotalCapacity = useMemo(() => {
    return rooms?.length > 0
      ? rooms.reduce((total, room) => {
          if (room.isActive) {
            return total + (room.capacity || 0);
          }
          return total;
        }, 0)
      : 0;
  }, [rooms]);

  const roomsCount = useMemo(() => {
    return rooms?.length > 0 ? rooms.filter((room) => room.isActive).length : 0;
  }, [rooms]);

  // Validation schema with translation
  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .min(2, t("rooms.validation.nameMin"))
          .max(100, t("rooms.validation.nameMax"))
          .required(t("rooms.validation.nameRequired")),
        capacity: Yup.number()
          .min(1, t("rooms.validation.capacityMin"))
          .max(50, t("rooms.validation.capacityMax"))
          .required(t("rooms.validation.capacityRequired")),
        description: Yup.string()
          .min(2, t("rooms.validation.descriptionMin"))
          .max(100, t("rooms.validation.descriptionMax")),
      }),
    [t]
  );

  const handleSubmit = async (values) => {
    const { id, ...data } = values;

    const result = await Swal.fire({
      title: id
        ? t("rooms.form.updateConfirmTitle")
        : t("rooms.form.addConfirmTitle"),
      text: id
        ? t("rooms.form.updateConfirmText")
        : t("rooms.form.addConfirmText"),
      icon: id ? "warning" : "info",
      showCancelButton: true,
      confirmButtonText: t("rooms.form.save"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: Boolean(id),
      confirmButtonColor: id ? "red" : "#0d6efd",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("rooms.form.savingTitle"),
        text: t("rooms.form.savingText"),
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
          setRooms((prev) => {
            const copyOfPrev = [...prev];
            const index = copyOfPrev.findIndex((item) => item.id === id);
            if (index !== -1) {
              copyOfPrev[index] = {
                ...copyOfPrev[index],
                ...data,
                modifiedBy: { ...currentUser },
                dateModified: new Date(),
              };
              return copyOfPrev;
            }
            return prev;
          });
        } else {
          setRooms((prev) => [
            ...prev,
            {
              ...data,
              id: response.item,
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
          title: t("rooms.form.saveSuccessTitle"),
          text: t("rooms.form.saveSuccessText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al guardar la habitación");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("rooms.form.saveErrorText"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateClick = (room) => {
    setInitialValues({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      description: room.description,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: t("rooms.form.deleteConfirmTitle"),
        text: t("rooms.form.deleteConfirmText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("rooms.form.deleteConfirmYes"),
        cancelButtonText: t("common.cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setIsUploading(true);
        Swal.fire({
          title: t("rooms.form.deletingTitle"),
          text: t("rooms.form.deletingText"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id, hotelId);
        if (response.isSuccessful) {
          setRooms((prev) => {
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
            title: t("rooms.form.deleteSuccessTitle"),
            text: t("rooms.form.deleteSuccessText"),
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
        header: t("rooms.table.id"),
        maxSize: 50,
      },
      {
        accessorKey: "name",
        header: t("rooms.table.name"),
      },
      {
        accessorKey: "capacity",
        header: t("rooms.table.capacity"),
        maxSize: 80,
        cell: (info) => `${info.getValue()} ${t("rooms.table.people")}`,
      },
      {
        accessorKey: "isActive",
        header: t("rooms.table.active"),
        maxSize: 70,
        cell: (info) => (info.getValue() ? t("common.yes") : t("common.no")),
      },
      {
        accessorKey: "description",
        header: t("rooms.table.description"),
        maxSize: 300,
        minSize: 150,
      },
      {
        header: t("rooms.table.actions"),
        enableSorting: false,
        maxSize: 140,
        cell: (info) => {
          const room = info.row.original;
          return (
            <>
              {room.isActive && (
                <div style={{ minWidth: "max-content" }}>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateClick(room);
                    }}>
                    {t("rooms.table.edit")}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(room.id);
                    }}>
                    {t("rooms.table.delete")}
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

  const onGetRoomsSuccess = (response) => {
    if (response.isSuccessful) {
      setRooms(response.items);
    }
  };

  const onGetRoomsError = useCallback(
    (error) => {
      if (error?.response?.status !== 404) {
        toast.error(t("rooms.loadError"));
      }
    },
    [t]
  );

  useEffect(() => {
    setLoading(true);
    getByHotelId(hotelId)
      .then(onGetRoomsSuccess)
      .catch(onGetRoomsError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, onGetRoomsError]);

  return (
    <>
      {breadcrumbs}
      <ErrorBoundary>
        <h3>{t("rooms.title")}</h3>

        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? t("rooms.form.editTitle")
                  : t("rooms.form.newTitle")}
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
                      <Col md="3">
                        <CustomField
                          name="name"
                          type="text"
                          className="form-control"
                          placeholder={t("rooms.form.namePlaceholder")}
                          isRequired={true}
                        />
                      </Col>
                      <Col md="3">
                        <CustomField
                          name="capacity"
                          type="number"
                          className="form-control"
                          placeholder={t("rooms.form.capacityPlaceholder")}
                          isRequired={true}
                        />
                      </Col>
                      <Col md="3">
                        <CustomField
                          name="description"
                          type="text"
                          className="form-control"
                          placeholder={t("rooms.form.descriptionPlaceholder")}
                        />
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
                              t("rooms.form.update")
                            ) : (
                              t("rooms.form.add")
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
            {showForm ? t("common.cancel") : t("rooms.form.addRoom")}
          </Button>
        </div>
        <Row>
          <Col md="auto" className="align-content-end">
            <p className="text-dark fw-bold fs-5 mb-0">
              {t("rooms.totalRooms")}: {roomsCount}
            </p>
            <p className="text-dark fw-bold fs-5 mb-0">
              {t("rooms.totalCapacity")}: {roomsTotalCapacity}{" "}
              {t("rooms.table.people")}
            </p>
          </Col>
          <Col>
            <div className="mb-3 float-end">
              <Label for="isActiveFilter" className="text-dark">
                {t("rooms.filterByStatus")}
              </Label>
              <Input
                id="isActiveFilter"
                type="select"
                style={{ width: "auto" }}
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value)}>
                <option value="active">{t("rooms.active")}</option>
                <option value="inactive">{t("rooms.inactive")}</option>
                <option value="all">{t("rooms.all")}</option>
              </Input>
            </div>
          </Col>
        </Row>

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
                    <strong>{t("rooms.table.createdBy")}</strong>{" "}
                    {row.original.createdBy?.firstName}{" "}
                    {row.original.createdBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>{t("rooms.table.dateCreated")}</strong>{" "}
                    {dayjs(row.original.dateCreated).format(
                      "DD/MM/YYYY - h:mm A"
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <strong>{t("rooms.table.modifiedBy")}</strong>{" "}
                    {row.original.modifiedBy?.firstName}{" "}
                    {row.original.modifiedBy?.lastName}
                  </Col>
                  <Col md={6}>
                    <strong>{t("rooms.table.dateModified")}</strong>{" "}
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

export default RoomsView;

// External Libraries
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faArrowDownWideShort,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
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
import classNames from "classnames";

// Internal Services/Utilities
import {
  getByHotelId,
  add,
  updateById,
  deleteById,
} from "services/roomService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

// Validation Schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .required("El nombre es requerido"),
  capacity: Yup.number()
    .min(1, "La capacidad debe ser al menos 1")
    .required("La capacidad es requerida"),
  description: Yup.string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(100, "La descripción no puede exceder los 100 caracteres"),
});

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

  const { getTranslatedErrorMessage } = useLanguage();

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

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
    let isHiding = false;
    setShowForm((prev) => {
      isHiding = prev;
      return !prev;
    });
    if (isHiding) {
      setInitialValues({ name: "", capacity: "", description: "" });
    }
  }, []);

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
          return total + (room.capacity || 0);
        }, 0)
      : 0;
  }, [rooms]);

  const handleSubmit = async (values) => {
    const { id, ...data } = values;

    const result = await Swal.fire({
      title: `Está seguro de que desea ${
        id ? "actualizar" : "agregar"
      } la habitación?`,
      text: id
        ? "Esta acción puede afectar reservas existentes."
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
        title: "Guardando habitación",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      setIsUploading(true);
      let response;
      if (values.id) {
        response = await updateById(values, id);
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
          title: "Habitación guardada",
          text: "La habitación se ha guardado correctamente",
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
        title: "Error",
        text: "No se pudo guardar la habitación, intente nuevamente.",
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
          title: "Eliminando la habitación",
          text: "Por favor espera",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id);
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
            title: "Habitación eliminada",
            text: "La habitación se ha eliminado correctamente",
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        const errorMessage = getTranslatedErrorMessage(error);

        Swal.close();

        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [currentUser, getTranslatedErrorMessage]
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
        header: "Nombre",
      },
      {
        accessorKey: "capacity",
        header: "Capacidad",
        maxSize: 80,
        cell: (info) => `${info.getValue()} personas`,
      },
      {
        accessorKey: "isActive",
        header: "Activo",
        maxSize: 70,
        cell: (info) => (info.getValue() ? "Sí" : "No"),
      },
      {
        accessorKey: "description",
        header: "Descripción",
        maxSize: 300,
        minSize: 150,
      },
      {
        header: "Acciones",
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
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(room.id);
                    }}>
                    Eliminar
                  </Button>
                </div>
              )}
            </>
          );
        },
      },
    ],
    [handleDeleteClick]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    defaultColumn: {
      maxSize: "none",
      minSize: 50,
      size: "auto",
    },
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // Enable row expansion
    getRowCanExpand: () => true,
  });

  const onGetRoomsSuccess = (response) => {
    if (response.isSuccessful) {
      setRooms(response.items);
    }
  };

  const onGetRoomsError = (error) => {
    if (error?.response?.status !== 404) {
      toast.error("Hubo un error al cargar las habitaciones");
    }
  };

  useEffect(() => {
    setLoading(true);
    getByHotelId(hotelId)
      .then(onGetRoomsSuccess)
      .catch(onGetRoomsError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Habitaciones" />
      <ErrorBoundary>
        <h3>Habitaciones</h3>

        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id ? "Editar habitación" : "Nueva habitación"}
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
                          placeholder="Nombre de la habitación"
                          isRequired={true}
                        />
                      </Col>
                      <Col md="3">
                        <CustomField
                          name="capacity"
                          type="number"
                          className="form-control"
                          placeholder="Capacidad"
                          isRequired={true}
                        />
                      </Col>
                      <Col md="3">
                        <CustomField
                          name="description"
                          type="text"
                          className="form-control"
                          placeholder="Descripción"
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
                              "Actualizar"
                            ) : (
                              "Agregar"
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
            {showForm ? "Cancelar" : "Agregar Habitación"}
          </Button>
        </div>
        <Row>
          <Col md="auto" className="align-content-end">
            <p className="text-dark fw-bold fs-5 mb-0">
              Total de habitaciones: {rooms?.length > 0 ? rooms.length : 0}
            </p>
            <p className="text-dark fw-bold fs-5 mb-0">
              Capacidad total: {roomsTotalCapacity} personas
            </p>
          </Col>
          <Col>
            <div className="mb-3 float-end">
              <Label for="isActiveFilter" className="text-dark">
                Filtrar por Estado
              </Label>
              <Input
                id="isActiveFilter"
                type="select"
                style={{ width: "auto" }}
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value)}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="all">Todos</option>
              </Input>
            </div>
          </Col>
        </Row>

        <div className="table-responsive w-100">
          <table className="table table-bordered table-striped table-hover">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={
                        !loading
                          ? header.column.getToggleSortingHandler()
                          : () => {}
                      }
                      className={classNames(
                        "text-bg-dark text-center align-content-center",
                        {
                          "cursor-pointer": header.column.getCanSort(),
                          "cursor-not-allowed": loading,
                        }
                      )}
                      style={{
                        maxWidth: header.column.columnDef.maxSize || "none",
                        minWidth: header.column.columnDef.minSize || "none",
                        width: header.column.getSize() || "auto",
                      }}>
                      {
                        <div
                          style={{ minWidth: "max-content" }}
                          className="align-items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className="float-end ms-2">
                            {{
                              asc: (
                                <FontAwesomeIcon icon={faArrowUpShortWide} />
                              ),
                              desc: (
                                <FontAwesomeIcon icon={faArrowDownWideShort} />
                              ),
                            }[header.column.getIsSorted()] ||
                              (header.column.getCanSort() && (
                                <FontAwesomeIcon icon={faSort} />
                              ))}
                          </span>
                        </div>
                      }
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    <Spinner size="sm" /> Cargando...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    No hay registros
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() =>
                        table.setExpanded({ [row.id]: !row.getIsExpanded() })
                      }
                      className="cursor-pointer">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          className={classNames(
                            "text-center align-content-center",
                            {
                              "bg-info-subtle": row.getIsExpanded(),
                            }
                          )}
                          style={{
                            maxWidth: cell.column.columnDef.maxSize || "none",
                            minWidth: cell.column.columnDef.minSize || "none",
                            width: cell.column.getSize() || "auto",
                          }}
                          key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {row.getIsExpanded() && (
                      <tr>
                        <td
                          colSpan={row.getVisibleCells().length}
                          className="p-0">
                          <div className="p-2 border border-info-subtle bg-light">
                            <Row>
                              <Col md={6}>
                                <strong>Creado por:</strong>{" "}
                                {row.original.createdBy?.firstName}{" "}
                                {row.original.createdBy?.lastName}
                              </Col>
                              <Col md={6}>
                                <strong>Fecha de creación:</strong>{" "}
                                {dayjs(row.original.dateCreated).format(
                                  "DD/MM/YYYY - h:mm A"
                                )}
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <strong>Modificado por:</strong>{" "}
                                {row.original.modifiedBy?.firstName}{" "}
                                {row.original.modifiedBy?.lastName}
                              </Col>
                              <Col md={6}>
                                <strong>Fecha de modificación:</strong>{" "}
                                {dayjs(row.original.dateModified).format(
                                  "DD/MM/YYYY - h:mm A"
                                )}
                              </Col>
                            </Row>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default RoomsView;

// External Libraries
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  getExpandedRowModel,
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
  InputGroup,
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
} from "services/extraChargeService";
import { useAppContext } from "contexts/GlobalAppContext"; // Assuming you have this context
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import { EXTRA_CHARGE_TYPES } from "./constants";
import { errorCodes } from "constants/errorCodes";

// Validation Schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .required("El nombre es requerido"),
  typeId: Yup.string()
    .required("El tipo es requerido")
    .oneOf(
      EXTRA_CHARGE_TYPES.map((type) => type.value.toString()),
      "Tipo inválido"
    ),
  amount: Yup.number()
    .min(0, "El monto debe ser mayor o igual a 0")
    .required("El monto es requerido"),
});

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

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
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
    let isHiding = false;
    setShowForm((prev) => {
      isHiding = prev;
      return !prev;
    });
    if (isHiding) {
      setInitialValues({ name: "", typeId: "", amount: "" });
    }
  }, []);

  const currentUser = useMemo(() => {
    return {
      id: user.current?.id,
      firstName: user.current?.firstName,
      lastName: user.current?.lastName,
    };
  }, [user]);

  // Format Amounts for Display
  const formatAmount = (amount, typeId) => {
    if (Number(typeId) === 1) return `${(amount * 100).toFixed(2)}%`; // Percentage
    return `$${Number(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; // Daily/General
  };

  const handleSubmit = async (values) => {
    const { id, ...data } = values;
    const amount =
      Number(values.typeId) === 1 ? values.amount / 100 : values.amount;

    const result = await Swal.fire({
      title: `Está seguro de que desea ${
        id ? "actualizar" : "agregar"
      } el cargo adicional?`,
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
        title: "Guardando cargo adicional",
        text: "Por favor espera",
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
          title: "Cargo adicional guardado",
          text: "El cargo adicional se ha guardado correctamente",
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
        title: "Error",
        text: "No se pudo guardar el cargo adicional, intente nuevamente.",
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
          title: "Eliminando el cargo adicional",
          text: "Por favor espera",
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
            title: "Cargo adicional eliminado",
            text: "El cargo adicional se ha eliminado correctamente",
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        let errorMessage = "No se pudo eliminar el cargo, intente nuevamente.";
        if (
          Number(error?.response.data?.code) === errorCodes.HAS_ACTIVE_BOOKINGS
        ) {
          errorMessage =
            "No se puede eliminar el cargo porque tiene reservas activas asociadas.";
        }

        Swal.close();
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [currentUser]
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
        minSize: 200,
      },
      {
        accessorKey: "amount",
        header: "Monto",
        maxSize: 200,
        cell: (info) =>
          formatAmount(info.getValue(), info.row.original.type.id),
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: (info) =>
          EXTRA_CHARGE_TYPES.find(
            (type) => Number(type.value) === Number(info.getValue().id)
          )?.label || "N/A",
      },
      {
        accessorKey: "isActive",
        header: "Activo",
        maxSize: 70,
        cell: (info) => (info.getValue() ? "Sí" : "No"),
      },
      {
        header: "Acciones",
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
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(charge.id);
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

  const onGetExtraChargesSuccess = (response) => {
    if (response.isSuccessful) {
      setExtraCharges(response.items);
    }
  };

  const onGetExtraChargesError = (error) => {
    if (error?.response?.status !== 404) {
      toast.error("Hubo un error al cargar los cargos adicionales");
    }
  };

  useEffect(() => {
    setLoading(true);
    getByHotelId(hotelId)
      .then(onGetExtraChargesSuccess)
      .catch(onGetExtraChargesError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Cargos Adicionales" />
      <ErrorBoundary>
        <h3>Cargos Adicionales</h3>

        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? "Editar cargo adicional"
                  : "Nuevo cargo adicional"}
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
                          placeholder="Nombre del cargo"
                          isRequired={true}
                        />
                      </Col>
                      <Col md="4">
                        <InputGroup>
                          <CustomField
                            name="amount"
                            type="number"
                            className="form-control"
                            placeholder="Monto"
                            isRequired={true}
                          />
                          <CustomField
                            name="typeId"
                            as="select"
                            className="form-select"
                            isRequired={true}>
                            <option value="" disabled>
                              Seleccione el tipo
                            </option>
                            {EXTRA_CHARGE_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
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
            {showForm ? "Cancelar" : "Agregar Cargo Adicional"}
          </Button>
        </div>
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
                          "text-bg-info": header.column.getIsSorted(),
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
                    No hay reservas
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

export default ExtraChargesView;

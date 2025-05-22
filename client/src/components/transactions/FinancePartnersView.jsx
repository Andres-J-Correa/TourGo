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
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { isEqual } from "lodash";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import classNames from "classnames";

// Internal Services/Utilities
import {
  add,
  deleteById,
  getFinancePartnersByHotelId,
  updateById,
} from "services/financePartnerService";
import { useAppContext } from "contexts/GlobalAppContext";

// Components
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .required("El nombre es requerido"),
});

function FinancePartnersView() {
  const { hotelId } = useParams();
  const { user } = useAppContext();
  const [financePartners, setFinancePartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("active");
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
  });

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const filteredData = useMemo(() => {
    switch (isActiveFilter) {
      case "active":
        return financePartners.filter((item) => item.isActive === true);
      case "inactive":
        return financePartners.filter((item) => item.isActive === false);
      default:
        return financePartners;
    }
  }, [financePartners, isActiveFilter]);

  const toggleForm = useCallback(() => {
    let isHiding = false;
    setShowForm((prev) => {
      isHiding = prev;
      return !prev;
    });
    if (isHiding) {
      setInitialValues({ name: "" });
    }
  }, []);

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
      title: `¿Está seguro de que desea ${
        id ? "actualizar" : "agregar"
      } el socio financiero?`,
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
        title: "Guardando socio financiero",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      setIsUploading(true);
      let response;
      if (values.id) {
        response = await updateById(values);
      } else {
        response = await add(values, hotelId);
      }

      Swal.close();

      if (response?.isSuccessful) {
        if (id) {
          setFinancePartners((prev) => {
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
          setFinancePartners((prev) => [
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
          title: "Socio financiero guardado",
          text: "El socio financiero se ha guardado correctamente",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al guardar el socio financiero");
      }
    } catch (error) {
      Swal.close(); // Close loading
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el socio financiero, intente nuevamente.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateClick = (financePartner) => {
    setInitialValues({
      id: financePartner.id,
      name: financePartner.name,
    });
    setShowForm(true);
  };

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "¿Está seguro?",
        text: "¡No podrás revertir esto!",
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
          title: "Eliminando el socio financiero",
          text: "Por favor espera",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id);
        if (response.isSuccessful) {
          setFinancePartners((prev) => {
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
            title: "Socio financiero eliminado",
            text: "El socio financiero se ha eliminado correctamente",
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
          text: "No se pudo eliminar el socio financiero, intente nuevamente.",
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
          const financePartner = info.row.original;
          return (
            <>
              {financePartner.isActive && (
                <div style={{ minWidth: "max-content" }}>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateClick(financePartner);
                    }}>
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(financePartner.id);
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
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // Enable row expansion
    getRowCanExpand: () => true,
  });

  const onGetFinancePartnersSuccess = (response) => {
    if (response.isSuccessful) {
      setFinancePartners(response.items);
    }
  };

  const onGetFinancePartnersError = (error) => {
    if (error?.response?.status !== 404) {
      toast.error("Error al cargar los socios financieros");
    }
  };

  useEffect(() => {
    setLoading(true);
    getFinancePartnersByHotelId(hotelId)
      .then(onGetFinancePartnersSuccess)
      .catch(onGetFinancePartnersError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Socios Financieros" />
      <ErrorBoundary>
        <h3>Socios Financieros</h3>

        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? "Editar socio financiero"
                  : "Nuevo socio financiero"}
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
                          placeholder="Nombre del socio financiero"
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
            {showForm ? "Cancelar" : "Agregar Socio Financiero"}
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
}

export default FinancePartnersView;

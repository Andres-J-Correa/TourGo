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

// Internal Services/Utilities
import {
  add,
  deleteById,
  getTransactionSubcategories,
  updateById,
} from "services/transactionsSubcategoryService";
import { useAppContext } from "contexts/GlobalAppContext";

// Components
import Breadcrumb from "components/commonUI/Breadcrumb";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

// Constants/Static Data
import { transactionCategories } from "components/transactions/constants";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .required("El nombre es requerido"),
  categoryId: Yup.string().required("La categoría es requerida"),
});

function TransactionSubcategoriesView() {
  const { hotelId } = useParams();
  const { user } = useAppContext();
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
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

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
    let isHiding = false;
    setShowForm((prev) => {
      isHiding = prev;
      return !prev;
    });
    if (isHiding) {
      setInitialValues({ name: "", categoryId: "" });
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
      title: `Está seguro de que desea ${
        id ? "actualizar" : "agregar"
      } la subcategoría?`,
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
        title: "Guardando Subcategoría",
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
          title: "Subcategoría guardada",
          text: "La subcategoría se ha guardado correctamente",
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
        title: "Error",
        text: "No se pudo guardar la subcategoría, intente nuevamente.",
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
          title: "Eliminando Subcategoría",
          text: "Por favor espera",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteById(id);
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
            title: "Subcategoría eliminada",
            text: "La subcategoría se ha eliminado correctamente",
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
          text: "No se pudo eliminar la subcategoría, intente nuevamente.",
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
      },
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        accessorKey: "isActive",
        header: "Activo",
        cell: (info) => (info.getValue() ? "Sí" : "No"),
      },
      {
        accessorKey: "categoryId",
        header: "Categoría",
        cell: (info) => {
          const category = transactionCategories.find(
            (cat) => Number(cat.id) === Number(info.getValue())
          );
          return category ? category.name : "N/A";
        },
      },
      {
        accessorKey: "createdBy",
        header: "Creado por",
        cell: (info) => {
          const user = info.getValue();
          if (user) {
            return <span>{`${user.firstName} ${user.lastName}`}</span>;
          }
        },
      },
      {
        accessorKey: "dateCreated",
        header: "Fecha de creación",
        cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY - h:mm a"),
      },
      {
        accessorKey: "modifiedBy",
        header: "Modificado por",
        cell: (info) => {
          const user = info.getValue();
          if (user) {
            return <span>{`${user.firstName} ${user.lastName}`}</span>;
          }
        },
      },
      {
        accessorKey: "dateModified",
        header: "Fecha de modificación",
        cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY - h:mm a"),
      },
      {
        header: "Acciones",
        enableSorting: false,
        cell: (info) => {
          const subcategory = info.row.original;
          return (
            <>
              {subcategory.isActive && (
                <div>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleUpdateClick(subcategory)}>
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    className="btn-sm"
                    onClick={() => handleDeleteClick(subcategory.id)}>
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
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const onGetTransactionSubcategoriesSuccess = (response) => {
    if (response.isSuccessful) {
      setTransactionSubcategories(response.items);
    }
  };

  const onGetTransactionSubcategoriesError = (error) => {
    if (error?.response?.status !== 404) {
      toast.error("Error al cargar las subcategorías de transacciones");
    }
  };

  useEffect(() => {
    setLoading(true);
    getTransactionSubcategories(hotelId)
      .then(onGetTransactionSubcategoriesSuccess)
      .catch(onGetTransactionSubcategoriesError)
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId]);

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active="Subcategoría de Transacciones"
      />
      <ErrorBoundary>
        <LoadingOverlay isVisible={loading} />
        <h3>Subcategoría de Transacciones</h3>

        {showForm && (
          <Card className="border-0 shadow-lg mt-3">
            <CardBody className="p-3">
              <CardTitle tag="h5">
                {initialValues.id
                  ? "Editar Subcategoría"
                  : "Nueva Subcategoría"}
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
                          placeholder="Nombre de la subcategoría"
                          isRequired={true}
                        />
                      </Col>

                      <Col md="4">
                        <CustomField
                          name="categoryId"
                          as="select"
                          className="form-control"
                          placeholder="Categoría"
                          isRequired={true}>
                          <option value="">Seleccionar</option>
                          {transactionCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </CustomField>
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
            {showForm ? "Cancelar" : "Agregar Subcategoría"}
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
        <table className="table table-bordered table-striped table-hover">
          <thead
            className="border"
            style={{
              position: "sticky",
              top: 0,
            }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  return (
                    <th
                      className="text-center align-content-center bg-dark text-white fw-bold"
                      key={header.id}
                      style={{ cursor: isSortable ? "pointer" : "default" }}
                      onClick={
                        isSortable
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span className="float-end">
                        {{
                          asc: <FontAwesomeIcon icon={faArrowUpShortWide} />,
                          desc: <FontAwesomeIcon icon={faArrowDownWideShort} />,
                        }[header.column.getIsSorted()] || (
                          <FontAwesomeIcon icon={faSort} />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className="text-center" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ErrorBoundary>
    </>
  );
}

export default TransactionSubcategoriesView;

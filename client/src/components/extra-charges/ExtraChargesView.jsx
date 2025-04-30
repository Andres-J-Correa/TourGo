import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Row,
  Col,
  Spinner,
  InputGroup,
} from "reactstrap";
import { Formik, Form } from "formik";
import {
  getByHotelId,
  add,
  updateById,
  deleteById,
} from "services/extraChargeService";
import CustomField from "components/commonUI/forms/CustomField";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { toast } from "react-toastify";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { EXTRA_CHARGE_TYPES, addValidationSchema } from "./constants";
import Swal from "sweetalert2";

const ExtraChargesView = () => {
  const [extraCharges, setExtraCharges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    typeId: "",
    amount: "",
  });
  const [chargeIdToDelete, setChargeIdToDelete] = useState(null);

  const { hotelId } = useParams();

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const toggleForm = () => {
    let isHiding = showForm;
    setShowForm((prev) => !prev);
    if (isHiding) {
      setInitialValues({ name: "", typeId: "", amount: "" });
    }
  };

  // Format Amounts
  const formatAmount = (amount, typeId) => {
    if (typeId === 1) return `${amount * 100}%`; // Percentage
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; // Daily/General
  };

  // Form Submission
  const handleSubmit = async (values) => {
    try {
      const amount =
        Number(values.typeId) === 1 ? values.amount / 100 : values.amount;
      setIsUploading(true);

      if (values.id) {
        const res = await updateById({ ...values, amount }, values.id);
        if (res.isSuccessful && res.item > 0) {
          const updatedCharges = extraCharges.map((charge) =>
            charge.id === values.id
              ? { ...charge, ...values, amount, id: res.item }
              : charge
          );
          setExtraCharges(updatedCharges);
          toast.success("Cargo adicional actualizado correctamente");
        }
      } else {
        const res = await add({ ...values, amount }, hotelId);
        if (res.isSuccessful && res.item > 0) {
          const charge = {
            id: res.item,
            ...values,
            amount,
            type: { id: values.typeId },
          };
          setExtraCharges((prev) => [...prev, charge]);
          toast.success("Cargo adicional agregado correctamente");
        }
      }
      setShowForm(false);
    } catch (error) {
      toast.error("Hubo un error al agregar el cargo adicional");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditExtraCharge = async (charge) => {
    const amount =
      Number(charge.type.id) === 1 ? charge.amount * 100 : charge.amount;
    setInitialValues({ ...charge, typeId: charge.type.id, amount });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteExtraCharge = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsUploading(true);
          setChargeIdToDelete(id);
          const res = await deleteById(id);
          if (res.isSuccessful) {
            const newCharges = extraCharges.filter(
              (charge) => charge.id !== id
            );
            setExtraCharges(newCharges);
            toast.success("Cargo adicional eliminado correctamente");
          }
        } catch (error) {
          toast.error("Hubo un error al eliminar el cargo adicional");
        } finally {
          setIsUploading(false);
          setChargeIdToDelete(null);
        }
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    getByHotelId(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setExtraCharges(res.items);
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          toast.error("Hubo un error al cargar los cargos adicionales");
        }
      })
      .finally(() => setIsLoading(false));
  }, [hotelId]);

  return (
    <div className="container mt-4">
      <Breadcrumb breadcrumbs={breadcrumbs} active="Cargos Adicionales" />
      <Row>
        <h1>Cargos Adicionales</h1>
      </Row>

      {/* Add Extra Charge Form */}
      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardBody className="p-3">
            <CardTitle tag="h5">Nuevo Cargo Adicional</CardTitle>
            <Formik
              initialValues={initialValues}
              validationSchema={addValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize>
              <Form>
                <ErrorAlert />
                <Row>
                  <Col md="4">
                    <CustomField
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Nombre del cargo"
                    />
                  </Col>

                  <Col md="4">
                    <InputGroup>
                      <CustomField
                        name="amount"
                        type="number"
                        className="form-control"
                        placeholder="Monto"
                      />
                      <CustomField
                        name="typeId"
                        as="select"
                        className="form-select">
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

                  <Col md="4" className="align-content-center">
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
            </Formik>
          </CardBody>
        </Card>
      )}

      <Row>
        <Col>
          <Button
            onClick={toggleForm}
            disabled={isUploading}
            className={
              showForm
                ? "btn bg-warning text-white my-4"
                : "btn bg-dark text-white my-4"
            }>
            {showForm ? "Esconder Formulario" : "Agregar Cargo Adicional"}
          </Button>
        </Col>
      </Row>

      {/* Extra Charges Cards Display */}
      <LoadingOverlay isVisible={isLoading} message="Cargando" />
      <Row>
        {extraCharges.map((charge) => (
          <Col md="3" key={charge.id} className="mb-4">
            <Card className="h-100 d-flex flex-column">
              <CardBody className="d-flex flex-column">
                <CardTitle tag="h5">{charge.name}</CardTitle>
                <CardText className="flex-grow-1">
                  <strong>Monto:</strong>{" "}
                  {formatAmount(Number(charge.amount), Number(charge.type?.id))}
                  <br />
                  <strong>Tipo:</strong>{" "}
                  {
                    EXTRA_CHARGE_TYPES.find(
                      (type) => Number(type.value) === Number(charge.type?.id)
                    )?.label
                  }
                </CardText>
                <div className="d-flex justify-content-between mt-auto">
                  <Button
                    color="secondary"
                    outline
                    onClick={() => handleEditExtraCharge(charge)}
                    disabled={isUploading}>
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    outline
                    onClick={() => handleDeleteExtraCharge(charge.id)}
                    disabled={isUploading}>
                    {isUploading && chargeIdToDelete === charge.id ? (
                      <Spinner size="sm" color="danger" />
                    ) : (
                      "Eliminar"
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ExtraChargesView;

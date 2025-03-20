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
import { getByHotelId, add } from "services/extraChargeService";
import CustomField from "components/commonUI/forms/CustomField";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { toast } from "react-toastify";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { EXTRA_CHARGE_TYPES, addValidationSchema } from "./constants";

const ExtraChargesView = () => {
  const [extraCharges, setExtraCharges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { hotelId } = useParams();

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const toggleForm = () => setShowForm((prev) => !prev);

  // Format Amounts
  const formatAmount = (amount, typeId) => {
    if (typeId === 1) return `${amount * 100}%`; // Percentage
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; // Daily/General
  };

  // Form Submission
  const handleAddExtraCharge = async (values) => {
    try {
      if (Number(values.typeId) === 1) values.amount = values.amount / 100;
      debugger;
      setIsUploading(true);
      const res = await add(values, hotelId);
      if (res.isSuccessful && res.item > 0) {
        const charge = { id: res.item, ...values, type: { id: values.typeId } };
        setExtraCharges((prev) => [...prev, charge]);
        setShowForm(false);
        toast.success("Cargo adicional agregado correctamente");
      }
    } catch (error) {
      toast.error("Hubo un error al agregar el cargo adicional");
    } finally {
      setIsUploading(false);
    }
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
        if (err.response.status !== 404) {
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
        <Card className="mb-4 border-0 shadow-lg">
          <CardBody className="p-3">
            <CardTitle tag="h5">Nuevo Cargo Adicional</CardTitle>
            <Formik
              initialValues={{ name: "", typeId: "", amount: "" }}
              validationSchema={addValidationSchema}
              onSubmit={handleAddExtraCharge}>
              <Form>
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
                    <ErrorAlert />
                    <div className="text-center">
                      <Button
                        disabled={isUploading}
                        type="submit"
                        className="btn bg-success text-white">
                        {isUploading ? (
                          <Spinner size="sm" color="light" />
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
              showForm ? "btn bg-warning text-white" : "btn bg-dark text-white"
            }>
            {showForm ? "Esconder Formulario" : "Agregar Cargo Adicional"}
          </Button>
        </Col>
      </Row>

      {/* Extra Charges Cards Display */}
      {isLoading ? (
        <SimpleLoader />
      ) : (
        <Row>
          {extraCharges.map((charge) => (
            <Col md="3" key={charge.id} className="mb-4">
              <Card className="h-100 d-flex flex-column">
                <CardBody className="d-flex flex-column">
                  <CardTitle tag="h5">{charge.name}</CardTitle>
                  <CardText className="flex-grow-1">
                    <strong>Monto:</strong>{" "}
                    {formatAmount(
                      Number(charge.amount),
                      Number(charge.type?.id)
                    )}
                    <br />
                    <strong>Tipo:</strong>{" "}
                    {
                      EXTRA_CHARGE_TYPES.find(
                        (type) => Number(type.value) === Number(charge.type?.id)
                      )?.label
                    }
                  </CardText>
                  <div className="d-flex justify-content-between mt-auto">
                    <Button color="primary">Editar</Button>
                    <Button color="danger">Eliminar</Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ExtraChargesView;

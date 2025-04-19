import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  Button,
  Row,
  Col,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBed,
  faFileInvoice,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import { isValidPhoneNumber } from "react-phone-number-input";

import { getByDocumentNumber, add } from "services/customerService";
// import { getRoomBookingsByDateRange } from "services/bookingService";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import DatePickers from "components/commonUI/forms/DatePickers";

const _logger = require("debug")("BookingForm");

const tabs = [
  { id: 0, icon: faUser, name: "Cliente" },
  { id: 1, icon: faBed, name: "Habitación" },
  { id: 2, icon: faFileInvoice, name: "Cobros" },
  { id: 3, icon: faCheckCircle, name: "Confirmación" },
];

const customerSchema = Yup.object().shape({
  documentNumber: Yup.string()
    .min(2, "Documento muy corto")
    .max(100, "Documento muy largo")
    .required("Documento requerido"),
  firstName: Yup.string()
    .min(2, "El nombre debe tener mínimo 2 caracteres.")
    .max(50, "El nombre debe tener máximo 50 caracteres.")
    .required("El nombre es obligatorio."),
  lastName: Yup.string()
    .min(2, "El apellido debe tener mínimo 2 caracteres.")
    .max(50, "El apellido debe tener máximo 50 caracteres.")
    .required("El apellido es obligatorio."),
  email: Yup.string()
    .required("El correo electrónico es obligatorio.")
    .email("Debe ingresar un correo electrónico válido.")
    .max(100, "El correo debe tener máximo 100 caracteres."),
  phone: Yup.string()
    .required("El teléfono es obligatorio.")
    .test(
      "is-valid-phone",
      "Debe ingresar un número de teléfono válido.",
      (value) => isValidPhoneNumber(value)
    ),
});

const BookingForm = () => {
  const { hotelId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rooms, setRooms] = useState([]);
  //   const [roomBookings, setRoomBookings] = useState([]);

  _logger("rooms", rooms);

  const isStepComplete = {
    0: customer?.id > 0,
    1: false,
    2: false,
    3: false,
  };

  const handleDocumentSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await getByDocumentNumber(hotelId, values.documentNumber);
      if (res.item) {
        setCustomer(res.item);
        toast.success("Cliente encontrado");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCreating(true);
        toast.info("Cliente no encontrado, por favor complete los datos");
      } else {
        toast.error("Error al buscar cliente");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerCreate = async (values) => {
    try {
      setLoading(true);
      const payload = { ...values };
      const res = await add(payload, hotelId);
      if (res.item > 0) {
        setCustomer({ ...values, id: res.item });
        setCreating(false);
        toast.success("Cliente creado");
      }
    } catch (err) {
      toast.error("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  const onGetRoomsSuccess = (res) => {
    if (res.isSuccessful) {
      setRooms(res.items);
    } else {
      throw new Error("Error al cargar habitaciones");
    }
  };
  const onGetRoomsError = () => {
    toast.error("Error al cargar habitaciones");
  };

  //   const onGetBookingsSuccess = (res) => {
  //     if (res.isSuccessful) {
  //       setRoomBookings(res.items);
  //     } else {
  //       throw new Error("Error al cargar reservas");
  //     }
  //   };
  //   const onGetBookingsError = () => {
  //     toast.error("Error al cargar reservas");
  //   };

  useEffect(() => {
    if (hotelId) {
      getRoomsByHotelId(hotelId).then(onGetRoomsSuccess).catch(onGetRoomsError);
    }
  }, [hotelId]);

  return (
    <div className="container mt-4">
      {/* Tabs Header */}
      <Nav tabs className="mb-4 justify-content-between">
        {tabs.map((tab, index) => (
          <NavItem key={tab.id}>
            <NavLink
              className={classnames({ active: currentStep === tab.id })}
              onClick={() => isStepComplete[tab.id] && setCurrentStep(tab.id)}
              style={{
                cursor: isStepComplete[tab.id] ? "pointer" : "not-allowed",
              }}>
              <FontAwesomeIcon icon={tab.icon} size="lg" />{" "}
              <span className="d-none d-md-inline ms-2">{tab.name}</span>
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      {/* Step Content */}
      <TabContent activeTab={currentStep}>
        <TabPane tabId={0}>
          <Formik
            initialValues={{
              documentNumber: customer?.documentNumber || "",
              firstName: customer?.firstName || "",
              lastName: customer?.lastName || "",
              phone: customer?.phone || "",
              email: customer?.email || "",
            }}
            validationSchema={creating && customerSchema}
            onSubmit={creating ? handleCustomerCreate : handleDocumentSubmit}
            enableReinitialize>
            {({ values, setFieldValue }) => {
              const handleDocChange = (e) => {
                const docValue = e.target.value;
                setFieldValue("documentNumber", docValue);
                // If there was a customer loaded, and docNumber is changing, reset rest
                if (customer?.id || creating) {
                  setCustomer({
                    documentNumber: docValue,
                    firstName: "",
                    lastName: "",
                    phone: "",
                    email: "",
                  });
                  setCreating(false);
                }
              };

              return (
                <Form>
                  <Row className="mb-3">
                    <Col md="6">
                      <CustomField
                        name="documentNumber"
                        placeholder="Documento de Identidad"
                        className="form-control"
                        onChange={handleDocChange}
                        value={values.documentNumber}
                      />
                    </Col>
                    <Col md="6" className="text-end">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-success">
                        {loading ? (
                          <Spinner size="sm" />
                        ) : creating ? (
                          "Guardar Cliente"
                        ) : (
                          "Buscar Cliente"
                        )}
                      </Button>
                    </Col>
                  </Row>

                  {(creating || customer?.id) && (
                    <>
                      <Row>
                        <Col md="6">
                          <CustomField
                            name="firstName"
                            placeholder="Nombre"
                            className="form-control"
                            disabled={!!customer?.id}
                          />
                        </Col>
                        <Col md="6">
                          <CustomField
                            name="lastName"
                            placeholder="Apellido"
                            className="form-control"
                            disabled={!!customer?.id}
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                          <CustomField
                            name="phone"
                            placeholder="Teléfono"
                            className="form-control"
                            disabled={!!customer?.id}
                          />
                        </Col>
                        <Col md="6">
                          <CustomField
                            name="email"
                            placeholder="Correo Electrónico"
                            className="form-control"
                            disabled={!!customer?.id}
                          />
                        </Col>
                      </Row>
                      <ErrorAlert />
                      <div className="text-end mt-3">
                        {customer?.id && (
                          <Button
                            onClick={() => setCurrentStep(1)}
                            color="secondary"
                            disabled={loading}>
                            Siguiente
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </Form>
              );
            }}
          </Formik>
        </TabPane>

        <TabPane tabId={1}>
          <h5>Habitación (step placeholder)</h5>
          <DatePickers />
        </TabPane>

        <TabPane tabId={2}>
          <h5>Cobros (step placeholder)</h5>
        </TabPane>

        <TabPane tabId={3}>
          <h5>Confirmación (step placeholder)</h5>
        </TabPane>
      </TabContent>
    </div>
  );
};

export default BookingForm;

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import {
  Button,
  Row,
  Col,
  Spinner,
  TabContent,
  TabPane,
  Card,
  CardBody,
  CardTitle,
  CardText,
} from "reactstrap";

import {
  getRoomBookingsByDateRange,
  add as addBooking,
  getById as getBookingById,
  getChargesByBookingId,
} from "services/bookingService";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getByHotelId as getChargesByHotelId } from "services/extraChargeService";

import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import DatePickers from "components/commonUI/forms/DatePickers";
import Breadcrumb from "components/commonUI/Breadcrumb";
import Alert from "components/commonUI/Alert";
import RoomBookingTable from "components/bookings/RoomBookingTable";
import TabNavigation from "components/bookings/TabNavigation";

import {
  formatAmount,
  chargeTypeLabels,
  defaultBooking,
  bookingSchema,
  bookingFormTabs as tabs,
} from "./constants";

import dayjs from "dayjs";
import Swal from "sweetalert2";
import CustomerForm from "components/customers/CustomerForm";
var isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

const BookingForm = () => {
  const { hotelId, bookingId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [dates, setDates] = useState({
    start: null,
    end: null,
  });
  const [isLoadingRoomBookings, setIsLoadingRoomBookings] = useState(false);
  const [charges, setCharges] = useState([]);
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [selectedRoomBookings, setSelectedRoomBookings] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    charges: 0,
    total: 0,
  });
  const [booking, setBooking] = useState({ ...defaultBooking });

  const bookingFormRef = useRef(null);

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
    { label: "Reservas", path: `/hotels/${hotelId}/bookings` },
  ];

  const isStepComplete = {
    0: customer?.id > 0,
    1: Number(booking.id) > 0,
    2: false,
    3: false,
  };

  const toggleCharge = (charge) => {
    setSelectedCharges((prev) => {
      const exists = prev.some((c) => c.extraChargeId === charge.id);
      if (exists) {
        return prev.filter((c) => c.extraChargeId !== charge.id);
      } else {
        return [
          ...prev,
          {
            extraChargeId: charge.id,
            type: charge.type.id,
            amount: charge.amount,
          },
        ];
      }
    });
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

  const onGetBookingsSuccess = (res) => {
    if (res.isSuccessful) {
      setRoomBookings(res.items.map((b) => ({ ...b, roomId: b.room.id })));
    } else {
      throw new Error("Error al cargar reservas");
    }
  };

  const onGetBookingsError = (e) => {
    if (e.response?.status === 404) {
      setRoomBookings([]);
    } else {
      toast.error("Error al cargar reservas");
    }
  };

  const onGetChargesSuccess = (res) => {
    if (res.isSuccessful) {
      setCharges(res.items);
    }
  };

  const onGetChargesError = (e) => {
    if (e.response?.status === 404) {
      setCharges([]);
    } else {
      toast.error("Error al cargar cargos extras");
    }
  };

  const onGetBookingSuccess = (res) => {
    if (res.isSuccessful) {
      setBooking(res.item);
    }
  };

  const onGetBookingError = (e) => {
    if (e.response?.status === 404) {
      setBooking({ ...defaultBooking });
    } else {
      toast.error("Error al cargar reserva");
    }
  };

  const onGetBookingChargesSuccess = (res) => {
    if (res.isSuccessful) {
      setSelectedCharges(res.items.map((c) => ({ ...c, extraChargeId: c.id })));
    }
  };

  const onGetBookingChargesError = (e) => {
    if (e.response?.status === 404) {
      setSelectedCharges([]);
    } else {
      toast.error("Error al cargar cargos extras de la reserva");
    }
  };

  const handleBookingSubmit = async (values) => {
    Swal.fire({
      title: "¿Está seguro de que desea guardar la reserva?",
      text: "Revise los datos antes de continuar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setSubmitting(true);
          const res = await addBooking({ ...values }, hotelId);
          if (res.isSuccessful) {
            bookingFormRef?.current?.setFieldValue("id", res.item.bookingId);
            toast.success("Reserva guardada con éxito");
            setCurrentStep(3);
          } else {
            throw new Error("Error al guardar la reserva");
          }
        } catch (err) {
          toast.error("Error al guardar la reserva");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  useEffect(() => {
    if (hotelId) {
      getRoomsByHotelId(hotelId).then(onGetRoomsSuccess).catch(onGetRoomsError);
      getChargesByHotelId(hotelId)
        .then(onGetChargesSuccess)
        .catch(onGetChargesError);
    }
  }, [hotelId]);

  useEffect(() => {
    const isValidDateRange = dayjs(dates.start).isBefore(dayjs(dates.end));
    if (hotelId && isValidDateRange) {
      setIsLoadingRoomBookings(true);
      getRoomBookingsByDateRange(
        hotelId,
        dayjs(dates.start).format("YYYY-MM-DD"),
        dayjs(dates.end).format("YYYY-MM-DD")
      )
        .then(onGetBookingsSuccess)
        .catch(onGetBookingsError)
        .finally(() => setIsLoadingRoomBookings(false));
    }
  }, [hotelId, dates.start, dates.end]);

  useEffect(() => {
    const subtotal = selectedRoomBookings.reduce((acc, booking) => {
      return acc + (booking?.price || 0);
    }, 0);

    const chargesTotal = selectedCharges.reduce((acc, charge) => {
      if (charge.type === 1) {
        return acc + subtotal * charge.amount;
      }
      if (charge.type === 2) {
        return acc + charge.amount * selectedRoomBookings.length;
      }

      return acc + charge.amount;
    }, 0);

    setTotals({
      subtotal,
      charges: chargesTotal,
      total: subtotal + chargesTotal,
    });
  }, [selectedRoomBookings, selectedCharges]);

  useEffect(() => {
    if (bookingFormRef?.current) {
      bookingFormRef.current.setFieldValue(
        "roomBookings",
        selectedRoomBookings
      );
      bookingFormRef.current.setFieldValue("extraCharges", selectedCharges);
      bookingFormRef.current.setFieldValue("subtotal", totals.subtotal);
      bookingFormRef.current.setFieldValue("charges", totals.charges);
      bookingFormRef.current.setFieldValue("arrivalDate", dates.start);
      bookingFormRef.current.setFieldValue("departureDate", dates.end);
      bookingFormRef.current.setFieldValue("customerId", customer?.id);
    }
  }, [selectedRoomBookings, selectedCharges, totals, dates, customer]);

  useEffect(() => {
    if (booking.id) {
      setDates({
        start: booking.arrivalDate,
        end: booking.departureDate,
      });
      setCustomer(booking.customer);

      if (bookingFormRef?.current) {
        bookingFormRef.current.setFieldValue("id", booking.id);
        bookingFormRef.current.setFieldValue(
          "customerId",
          booking.customer.id || ""
        );
        bookingFormRef.current.setFieldValue(
          "externalId",
          booking.externalId || ""
        );
        bookingFormRef.current.setFieldValue("eta", booking.eta || "");
        bookingFormRef.current.setFieldValue(
          "adultGuests",
          booking.adultGuests || ""
        );
        bookingFormRef.current.setFieldValue(
          "childGuests",
          booking.childGuests || ""
        );
        bookingFormRef.current.setFieldValue("notes", booking.notes || "");
        bookingFormRef.current.setFieldValue(
          "externalCommission",
          booking.externalCommission || ""
        );
        bookingFormRef.current.setFieldValue(
          "bookingProviderId",
          booking.bookingProvider.id || ""
        );
      }
    }
  }, [booking]);

  useEffect(() => {
    if (bookingId) {
      getBookingById(bookingId)
        .then(onGetBookingSuccess)
        .catch(onGetBookingError);

      getChargesByBookingId(bookingId)
        .then(onGetBookingChargesSuccess)
        .catch(onGetBookingChargesError);
    }
  }, [bookingId]);

  return (
    <div className="container mt-4">
      <Breadcrumb breadcrumbs={breadcrumbs} active="Nueva Reserva" />
      <TabNavigation
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        isStepComplete={isStepComplete}
      />
      <TabContent activeTab={currentStep}>
        <h4 className="mb-3">{tabs[currentStep].name} </h4>
        <TabPane tabId={0}>
          <CustomerForm
            customer={customer}
            setCustomer={setCustomer}
            setCurrentStep={setCurrentStep}
            submitting={submitting}
            setCreating={setCreating}
            setSubmitting={setSubmitting}
            hotelId={hotelId}
            creating={creating}
          />
        </TabPane>

        <TabPane tabId={1}>
          <h5 className="mb-3">Seleccione las Fechas de la reserva</h5>
          {dates.start &&
            dayjs(dates.start).isBefore(dayjs().subtract(1, "day")) && (
              <Alert
                type="warning"
                message="Estas seleccionando fechas pasadas, por favor verifica."
              />
            )}
          <DatePickers
            startDate={dates.start}
            endDate={dates.end}
            startDateName="Fecha de llegada"
            endDateName="Fecha de salida"
            handleStartChange={(value) =>
              setDates((prev) => ({ ...prev, start: value }))
            }
            handleEndChange={(value) =>
              setDates((prev) => ({ ...prev, end: value }))
            }
            isDisabled={submitting || isLoadingRoomBookings}
          />

          {dates.start && dates.end && (
            <>
              {isLoadingRoomBookings ? (
                <div className="text-center">
                  <Spinner color="dark" className="mt-3" />
                  <h5 className="text-center">Cargando reservas...</h5>
                </div>
              ) : (
                <RoomBookingTable
                  startDate={dates.start}
                  endDate={dates.end}
                  rooms={rooms}
                  roomBookings={roomBookings}
                  setSelectedRoomBookings={setSelectedRoomBookings}
                  isDisabled={submitting}
                  bookingId={bookingId}
                />
              )}

              <h5 className="mt-4 mb-3">Seleccione los cargos extras</h5>
              {submitting ? (
                <div className="alert alert-warning text-center" role="alert">
                  <strong>Selección de cargos desactivada</strong>
                  <p className="mb-0">
                    No se puede seleccionar cargos en este momento.
                  </p>
                </div>
              ) : (
                <Row>
                  {charges.map((charge) => {
                    const isSelected = selectedCharges.some(
                      (c) => c.extraChargeId === charge.id
                    );

                    return (
                      <Col
                        sm="6"
                        md="4"
                        lg="2"
                        key={charge.id}
                        className="mb-3">
                        <Card
                          onClick={() => toggleCharge(charge)}
                          className={`h-100 cursor-pointer ${
                            isSelected
                              ? "border-success bg-success-subtle shadow-success"
                              : ""
                          }`}
                          type="button">
                          <CardBody>
                            <CardTitle tag="h5" className="mb-2">
                              {charge.name}
                            </CardTitle>
                            <CardText className="mb-1">
                              <strong>Tipo:</strong>{" "}
                              {chargeTypeLabels[charge.type?.id] || "N/A"}
                            </CardText>
                            <CardText>
                              <strong>Monto:</strong>{" "}
                              {formatAmount(charge.amount, charge.type?.id)}
                            </CardText>
                          </CardBody>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}

              <hr />
              <Row className="mb-3">
                <Col md="4">
                  <strong className="fs-5 text">Subtotal:</strong>
                  <span className="float-end">
                    {totals.subtotal.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </span>
                </Col>
                <Col md="4">
                  <strong className="fs-5 text">Cargos:</strong>
                  <span className="float-end">
                    {totals.charges.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </span>
                </Col>
                <Col md="4">
                  <strong className="fs-5 text">Total:</strong>
                  <span className="float-end">
                    {totals.total.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </span>
                </Col>
              </Row>
              <hr />

              <h5 className="mt-4 mb-3">Información adicional</h5>
              <Formik
                initialValues={{
                  bookingProviderId: "1", //TODO add booking selector, currently hardcoded to 1 (Booking.com)
                  adultGuests: "",
                  childGuests: "",
                  eta: "",
                  externalId: "",
                  externalCommission: "",
                  notes: "",
                }}
                onSubmit={handleBookingSubmit}
                innerRef={bookingFormRef}
                validationSchema={bookingSchema}
                enableReinitialize>
                <Form>
                  <Row>
                    <Col md="4">
                      <CustomField
                        name="adultGuests"
                        type="number"
                        placeholder="Número de Personas (5 años o más)"
                        isRequired={true}
                        disabled={submitting}
                      />
                    </Col>
                    <Col md="4">
                      <CustomField
                        name="childGuests"
                        type="number"
                        placeholder="Número de Niños (0-4 años)"
                        disabled={submitting}
                      />
                    </Col>
                    <Col md="4">
                      <CustomField
                        name="eta"
                        type="datetime-local"
                        placeholder="Fecha y Hora estimada de llegada"
                        disabled={submitting}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <CustomField
                        name="externalId"
                        type="text"
                        placeholder="Identificación externa (Booking/Airbnb...)"
                        disabled={submitting}
                      />
                    </Col>
                    <Col md="6">
                      <CustomField
                        name="externalCommission"
                        type="number"
                        placeholder="Comision externa"
                        step="0.01"
                        disabled={submitting}
                      />
                    </Col>
                  </Row>
                  <CustomField
                    as="textarea"
                    name="notes"
                    placeholder="Notas"
                    disabled={submitting}
                  />

                  <ErrorAlert />

                  <div className="text-center my-3">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-success">
                      {submitting ? <Spinner size="sm" /> : "Guardar Reserva"}
                    </Button>
                  </div>
                </Form>
              </Formik>
              <div className="d-flex mt-3">
                <Button
                  onClick={() => setCurrentStep(0)}
                  color="secondary"
                  className="me-auto"
                  disabled={submitting}>
                  Anterior
                </Button>
                {booking?.id && (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    color="secondary"
                    className="ms-auto"
                    disabled={submitting}>
                    Siguiente
                  </Button>
                )}
              </div>
            </>
          )}
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

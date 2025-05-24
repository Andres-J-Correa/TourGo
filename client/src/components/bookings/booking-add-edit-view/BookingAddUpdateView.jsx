import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { TabContent, TabPane, Button } from "reactstrap";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Breadcrumb from "components/commonUI/Breadcrumb";
import TabNavigation from "components/bookings/booking-add-edit-view/TabNavigation";

import { toast } from "react-toastify";
import { getById as getBookingById } from "services/bookingService";
import { useAppContext } from "contexts/GlobalAppContext";

import { BOOKING_STATUS_IDS } from "../constants";

import {
  defaultBooking,
  bookingFormTabs as tabs,
} from "components/bookings/booking-add-edit-view/constants";

import CustomerForm from "components/bookings/booking-add-edit-view/CustomerForm";
import BookingForm from "components/bookings/booking-add-edit-view/BookingForm";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import EntityTransactionsView from "components/transactions/EntityTransactionsView";

const BookingAddUpdateView = () => {
  const { hotelId, bookingId } = useParams();
  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
    { label: "Reservas", path: `/hotels/${hotelId}/bookings` },
    bookingId
      ? { label: "Reserva", path: `/hotels/${hotelId}/bookings/${bookingId}` }
      : undefined,
  ];

  const { user } = useAppContext();

  const modifiedBy = useMemo(
    () => ({
      id: user.current?.id,
      firstName: user.current?.firstName,
      lastName: user.current?.lastName,
    }),
    [user]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [booking, setBooking] = useState({ ...defaultBooking });
  const [isLoading, setIsLoading] = useState(false);

  const isStepComplete = {
    0: customer?.id > 0,
    1: Number(booking.id) > 0,
    2: booking?.transactions?.length > 0,
    3: false,
  };

  const mapBookingData = useCallback((bookingData) => {
    const mappedRoomBookings = bookingData.roomBookings.map((booking) => ({
      ...booking,
      roomId: booking.room.id,
    }));

    const mappedExtraCharges = bookingData.extraCharges.map((charge) => ({
      ...charge,
      extraChargeId: charge.id,
    }));
    setBooking({
      ...bookingData,
      roomBookings: mappedRoomBookings,
      extraCharges: mappedExtraCharges,
    });
    setCustomer(bookingData.customer);
  }, []);

  const onGetBookingSuccess = useCallback(
    (res) => {
      if (res.isSuccessful) {
        mapBookingData(res.item);
      }
    },
    [mapBookingData]
  );

  const onGetBookingError = (e) => {
    if (e.response?.status === 404) {
      setBooking({ ...defaultBooking });
    } else {
      toast.error("Error al cargar reserva");
    }
  };

  useEffect(() => {
    if (bookingId) {
      setIsLoading(true);
      getBookingById(bookingId)
        .then(onGetBookingSuccess)
        .catch(onGetBookingError)
        .finally(() => setIsLoading(false));
    } else {
      setBooking({ ...defaultBooking });
      setCustomer(null);
      setCurrentStep(0);
    }
  }, [bookingId, onGetBookingSuccess, mapBookingData]);

  return (
    <>
      <LoadingOverlay
        isVisible={submitting || isLoading}
        message={isLoading ? "Cargando información" : "procesando..."}
      />

      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={bookingId ? "Editar Reserva" : "Nueva Reserva"}
      />
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
            booking={booking}
          />
        </TabPane>
        <TabPane tabId={1}>
          <BookingForm
            setCurrentStep={setCurrentStep}
            submitting={submitting}
            customer={customer}
            booking={booking}
            setBooking={setBooking}
            setCustomer={setCustomer}
            hotelId={hotelId}
            bookingId={bookingId}
            bookingCharges={booking?.extraCharges}
            bookingRoomBookings={booking?.roomBookings}
            modifiedBy={modifiedBy}
          />
        </TabPane>
        <TabPane tabId={2}>
          <div className="d-flex mb-4">
            <Button
              type="button"
              onClick={() => setCurrentStep(1)}
              color="dark"
              className="me-auto"
              disabled={submitting}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Anterior
            </Button>
            {isStepComplete[2] && !submitting && (
              <Link
                className="ms-auto btn btn-dark"
                to={`/hotels/${hotelId}/bookings/${booking.id}`}>
                Ir a Resumen
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </Link>
            )}
          </div>
          <EntityTransactionsView
            hotelId={hotelId}
            submitting={submitting}
            entity={booking}
            setEntity={setBooking}
            showAddButton={
              booking?.status?.id !== BOOKING_STATUS_IDS.CANCELLED &&
              booking?.status?.id !== BOOKING_STATUS_IDS.NO_SHOW &&
              booking?.status?.id !== BOOKING_STATUS_IDS.COMPLETED
            }
          />
        </TabPane>
        <br />
      </TabContent>
    </>
  );
};

export default BookingAddUpdateView;

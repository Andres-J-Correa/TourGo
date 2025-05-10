import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TabContent, TabPane, Button } from "reactstrap";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Breadcrumb from "components/commonUI/Breadcrumb";
import TabNavigation from "components/bookings/booking-add-edit-view/TabNavigation";

import { toast } from "react-toastify";
import { getById as getBookingById } from "services/bookingService";

import { bookingFormTabs as tabs, defaultBooking } from "../constants";

import CustomerForm from "components/bookings/booking-add-edit-view/CustomerForm";
import BookingForm from "components/bookings/booking-add-edit-view/BookingForm";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import EntityTransactionsView from "components/transactions/EntityTransactionsView";
import BookingSummary from "components/bookings/booking-summary/BookingSummary";

import useBookingData from "./hooks/useBookingData";

const BookingAddUpdateView = () => {
  const { hotelId, bookingId } = useParams();
  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
    { label: "Reservas", path: `/hotels/${hotelId}/bookings` },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [booking, setBooking] = useState({ ...defaultBooking });
  const [isLoading, setIsLoading] = useState(false);

  const { isLoadingBookingData, bookingCharges, bookingRoomBookings } =
    useBookingData(bookingId);

  const isStepComplete = {
    0: customer?.id > 0,
    1: Number(booking.id) > 0,
    2: booking?.transactions?.length > 0,
    3: false,
  };

  const onGetBookingSuccess = (res) => {
    if (res.isSuccessful) {
      setBooking(res.item);
      setCustomer(res.item.customer);
    }
  };

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
    }
  }, [bookingId]);
  return (
    <div className="container my-4">
      <LoadingOverlay
        isVisible={submitting || isLoading || isLoadingBookingData}
        message={
          isLoading || isLoadingBookingData
            ? "Cargando información"
            : "procesando..."
        }
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
            bookingCharges={bookingCharges}
            bookingRoomBookings={bookingRoomBookings}
          />
        </TabPane>
        <TabPane tabId={2}>
          <div className="d-flex mb-4">
            <Button
              type="button"
              onClick={() => setCurrentStep(1)}
              color="secondary"
              className="me-auto"
              disabled={submitting}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Anterior
            </Button>
            {isStepComplete[2] && (
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                color="secondary"
                className="ms-auto"
                disabled={submitting}>
                Siguiente
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </Button>
            )}
          </div>
          <EntityTransactionsView
            hotelId={hotelId}
            submitting={submitting}
            entity={booking}
            setEntity={setBooking}
          />
        </TabPane>
        <TabPane tabId={3}>
          <div className="d-flex mb-4">
            <Button
              type="button"
              onClick={() => setCurrentStep(2)}
              color="secondary"
              className="me-auto"
              disabled={submitting}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Anterior
            </Button>
          </div>
          <BookingSummary
            bookingData={booking}
            roomBookings={booking?.roomBookings ?? bookingRoomBookings}
            extraCharges={booking?.extraCharges ?? bookingCharges}
          />
        </TabPane>
      </TabContent>
    </div>
  );
};

export default BookingAddUpdateView;

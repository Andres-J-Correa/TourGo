import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "reactstrap";
import { toast } from "react-toastify";

import RoomBookingTable from "components/bookings/RoomBookingTable";
import ExtraChargesSelector from "components/bookings/ExtraChargesSelector";
import TotalsDisplay from "components/bookings/TotalsDisplay";
import DateSelector from "components/bookings/DateSelector";
import AdditionalInfoForm from "components/bookings/AdditionalInfoForm";

import {
  getChargesByBookingId,
  add as addBooking,
} from "services/bookingService";
import {
  bookingSchema,
  bookingDefaultInitialValues,
} from "components/bookings/constants";

import Swal from "sweetalert2";

import useBookingFormData from "./hooks/useBookingFormData";
import useBookingTotals from "./hooks/useBookingTotals";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

function BookingForm({
  submitting,
  customer,
  setSubmitting,
  setCurrentStep,
  booking,
  setBooking,
}) {
  const { hotelId, bookingId } = useParams();
  const [dates, setDates] = useState({
    start: null,
    end: null,
  });
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [selectedRoomBookings, setSelectedRoomBookings] = useState([]);

  const {
    rooms,
    charges,
    roomBookings,
    isLoadingBookings,
    isLoadingCharges,
    isLoadingRooms,
  } = useBookingFormData(hotelId, dates);
  const totals = useBookingTotals(selectedRoomBookings, selectedCharges);

  const bookingFormRef = useRef(null);

  const bookingFormInitialValues = useMemo(
    () =>
      booking?.id
        ? {
            ...bookingDefaultInitialValues,
            ...booking,
            bookingProviderId: booking.bookingProvider?.id || "1",
            customerId: booking.customer.id || "",
          }
        : { ...bookingDefaultInitialValues },
    [booking]
  );
  const isLoading = isLoadingBookings || isLoadingCharges || isLoadingRooms;

  const handleDateChange = (field) => (value) => {
    if (field === "start") {
      setDates((prev) => ({ ...prev, start: value }));
    } else if (field === "end") {
      setDates((prev) => ({ ...prev, end: value }));
    }
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
            setBooking((prev) => ({ ...prev, id: res.item.bookingId }));
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

  useEffect(() => {
    if (booking.id) {
      setDates({
        start: booking.arrivalDate,
        end: booking.departureDate,
      });
    }
  }, [booking]);

  useEffect(() => {
    if (bookingId) {
      getChargesByBookingId(bookingId)
        .then(onGetBookingChargesSuccess)
        .catch(onGetBookingChargesError);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingFormRef?.current) {
      bookingFormRef.current.setValues((prev) => ({
        ...prev,
        roomBookings: selectedRoomBookings,
        extraCharges: selectedCharges,
        subtotal: totals.subtotal,
        charges: totals.charges,
        arrivalDate: dates.start,
        departureDate: dates.end,
        customerId: customer?.id,
      }));
    }
  }, [selectedRoomBookings, selectedCharges, totals, dates, customer]);

  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="Cargando información." />
      <DateSelector
        dates={dates}
        onDateChange={handleDateChange}
        isDisabled={submitting || isLoadingBookings}
      />
      {dates.start && dates.end && (
        <>
          <RoomBookingTable
            startDate={dates.start}
            endDate={dates.end}
            rooms={rooms}
            roomBookings={roomBookings}
            setSelectedRoomBookings={setSelectedRoomBookings}
            isDisabled={submitting}
            bookingId={bookingId}
          />

          <h5 className="mt-4 mb-3">Seleccione los cargos extras</h5>
          <ExtraChargesSelector
            charges={charges}
            selectedCharges={selectedCharges}
            toggleCharge={toggleCharge}
            submitting={submitting}
          />

          <TotalsDisplay totals={totals} />

          <AdditionalInfoForm
            initialValues={bookingFormInitialValues}
            onSubmit={handleBookingSubmit}
            innerRef={bookingFormRef}
            validationSchema={bookingSchema}
            submitting={submitting}
          />
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
    </>
  );
}

export default BookingForm;

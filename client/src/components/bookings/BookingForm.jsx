import React, { useState, useEffect, useMemo, useRef } from "react";
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
  LOCAL_STORAGE_FORM_KEYS,
  deepCompareBooking,
  sanitizeBooking,
} from "components/bookings/constants";
import {
  setLocalStorageForm,
  getLocalStorageForm,
} from "utils/localStorageHelper";

import Swal from "sweetalert2";
import dayjs from "dayjs";

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
  setCustomer,
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
            ...sanitizeBooking(booking),
          }
        : { ...bookingDefaultInitialValues },
    [booking]
  );

  const formChanged = () => {
    const currentForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT);
    const previousForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS);
    return !deepCompareBooking(currentForm, previousForm);
  };

  const isLoading = isLoadingBookings || isLoadingCharges || isLoadingRooms;

  const handleDateChange = (field) => (value) => {
    setDates((prev) => {
      const newState = { ...prev };
      if (field === "start" && value && dayjs(value).isAfter(dayjs(prev.end))) {
        const newEndDate = dayjs(value).add(1, "day").toDate();
        newState.end = dayjs(newEndDate).format("YYYY-MM-DD");
      }

      return { ...newState, [field]: value };
    });
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
            ...charge,
            extraChargeId: charge.id,
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
          const payload = {
            ...values,
            roomBookings: [...selectedRoomBookings],
            extraCharges: [...selectedCharges],
            subtotal: totals.subtotal,
            charges: totals.charges,
            arrivalDate: dates.start,
            departureDate: dates.end,
            customerId: customer?.id,
          };
          const res = await addBooking(payload, hotelId);
          if (res.isSuccessful) {
            setBooking((prev) => ({
              ...prev,
              ...values,
              id: res.item.bookingId,
              invoiceId: res.item.invoiceId,
            }));
            toast.success("Reserva guardada con éxito");
            setCurrentStep(2);
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

  const resetFormToPrevious = () => {
    if (bookingFormRef.current) {
      bookingFormRef.current.resetForm(bookingFormInitialValues);
      const previousForm = getLocalStorageForm(
        LOCAL_STORAGE_FORM_KEYS.PREVIOUS
      );
      setSelectedCharges(previousForm.extraCharges || []);
      setSelectedRoomBookings(previousForm.roomBookings || []);
      setDates({
        start: previousForm.arrivalDate,
        end: previousForm.departureDate,
      });
      setCustomer(bookingFormInitialValues.customer);
    }
  };

  const handleNextClick = () => {
    if (formChanged()) {
      Swal.fire({
        title: "¿Está seguro de que desea continuar?",
        text: "Los cambios no guardados se perderán.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, descartar cambios",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "red",
      }).then((result) => {
        if (result.isConfirmed) {
          resetFormToPrevious();
          setCurrentStep(2);
        }
      });
    } else {
      setCurrentStep(2);
    }
  };

  const onGetBookingChargesSuccess = (res) => {
    if (res.isSuccessful) {
      const mappedCharges = res.items.map((c) => ({
        ...c,
        extraChargeId: c.id,
      }));

      setSelectedCharges(mappedCharges);

      const previousForm = getLocalStorageForm(
        LOCAL_STORAGE_FORM_KEYS.PREVIOUS
      );

      setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS, {
        ...previousForm,
        extraCharges: mappedCharges,
      });
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
    if (booking.id > 0) {
      if (!dates.start && !dates.end) {
        setDates({
          start: booking.arrivalDate,
          end: booking.departureDate,
        });
      }

      const isSameDate = (date1, date2) =>
        dayjs(date1).isSame(dayjs(date2), "day");

      const isSameStartDate = isSameDate(dates.start, booking.arrivalDate);
      const isSameEndDate = isSameDate(dates.end, booking.departureDate);
      const isSameDates = isSameStartDate && isSameEndDate;

      if (isSameDates)
        setSelectedRoomBookings(
          roomBookings?.length > 0
            ? roomBookings?.filter(
                (b) => Number(b.bookingId) === Number(booking.id)
              )
            : []
        );
    }
  }, [booking, roomBookings, dates]);

  useEffect(() => {
    if (bookingId) {
      getChargesByBookingId(bookingId)
        .then(onGetBookingChargesSuccess)
        .catch(onGetBookingChargesError);
    }
  }, [bookingId]);

  useEffect(() => {
    const newFormData = {
      roomBookings: [...selectedRoomBookings],
      extraCharges: [...selectedCharges],
      subtotal: totals.subtotal,
      charges: totals.charges,
      arrivalDate: dates.start,
      departureDate: dates.end,
      customerId: customer?.id,
    };
    const currentForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT);
    setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
      ...currentForm,
      ...newFormData,
    });
  }, [selectedRoomBookings, selectedCharges, totals, dates, customer]);

  useEffect(() => {
    if (
      bookingFormInitialValues?.id &&
      roomBookings.length > 0 &&
      roomBookings.some((b) => b.bookingId === bookingFormInitialValues?.id)
    ) {
      const currentRoomBookings = roomBookings.filter(
        (b) => b.bookingId === bookingFormInitialValues?.id
      );
      const previousForm = getLocalStorageForm(
        LOCAL_STORAGE_FORM_KEYS.PREVIOUS
      );
      setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS, {
        ...bookingFormInitialValues,
        ...previousForm,
        roomBookings: currentRoomBookings,
      });
      setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
        ...bookingFormInitialValues,
        roomBookings: currentRoomBookings,
      });
    }
  }, [roomBookings, bookingFormInitialValues]);

  useEffect(() => {
    if (bookingFormRef?.current) {
      bookingFormRef.current.setFieldValue("roomBookings", [
        ...selectedRoomBookings,
      ]);
    }
  }, [selectedRoomBookings]);

  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="Cargando información." />
      <DateSelector
        dates={dates}
        onDateChange={handleDateChange}
        isDisabled={submitting || isLoadingBookings}
        selectedRoomBookings={selectedRoomBookings}
        setSelectedRoomBookings={setSelectedRoomBookings}
      />
      {dates.start && dates.end && (
        <>
          <RoomBookingTable
            startDate={dates.start}
            endDate={dates.end}
            rooms={rooms}
            roomBookings={roomBookings}
            setSelectedRoomBookings={setSelectedRoomBookings}
            selectedRoomBookings={selectedRoomBookings}
            bookingId={booking?.id}
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
            validationSchema={bookingSchema}
            submitting={submitting}
            innerRef={bookingFormRef}
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
                onClick={handleNextClick}
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

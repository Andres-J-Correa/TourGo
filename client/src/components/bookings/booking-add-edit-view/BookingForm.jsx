import React, { useState, useEffect, useCallback } from "react";

import RoomBookingTable from "components/bookings/booking-add-edit-view/room-booking-table/RoomBookingTable";
import ExtraChargesSelector from "components/bookings/booking-add-edit-view/ExtraChargesSelector";
import TotalsDisplay from "components/bookings/booking-add-edit-view/TotalsDisplay";
import DateSelector from "components/bookings/booking-add-edit-view/DateSelector";
import AdditionalInfoForm from "components/bookings/booking-add-edit-view/AdditionalInfoForm";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";

import Swal from "sweetalert2";
import { Form, withFormik } from "formik";
import { Button, Spinner } from "reactstrap";
import dayjs from "dayjs";
import classNames from "classnames";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  add as addBooking,
  update as updateBooking,
} from "services/bookingService";
import {
  setLocalStorageForm,
  removeItemFromLocalStorage,
  getLocalStorageForm,
} from "utils/localStorageHelper";
import {
  sanitizeBooking,
  bookingDefaultInitialValues,
  bookingSchema,
  LOCAL_STORAGE_FORM_KEYS,
  deepCompareBooking,
  bookingKeysToCompare,
  currentFormKeysToCompare,
} from "components/bookings/constants";
import { errorCodes } from "constants/errorCodes";

import useBookingFormData from "./hooks/useBookingFormData";
import useBookingTotals from "./hooks/useBookingTotals";

const emptyFormData = {
  customerId: "",
  arrivalDate: null,
  departureDate: null,
  roomBookings: [],
  extraCharges: [],
  subtotal: 0,
  charges: 0,
};

function BookingForm({
  submitting,
  customer,
  setCurrentStep,
  booking,
  setCustomer,
  hotelId,
  bookingId,
  bookingCharges = [],
  bookingRoomBookings = [],
  //formik props
  values,
  setValues,
  resetForm,
  isSubmitting,
  initialValues,
}) {
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
    bookingProviderOptions,
    isLoadingBookings,
    isLoadingHotelData,
  } = useBookingFormData(hotelId, dates);

  const totals = useBookingTotals(selectedRoomBookings, selectedCharges);

  const isLoading = isLoadingBookings || isLoadingHotelData || isSubmitting;

  const isSameDate = (date1, date2) => {
    const isValidDates = dayjs(date1).isValid() && dayjs(date1).isValid();
    if (isValidDates) {
      return dayjs(date1).isSame(dayjs(date2), "day");
    }
    return false;
  };

  const formChanged = () => {
    const currentForm = { ...values };
    const previousForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS);
    return !deepCompareBooking(currentForm, previousForm, bookingKeysToCompare);
  };

  const isSubmitDisabled =
    submitting || isSubmitting || (Boolean(values?.id) && !formChanged());

  const resetFormToPrevious = () => {
    resetForm();
    const previousForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS);
    setSelectedCharges(previousForm.extraCharges || []);
    setSelectedRoomBookings(previousForm.roomBookings || []);

    const isSameStartDate = isSameDate(dates.start, previousForm.arrivalDate);
    const isSameEndDate = isSameDate(dates.end, previousForm.departureDate);
    const isSameDates = isSameStartDate && isSameEndDate;

    if (!isSameDates) {
      setDates({
        start: previousForm.arrivalDate,
        end: previousForm.departureDate,
      });
    }

    setCustomer(booking.customer);
    removeItemFromLocalStorage(LOCAL_STORAGE_FORM_KEYS.CURRENT);
  };

  const autoCompleteForm = useCallback(
    (formData) => {
      setValues((prev) => ({
        ...prev,
        ...formData,
      }));

      if (formData.extraCharges?.length > 0) {
        setSelectedCharges(formData.extraCharges);
      }

      if (formData.roomBookings?.length > 0) {
        setSelectedRoomBookings(formData.roomBookings);
      }

      const isDateStartValid = dayjs(formData.arrivalDate).isValid();
      const isEndDateValid = dayjs(formData.departureDate).isValid();

      if (isDateStartValid || isEndDateValid) {
        setDates({
          start: isDateStartValid ? formData.arrivalDate : null,
          end: isEndDateValid ? formData.departureDate : null,
        });
      }

      setCustomer(formData.customer);
    },
    [setCustomer, setValues]
  );

  const handleDateChange = (field) => (value) => {
    setDates((prev) => {
      const newState = { ...prev };
      if (field === "start" && value && dayjs(value).isAfter(dayjs(prev.end))) {
        const newEndDate = dayjs(value).add(1, "day").format("YYYY-MM-DD");
        newState.end = newEndDate;
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

  const handleNextClick = () => {
    if (formChanged()) {
      Swal.fire({
        title: "¿Está seguro de que desea continuar?",
        text: "Los cambios no guardados se perderán.",
        icon: "warning",
        showDenyButton: true,
        confirmButtonText: "Sí, descartar cambios",
        denyButtonText: "No, ir a guardar",
        confirmButtonColor: "red",
        reverseButtons: true,
        denyButtonColor: "green",
      }).then((result) => {
        if (result.isConfirmed) {
          resetFormToPrevious();
          setCurrentStep(2);
        } else if (result.isDenied) {
          setTimeout(() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }, 200);
        }
      });
    } else {
      setCurrentStep(2);
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

      const isSameStartDate = isSameDate(dates.start, booking.arrivalDate);
      const isSameEndDate = isSameDate(dates.end, booking.departureDate);
      const isSameDates = isSameStartDate && isSameEndDate;

      const existingRoomBookings = initialValues.roomBookings;

      const currentRoomBookings =
        existingRoomBookings?.length > 0
          ? existingRoomBookings
          : bookingRoomBookings?.length > 0
          ? bookingRoomBookings
          : [];

      if (isSameDates && currentRoomBookings.length > 0) {
        setSelectedRoomBookings([...currentRoomBookings]);
      }

      let currentExtraCharges =
        initialValues.extraCharges?.length > 0
          ? initialValues.extraCharges
          : bookingCharges?.length > 0
          ? bookingCharges
          : [];

      setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS, {
        ...sanitizeBooking(booking),
        extraCharges: currentExtraCharges,
        roomBookings: currentRoomBookings,
      });
    }
  }, [booking, dates, bookingCharges, initialValues, bookingRoomBookings]);

  useEffect(() => {
    const newFormData = {
      customerId: customer?.id,
      arrivalDate: dates.start,
      departureDate: dates.end,
      roomBookings: [...selectedRoomBookings],
      extraCharges: [...selectedCharges],
      subtotal: totals.subtotal,
      charges: totals.charges,
      customer: { ...customer },
      id: values?.id,
    };

    const previousForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS);
    const currentForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT);

    const hasNoId = !values?.id;
    const shouldCompare = values?.id && !currentForm;
    const isDifferentFromPrevious = !deepCompareBooking(
      previousForm,
      newFormData,
      currentFormKeysToCompare
    );
    const isNotEmpty = !deepCompareBooking(
      newFormData,
      emptyFormData,
      currentFormKeysToCompare
    );

    const isDifferentFromCurrentFormik = !deepCompareBooking(
      { ...values },
      newFormData,
      currentFormKeysToCompare
    );

    const shouldUpdateCurrentForm =
      !isLoading &&
      isNotEmpty &&
      isDifferentFromCurrentFormik &&
      (hasNoId || (shouldCompare && isDifferentFromPrevious));

    if (shouldUpdateCurrentForm) {
      setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT, {
        ...currentForm,
        ...newFormData,
      });
    }

    if (isDifferentFromCurrentFormik) {
      setValues((prev) => ({ ...prev, ...newFormData }));
    }
  }, [
    values,
    customer,
    dates,
    selectedCharges,
    selectedRoomBookings,
    totals,
    isLoading,
    setValues,
  ]);

  useEffect(() => {
    if (bookingCharges.length > 0) {
      setSelectedCharges(bookingCharges);
    }
  }, [bookingCharges]);

  useEffect(() => {
    if (!bookingId) {
      setSelectedRoomBookings([]);
      setSelectedCharges([]);
      setDates({
        start: null,
        end: null,
      });

      removeItemFromLocalStorage(LOCAL_STORAGE_FORM_KEYS.PREVIOUS);
      const currentForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.CURRENT);
      const emptyBooking = {
        ...emptyFormData,
        ...bookingDefaultInitialValues,
      };

      const isNotEmptyBooking = !deepCompareBooking(
        emptyBooking,
        currentForm,
        bookingKeysToCompare
      );

      if (currentForm && !currentForm.id && isNotEmptyBooking) {
        Swal.fire({
          title: "¿Recuperar información?",
          text: "Realizaste cambios anteriormente que no se guardaron, ¿deseas recuperarlos?",
          icon: "info",
          showDenyButton: true,
          confirmButtonText: "Sí, recuperar",
          denyButtonText: "No, descartar",
          confirmButtonColor: "green",
          denyButtonColor: "red",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            autoCompleteForm(currentForm);
          } else if (result.isDenied) {
            removeItemFromLocalStorage(LOCAL_STORAGE_FORM_KEYS.CURRENT);
          }
        });
      } else {
        removeItemFromLocalStorage(LOCAL_STORAGE_FORM_KEYS.CURRENT);
      }
    }
  }, [bookingId, autoCompleteForm]);

  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="Cargando información." />
      <div className="d-flex mb-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(0)}
          color="dark"
          className="me-auto"
          disabled={submitting || isSubmitting}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Anterior
        </Button>
        {booking?.id && (
          <Button
            type="button"
            onClick={handleNextClick}
            color="dark"
            className="ms-auto"
            disabled={submitting || isSubmitting}>
            Siguiente
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </Button>
        )}
      </div>
      {customer?.id && (
        <DateSelector
          dates={dates}
          onDateChange={handleDateChange}
          isDisabled={submitting || isLoadingBookings || isSubmitting}
          selectedRoomBookings={selectedRoomBookings}
          setSelectedRoomBookings={setSelectedRoomBookings}
        />
      )}
      <div
        className={classNames({
          "d-none": !dates.start || !dates.end,
        })}>
        <RoomBookingTable
          startDate={dates.start}
          endDate={dates.end}
          rooms={rooms}
          roomBookings={roomBookings}
          setSelectedRoomBookings={setSelectedRoomBookings}
          selectedRoomBookings={selectedRoomBookings}
          bookingId={bookingId}
        />

        <h5 className="mt-4 mb-3">Seleccione los cargos extras</h5>
        <ExtraChargesSelector
          charges={charges}
          selectedCharges={selectedCharges}
          toggleCharge={toggleCharge}
          submitting={submitting || isSubmitting}
        />

        <TotalsDisplay totals={totals} />
        <Form>
          <AdditionalInfoForm
            bookingProviderOptions={bookingProviderOptions}
            submitting={submitting || isSubmitting}
          />
          <ErrorAlert />
          <div className="text-center my-3">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-gradient-success">
              {isSubmitting ? <Spinner size="sm" /> : "Guardar Reserva"}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default withFormik({
  mapPropsToValues: ({ booking }) =>
    booking?.id
      ? { ...sanitizeBooking(booking) }
      : { ...bookingDefaultInitialValues },
  validationSchema: bookingSchema,
  enableReinitialize: true,
  handleSubmit: async (values, { props, setSubmitting }) => {
    const { hotelId, customer, setBooking, setCurrentStep } = props;

    const result = await Swal.fire({
      title: "¿Está seguro de que desea guardar la reserva?",
      text: "Revise los datos antes de continuar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      setSubmitting(false);
      return;
    }

    try {
      Swal.fire({
        title: "Guardando reserva",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let res = null;
      if (values.id) {
        res = await updateBooking(values);
      } else {
        res = await addBooking(values, hotelId);
      }

      Swal.close(); // Close loading

      if (res.isSuccessful) {
        setBooking({
          ...values,
          ...(values.id
            ? {}
            : { id: res.item.bookingId, invoiceId: res.item.invoiceId }),
          total: Number(values.charges) + Number(values.subtotal),
          customer,
          roomBookings: [...values.roomBookings],
          extraCharges: [...values.extraCharges],
          nights: dayjs(values.departureDate).diff(
            dayjs(values.arrivalDate),
            "day"
          ),
          status: {
            id: 1,
          },
          bookingProvider: {
            id: values.bookingProviderId,
            name: values.bookingProviderName,
          },
        });

        setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS, { ...values });
        removeItemFromLocalStorage(LOCAL_STORAGE_FORM_KEYS.CURRENT);

        setTimeout(() => {
          setCurrentStep(2);
        }, 1500);

        await Swal.fire({
          icon: "success",
          title: "Reserva guardada",
          text: "La reserva se guardó correctamente.",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al guardar la reserva");
      }
    } catch (err) {
      let errorMessage =
        "Error al guardar la reserva. Por favor, inténtelo de nuevo. Si el problema persiste, contacte al soporte técnico.";
      if (Number(err?.response?.data?.code) === errorCodes.IS_LOCKED) {
        errorMessage = "No se puede actualizar reservas con estado terminado.";
      }

      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  },
})(BookingForm);

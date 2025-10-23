import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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
  LOCAL_STORAGE_FORM_KEYS,
  deepCompareBooking,
  bookingKeysToCompare,
  currentFormKeysToCompare,
} from "components/bookings/booking-add-edit-view/constants";

import {
  bookingDefaultInitialValues,
  sanitizeBooking,
} from "components/bookings/booking-add-edit-view/constants";

import useBookingFormData from "./hooks/useBookingFormData";
import useBookingTotals from "./hooks/useBookingTotals";
import ChargeTypesExplanationIcon from "components/extra-charges/ChargeTypesExplanationIcon";
import PersonalizedCharges from "./PersonalizedCharges";
import { useLanguage } from "contexts/LanguageContext"; // add import
import { ERROR_CODES } from "constants/errorCodes";
import { BOOKING_STATUS_IDS } from "../constants";

const emptyFormData = {
  customerId: "",
  arrivalDate: null,
  departureDate: null,
  roomBookings: [],
  extraCharges: [],
  personalizedCharges: [],
  subtotal: 0,
  charges: 0,
};

function BookingForm({
  customer,
  setCurrentStep,
  booking,
  setCustomer,
  hotelId,
  bookingId,
  bookingCharges = [],
  bookingRoomBookings = [],
  bookingPersonalizedCharges = [],
  isQuote,
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
  const [personalizedCharges, setPersonalizedCharges] = useState([]);

  const {
    rooms,
    charges,
    roomBookings,
    bookingProviderOptions,
    isLoadingBookings,
    isLoadingHotelData,
    isHotelDataInitialFetch,
    isLoadingRoomAvailability,
    roomAvailability,
  } = useBookingFormData(hotelId, dates);

  const navigate = useNavigate();
  const { t } = useLanguage(); // add hook

  const totals = useBookingTotals(
    values,
    selectedRoomBookings,
    selectedCharges,
    personalizedCharges
  );

  const isLoading =
    isLoadingBookings ||
    isLoadingHotelData ||
    isSubmitting ||
    isLoadingRoomAvailability;

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
    isSubmitting || (Boolean(values?.id) && !formChanged());

  const removeBookedRoomBookings = useCallback(
    (bookingsToCheck) => {
      const roomBookingsSet = new Set();

      const currentRoomBookings = [...bookingsToCheck];

      for (const roomBooking of roomBookings) {
        roomBookingsSet.add(`${roomBooking.roomId}-${roomBooking.date}`);
      }

      for (let i = 0; i < currentRoomBookings.length; ) {
        const roomBooking = currentRoomBookings[i];
        if (
          roomBookingsSet.has(`${roomBooking.roomId}-${roomBooking.date}`) &&
          roomBooking.bookingId !== bookingId
        ) {
          currentRoomBookings.splice(i, 1);
          continue;
        }
        i++;
      }

      return currentRoomBookings;
    },
    [roomBookings, bookingId]
  );

  const resetFormToPrevious = () => {
    resetForm();
    const previousForm = getLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS);
    setSelectedCharges(previousForm.extraCharges || []);
    setSelectedRoomBookings(
      previousForm.roomBookings
        ? removeBookedRoomBookings(previousForm.roomBookings)
        : []
    );
    setPersonalizedCharges(previousForm.personalizedCharges || []);

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
        setSelectedRoomBookings(
          removeBookedRoomBookings(formData.roomBookings)
        );
      }

      if (formData.personalizedCharges?.length > 0) {
        setPersonalizedCharges(formData.personalizedCharges);
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
    [setCustomer, setValues, removeBookedRoomBookings]
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
        title: t("booking.form.nextConfirmTitle"),
        text: t("booking.form.nextConfirmText"),
        icon: "warning",
        showDenyButton: true,
        confirmButtonText: t("booking.form.nextConfirmYes"),
        denyButtonText: t("booking.form.nextConfirmNo"),
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
    if (!!booking.id) {
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
        setSelectedRoomBookings(removeBookedRoomBookings(currentRoomBookings));
      }

      const currentExtraCharges =
        initialValues.extraCharges?.length > 0
          ? initialValues.extraCharges
          : bookingCharges?.length > 0
          ? bookingCharges
          : [];

      const currentPersonalizedCharges =
        initialValues.personalizedCharges?.length > 0
          ? initialValues.personalizedCharges
          : bookingPersonalizedCharges?.length > 0
          ? bookingPersonalizedCharges
          : [];

      setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS, {
        ...sanitizeBooking(booking),
        extraCharges: currentExtraCharges,
        roomBookings: currentRoomBookings,
        personalizedCharges: currentPersonalizedCharges,
        hotelId,
      });
    }
  }, [
    booking,
    dates,
    bookingCharges,
    initialValues,
    bookingRoomBookings,
    bookingPersonalizedCharges,
    hotelId,
    roomBookings,
    removeBookedRoomBookings,
  ]);

  useEffect(() => {
    const newFormData = {
      customerId: customer?.id,
      arrivalDate: dates.start,
      departureDate: dates.end,
      roomBookings: [...selectedRoomBookings],
      extraCharges: [...selectedCharges],
      personalizedCharges: [...personalizedCharges],
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
        hotelId,
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
    personalizedCharges,
    totals,
    isLoading,
    setValues,
    hotelId,
  ]);

  useEffect(() => {
    if (bookingCharges.length > 0) {
      setSelectedCharges(bookingCharges);
    }
  }, [bookingCharges]);

  useEffect(() => {
    if (bookingPersonalizedCharges.length > 0) {
      setPersonalizedCharges(bookingPersonalizedCharges);
    }
  }, [bookingPersonalizedCharges]);

  useEffect(() => {
    if (!bookingId && !isQuote) {
      setSelectedRoomBookings([]);
      setSelectedCharges([]);
      setPersonalizedCharges([]);
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
        // Skip reloading form data if the hotelId does not match to avoid loading irrelevant data.
        if (String(currentForm?.hotelId) !== String(hotelId)) return;

        Swal.fire({
          title: t("booking.form.recoverTitle"),
          text: t("booking.form.recoverText"),
          icon: "info",
          showDenyButton: true,
          confirmButtonText: t("booking.form.recoverYes"),
          denyButtonText: t("booking.form.recoverNo"),
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
  }, [bookingId, autoCompleteForm, hotelId, t, isQuote]);

  useEffect(() => {
    if (rooms.length === 0 && !isHotelDataInitialFetch) {
      Swal.fire({
        title: t("booking.form.noRoomsTitle"),
        text: t("booking.form.noRoomsText"),
        icon: "warning",
        confirmButtonText: t("booking.form.goToRooms"),
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/hotels/${hotelId}/rooms`);
        }
      });
    }
  }, [rooms.length, hotelId, navigate, isHotelDataInitialFetch, t]);

  return (
    <>
      <LoadingOverlay
        isVisible={isLoading}
        message={t("booking.loadingOverlay.loadingInfo")}
      />
      {setCurrentStep && (
        <div className="d-flex mb-4">
          <Button
            type="button"
            onClick={() => setCurrentStep(0)}
            color="dark"
            className="me-auto"
            disabled={isSubmitting}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            {t("booking.navigation.previous")}
          </Button>
          {booking?.id && (
            <Button
              type="button"
              onClick={handleNextClick}
              color="dark"
              className="ms-auto"
              disabled={isSubmitting}>
              {t("booking.navigation.next")}
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Button>
          )}
        </div>
      )}
      {customer?.id && (
        <DateSelector
          dates={dates}
          onDateChange={handleDateChange}
          isDisabled={
            isLoadingBookings || isSubmitting || isLoadingRoomAvailability
          }
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
          roomAvailability={roomAvailability}
        />

        <h5 className="mt-4 mb-3">
          {t("booking.form.selectExtraCharges")}
          <ChargeTypesExplanationIcon />
        </h5>
        <ExtraChargesSelector
          charges={charges}
          selectedCharges={selectedCharges}
          toggleCharge={toggleCharge}
          submitting={isSubmitting}
          hotelId={hotelId}
        />

        <PersonalizedCharges
          personalizedCharges={personalizedCharges}
          setPersonalizedCharges={setPersonalizedCharges}
        />

        <TotalsDisplay totals={totals} />
        <Form>
          <AdditionalInfoForm
            bookingProviderOptions={bookingProviderOptions}
            submitting={isSubmitting}
          />
          <ErrorAlert />
          <div className="text-center my-3">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-gradient-success">
              {isSubmitting ? (
                <Spinner size="sm" />
              ) : (
                t("booking.form.saveBooking")
              )}
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
  validationSchema: (props) => props.bookingSchema,
  enableReinitialize: true,
  handleSubmit: async (values, { props, setSubmitting, setFieldError }) => {
    const {
      booking,
      hotelId,
      customer,
      setBooking,
      modifiedBy,
      getTranslatedErrorMessage,
      t,
      navigate,
      isQuote,
    } = props;

    const result = await Swal.fire({
      title: t("booking.form.saveConfirmTitle"),
      text: t("booking.form.saveConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.form.saveConfirmYes"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) {
      setSubmitting(false);
      return;
    }

    try {
      Swal.fire({
        title: t("booking.form.savingTitle"),
        text: t("booking.form.savingText"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let res = null;

      if (values.id) {
        res = await updateBooking(
          { ...values, statusId: booking.status.id },
          hotelId
        );
      } else {
        const statusId = isQuote
          ? BOOKING_STATUS_IDS.QUOTE
          : BOOKING_STATUS_IDS.ACTIVE;

        res = await addBooking(
          {
            ...values,
            statusId,
          },
          hotelId
        );
      }

      Swal.close(); // Close loading

      if (res.isSuccessful) {
        const newBooking = {
          ...values,
          total: Number(values.charges) + Number(values.subtotal),
          customer,
          roomBookings: [...values.roomBookings],
          extraCharges: [...values.extraCharges],
          nights: dayjs(values.departureDate).diff(
            dayjs(values.arrivalDate),
            "day"
          ),
          bookingProvider: {
            id: values.bookingProviderId,
            name: values.bookingProviderName,
          },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };
        if (!values.id) {
          newBooking.id = res.item.bookingId;
          newBooking.invoiceId = res.item.invoiceId;
          newBooking.createdBy = { ...modifiedBy };
          newBooking.dateCreated = dayjs().format("YYYY-MM-DD HH:mm:ss");
        }

        setBooking(newBooking);

        setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS, {
          ...values,
          hotelId,
        });
        removeItemFromLocalStorage(LOCAL_STORAGE_FORM_KEYS.CURRENT);

        await Swal.fire({
          icon: "success",
          title: t("booking.form.saveSuccessTitle"),
          text: t("booking.form.saveSuccessText"),
          timer: 1500,
          didClose: () => {
            let route = `/hotels/${hotelId}/bookings/${newBooking.id}`;

            if (!isQuote) {
              route += "/edit?step=2";
            }

            navigate(route);
          },
        });
      } else {
        throw new Error(t("booking.errors.saveBooking"));
      }
    } catch (err) {
      if (
        Number(err?.response?.data?.code) ===
        ERROR_CODES.EXTERNAL_BOOKING_ID_CONFLICT
      ) {
        setFieldError(
          "externalId",
          t(`errors.custom.${ERROR_CODES.EXTERNAL_BOOKING_ID_CONFLICT}`)
        );
      }

      const errorMessage = getTranslatedErrorMessage(err);

      Swal.close();

      Swal.fire({
        title: t("common.error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  },
})(BookingForm);

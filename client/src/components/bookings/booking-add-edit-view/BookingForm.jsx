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
  submitting,
  customer,
  setCurrentStep,
  booking,
  setCustomer,
  hotelId,
  bookingId,
  bookingCharges = [],
  bookingRoomBookings = [],
  bookingPersonalizedCharges = [],
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
  } = useBookingFormData(hotelId, dates);

  const navigate = useNavigate();
  const { t } = useLanguage(); // add hook

  const totals = useBookingTotals(
    values,
    selectedRoomBookings,
    selectedCharges,
    personalizedCharges
  );

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
        setSelectedRoomBookings(formData.roomBookings);
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
        setSelectedRoomBookings([...currentRoomBookings]);
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
    if (!bookingId) {
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
  }, [bookingId, autoCompleteForm, hotelId, t]);

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
      <div className="d-flex mb-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(0)}
          color="dark"
          className="me-auto"
          disabled={submitting || isSubmitting}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          {t("booking.navigation.previous")}
        </Button>
        {booking?.id && (
          <Button
            type="button"
            onClick={handleNextClick}
            color="dark"
            className="ms-auto"
            disabled={submitting || isSubmitting}>
            {t("booking.navigation.next")}
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

        <h5 className="mt-4 mb-3">
          {t("booking.form.selectExtraCharges")}
          <ChargeTypesExplanationIcon />
        </h5>
        <ExtraChargesSelector
          charges={charges}
          selectedCharges={selectedCharges}
          toggleCharge={toggleCharge}
          submitting={submitting || isSubmitting}
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
            submitting={submitting || isSubmitting}
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
  handleSubmit: async (values, { props, setSubmitting }) => {
    const {
      hotelId,
      customer,
      setBooking,
      setCurrentStep,
      modifiedBy,
      getTranslatedErrorMessage,
    } = props;

    const { t } = require("contexts/LanguageContext").useLanguage(); // workaround for t in static context

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
        res = await updateBooking(values, hotelId);
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
          bookingProvider: {
            id: values.bookingProviderId,
            name: values.bookingProviderName,
          },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          ...(!values.id
            ? {
                createdBy: { ...modifiedBy },
                dateCreated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              }
            : {}),
        });

        setLocalStorageForm(LOCAL_STORAGE_FORM_KEYS.PREVIOUS, {
          ...values,
          hotelId,
        });
        removeItemFromLocalStorage(LOCAL_STORAGE_FORM_KEYS.CURRENT);

        setTimeout(() => {
          setCurrentStep(2);
        }, 1500);

        await Swal.fire({
          icon: "success",
          title: t("booking.form.saveSuccessTitle"),
          text: t("booking.form.saveSuccessText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error(t("booking.errors.saveBooking"));
      }
    } catch (err) {
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

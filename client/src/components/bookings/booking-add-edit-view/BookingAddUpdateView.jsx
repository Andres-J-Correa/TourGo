import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { TabContent, TabPane, Button } from "reactstrap";
import {
  faArrowRight,
  faArrowLeft,
  faFilePen,
  faMoneyBill1Wave,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Breadcrumb from "components/commonUI/Breadcrumb";
import TabNavigation from "components/bookings/booking-add-edit-view/TabNavigation";

import { toast } from "react-toastify";
import { getBookingById } from "services/bookingService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";

import { LOCKED_BOOKING_STATUSES } from "../constants";

import { defaultBooking } from "components/bookings/booking-add-edit-view/constants";
import useBookingSchemas from "./useBookingSchemas";

import CustomerForm from "components/bookings/booking-add-edit-view/CustomerForm";
import BookingForm from "components/bookings/booking-add-edit-view/BookingForm";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import EntityTransactionsView from "components/transactions/EntityTransactionsView";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

const BookingAddUpdateView = () => {
  const { hotelId, bookingId } = useParams();
  const { t, getTranslatedErrorMessage } = useLanguage(); // add t
  const breadcrumbs = [
    { label: t("booking.breadcrumb.home"), path: "/" },
    { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
    { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
    {
      label: t("booking.breadcrumb.bookings"),
      path: `/hotels/${hotelId}/bookings`,
    },
    bookingId
      ? {
          label: t("booking.breadcrumb.booking"),
          path: `/hotels/${hotelId}/bookings/${bookingId}`,
        }
      : undefined,
  ];

  const tabs = [
    { id: 0, icon: faUser, name: t("booking.form.tabs.customer") },
    { id: 1, icon: faFilePen, name: t("booking.form.tabs.booking") },
    {
      id: 2,
      icon: faMoneyBill1Wave,
      name: t("booking.form.tabs.transactions"),
    },
  ];

  const { user } = useAppContext();
  const { bookingSchema } = useBookingSchemas();

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
    1: !!booking?.id,
    2: booking?.transactions?.length > 0,
    3: false,
  };

  const mapBookingData = useCallback((bookingData) => {
    const mappedRoomBookings =
      bookingData.roomBookings?.map((booking) => ({
        ...booking,
        roomId: booking.room.id,
      })) || [];

    const mappedExtraCharges =
      bookingData.extraCharges?.map((charge) => ({
        ...charge,
        extraChargeId: charge.id,
      })) || [];
    setBooking({
      ...bookingData,
      roomBookings: mappedRoomBookings,
      extraCharges: mappedExtraCharges,
      personalizedCharges: bookingData.personalizedCharges || [],
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

  const onGetBookingError = useCallback(
    (e) => {
      if (e.response?.status === 404) {
        setBooking({ ...defaultBooking });
      } else {
        toast.error(t("booking.errors.loadBooking")); // use translation
      }
    },
    [t]
  );

  useEffect(() => {
    if (bookingId) {
      setIsLoading(true);
      getBookingById(bookingId, hotelId)
        .then(onGetBookingSuccess)
        .catch(onGetBookingError)
        .finally(() => setIsLoading(false));
    } else {
      setBooking({ ...defaultBooking });
      setCustomer(null);
      setCurrentStep(0);
    }
  }, [
    bookingId,
    onGetBookingSuccess,
    mapBookingData,
    hotelId,
    onGetBookingError,
  ]);

  return (
    <>
      <LoadingOverlay
        isVisible={submitting || isLoading}
        message={
          isLoading
            ? t("booking.loadingOverlay.loadingInfo")
            : t("booking.loadingOverlay.processing")
        }
      />

      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={
          bookingId ? t("booking.breadcrumb.edit") : t("booking.breadcrumb.new")
        }
      />
      <ErrorBoundary>
        <TabNavigation
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isStepComplete={isStepComplete}
          tabs={tabs}
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
              bookingPersonalizedCharges={booking?.personalizedCharges}
              modifiedBy={modifiedBy}
              getTranslatedErrorMessage={getTranslatedErrorMessage}
              bookingSchema={bookingSchema}
              t={t}
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
                {t("booking.navigation.previous")}
              </Button>
              {isStepComplete[2] && !submitting && (
                <Link
                  className="ms-auto btn btn-dark"
                  to={`/hotels/${hotelId}/bookings/${booking.id}`}>
                  {t("booking.navigation.goToSummary")}
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
                !LOCKED_BOOKING_STATUSES.includes(booking?.status?.id)
              }
            />
          </TabPane>
          <br />
        </TabContent>
      </ErrorBoundary>
    </>
  );
};

export default BookingAddUpdateView;

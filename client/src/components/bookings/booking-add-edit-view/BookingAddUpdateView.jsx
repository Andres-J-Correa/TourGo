import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { TabContent, TabPane, Button } from "reactstrap";
import {
  faArrowRight,
  faArrowLeft,
  faFilePen,
  faMoneyBill1Wave,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";
import TabNavigation from "components/bookings/booking-add-edit-view/TabNavigation";

import { toast } from "react-toastify";
import { getBookingById } from "services/bookingService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";

import { LOCKED_BOOKING_STATUSES } from "../constants";

import { defaultBooking } from "components/bookings/booking-add-edit-view/constants";
import useBookingSchemas from "./useBookingSchemas";

import CustomerFormV2 from "components/customers/forms/CustomerFormV2";
import BookingForm from "components/bookings/booking-add-edit-view/BookingForm";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import EntityTransactionsView from "components/transactions/EntityTransactionsView";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

const BookingAddUpdateView = () => {
  const [customer, setCustomer] = useState(null);
  const [booking, setBooking] = useState({ ...defaultBooking });
  const [isLoading, setIsLoading] = useState(false);

  const { hotelId, bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { t, getTranslatedErrorMessage } = useLanguage(); // add t
  const { user } = useAppContext();
  const { bookingSchema } = useBookingSchemas();

  const currentStep = useMemo(() => {
    const step = new URLSearchParams(location.search).get("step") || "0";
    return step;
  }, [location.search]);

  const modifiedBy = useMemo(
    () => ({
      id: user.current?.id,
      firstName: user.current?.firstName,
      lastName: user.current?.lastName,
    }),
    [user]
  );

  const breadcrumbs = useMemo(() => {
    if (hotelId) {
      const breadcrumbs = new BreadcrumbBuilder(t);

      if (bookingId) {
        breadcrumbs.addBooking(hotelId, bookingId);
        breadcrumbs.addActive(t("booking.breadcrumb.edit"));
      } else {
        breadcrumbs.addBookings(hotelId);
        breadcrumbs.addActive(t("booking.breadcrumb.new"));
      }

      return breadcrumbs.build();
    }
    return null;
  }, [hotelId, bookingId, t]);

  const tabs = [
    { id: "0", icon: faUser, name: t("booking.form.tabs.customer") },
    { id: "1", icon: faFilePen, name: t("booking.form.tabs.booking") },
    {
      id: "2",
      icon: faMoneyBill1Wave,
      name: t("booking.form.tabs.transactions"),
    },
  ];

  const isStepComplete = {
    0: customer?.id > 0,
    1: !!booking?.id,
    2: true, // transactions step is optional
  };

  const setCurrentStep = useCallback(
    (step) => {
      const newParams = new URLSearchParams(location.search);
      newParams.set("step", step);
      navigate({
        pathname: location.pathname,
        search: newParams.toString(),
      });
    },
    [location, navigate]
  );

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

  const handleCustomerChange = (customer) => {
    setCustomer(customer);
  };

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
        isVisible={isLoading}
        message={
          isLoading
            ? t("booking.loadingOverlay.loadingInfo")
            : t("booking.loadingOverlay.processing")
        }
      />

      {breadcrumbs}
      <ErrorBoundary>
        <TabNavigation
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isStepComplete={isStepComplete}
          tabs={tabs}
        />
        <TabContent activeTab={currentStep}>
          <h4 className="mb-3">{tabs[currentStep].name} </h4>
          <TabPane tabId={"0"}>
            <CustomerFormV2
              hotelId={hotelId}
              customer={customer}
              isUpdate={booking?.id}
              goToNextStep={() => setCurrentStep(1)}
              handleCustomerChange={handleCustomerChange}
            />
          </TabPane>
          <TabPane tabId={"1"}>
            <BookingForm
              setCurrentStep={setCurrentStep}
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
              navigate={navigate}
            />
          </TabPane>
          <TabPane tabId={"2"}>
            <div className="d-flex mb-4">
              <Button
                type="button"
                onClick={() => setCurrentStep(1)}
                color="dark"
                className="me-auto">
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                {t("booking.navigation.previous")}
              </Button>
              {isStepComplete[2] && (
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

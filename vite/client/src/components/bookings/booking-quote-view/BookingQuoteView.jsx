import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";
import BookingForm from "components/bookings/booking-add-edit-view/BookingForm";

import { useLanguage } from "contexts/LanguageContext";
import { useAppContext } from "contexts/GlobalAppContext";

import { getByDocumentNumber, add } from "services/customerService";

import { defaultBooking } from "components/bookings/booking-add-edit-view/constants";
import { quoteCustomerFormValues } from "components/customers/forms/constants";
import useBookingSchemas from "components/bookings/booking-add-edit-view/useBookingSchemas";

function BookingQuoteView() {
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [booking, setBooking] = useState({ ...defaultBooking });

  const { hotelId } = useParams();
  const navigate = useNavigate();

  const { t, getTranslatedErrorMessage } = useLanguage();
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

  const breadcrumbs = useMemo(() => {
    if (hotelId) {
      const breadcrumbs = new BreadcrumbBuilder(t);

      breadcrumbs.addBookings(hotelId);
      breadcrumbs.addActive(t("booking.breadcrumb.quote"));

      return breadcrumbs.build();
    }
    return null;
  }, [hotelId, t]);

  const createQuoteCustomer = useCallback(async () => {
    try {
      const res = await add(quoteCustomerFormValues, hotelId);

      if (res.item > 0) {
        setCustomer({ ...quoteCustomerFormValues, id: res.item });
      }
    } catch (err) {
      toast.error(t("booking.customerForm.createError"));
    }
  }, [hotelId, t]);

  const getQuoteCustomer = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await getByDocumentNumber(
        hotelId,
        quoteCustomerFormValues.documentNumber
      );

      if (res.item) {
        setCustomer(res.item);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        await createQuoteCustomer();
      } else {
        toast.error(t("booking.customerForm.searchError"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [hotelId, t, createQuoteCustomer]);

  useEffect(() => {
    if (hotelId) {
      getQuoteCustomer(quoteCustomerFormValues);
    }
  }, [hotelId, getQuoteCustomer]);

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />

      {breadcrumbs}
      <ErrorBoundary>
        <h4 className="mb-3">{t("booking.quote.title")} </h4>
        <BookingForm
          customer={customer}
          booking={booking}
          setBooking={setBooking}
          setCustomer={setCustomer}
          hotelId={hotelId}
          bookingCharges={booking?.extraCharges}
          bookingRoomBookings={booking?.roomBookings}
          bookingPersonalizedCharges={booking?.personalizedCharges}
          modifiedBy={modifiedBy}
          getTranslatedErrorMessage={getTranslatedErrorMessage}
          bookingSchema={bookingSchema}
          t={t}
          navigate={navigate}
          isQuote={true}
        />
      </ErrorBoundary>
    </>
  );
}

export default BookingQuoteView;

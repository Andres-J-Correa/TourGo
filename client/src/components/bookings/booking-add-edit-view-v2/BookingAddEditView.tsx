//types
import type { JSX } from "react";
import type { Tab } from "./components/tabNavigation.types";
import type { Customer } from "types/customer.types";
import type { Booking } from "types/entities/booking.types";

//libs
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  faUser,
  faFilePen,
  faMoneyBill1Wave,
} from "@fortawesome/free-solid-svg-icons";
import { TabContent, TabPane } from "reactstrap";
import Swal from "sweetalert2";

//components
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import TabNavigation from "./components/TabNavigation";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";
import CustomerFormV2 from "components/customers/forms/CustomerFormV2";

//services & utils
import useHotelDetails from "./hooks/useHotelDetails";
import { useLanguage } from "contexts/LanguageContext";

function BookingAddEditView(): JSX.Element {
  const { hotelId, bookingId } = useParams<{
    hotelId: string;
    bookingId: string;
  }>();

  const location = useLocation();

  const navigate = useNavigate();

  const { t } = useLanguage();

  const { rooms, charges, bookingProviderOptions, isLoadingHotelData } =
    useHotelDetails(hotelId);

  const [customer, setCustomer] = useState<Partial<Customer> | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

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

  const tabs = useMemo(
    (): Tab[] => [
      {
        icon: faUser,
        name: t("booking.form.tabs.customer"),
        isStepComplete: !!customer?.id,
      },
      {
        icon: faFilePen,
        name: t("booking.form.tabs.booking"),
        isStepComplete: false,
      },
      {
        icon: faMoneyBill1Wave,
        name: t("booking.form.tabs.transactions"),
        isStepComplete: false,
      },
    ],
    [t, customer]
  );

  const currentStep = (() => {
    const step = new URLSearchParams(location.search).get("step");
    const canAccessStep: boolean =
      step !== "0" && !!tabs[Number(step) - 1]?.isStepComplete;
    return !!step && canAccessStep ? step : "0";
  })();

  const currentTabName = tabs[Number(currentStep)]?.name || "";

  const setCurrentStep = useCallback(
    (step: string) => {
      const newParams = new URLSearchParams(location.search);
      newParams.set("step", step);
      navigate({
        pathname: location.pathname,
        search: newParams.toString(),
      });
    },
    [location, navigate]
  );

  const handleCustomerChange = useCallback(
    (customer: Partial<Customer> | null): void => {
      setCustomer(customer);
    },
    []
  );

  const handleNoRooms = useCallback((): void => {
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
  }, [hotelId, navigate, t]);

  useEffect(() => {
    if (rooms.length === 0 && !isLoadingHotelData) {
      handleNoRooms();
    }
  }, [rooms.length, isLoadingHotelData, handleNoRooms]);

  useEffect(() => {
    return () => {
      Swal.close();
    };
  });

  return (
    <>
      <LoadingOverlay isVisible={isLoadingHotelData} />
      {breadcrumbs}
      <ErrorBoundary>
        <TabNavigation
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          tabs={tabs}
        />
        <TabContent activeTab={currentStep}>
          <h4 className="mb-3">{currentTabName}</h4>
          <TabPane tabId={"0"}>
            <CustomerFormV2
              hotelId={hotelId}
              customer={customer}
              isUpdate={!!booking?.id}
              onChangeSuccessful={() => setCurrentStep("1")}
              handleCustomerChange={handleCustomerChange}
            />
          </TabPane>
        </TabContent>
      </ErrorBoundary>
    </>
  );
}

export default BookingAddEditView;

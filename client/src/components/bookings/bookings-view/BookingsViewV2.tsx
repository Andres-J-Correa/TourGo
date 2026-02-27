//types
import type { JSX } from "react";
import type { BookingMinimal } from "types/entities/booking.types";
import type { BookingData, PaginationData } from "./BookingsViewV2.types";

//libs
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import classNames from "classnames";

//components
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import BookingCard from "components/bookings/bookings-view/BookingCard";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import BookingFiltersV2 from "./BookingFiltersV2";
import Pagination from "components/commonUI/Pagination";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import { getDateString } from "utils/dateHelper";
import { usePagedMinimalBookings } from "./hooks/usePagedMinimalBookings";
import { useHotelRooms } from "./hooks/useHotelRooms";
import { BOOKING_STATUS_BY_ID } from "components/bookings/constants";
import { Button, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import Alert from "components/commonUI/Alert";

const defaultPaginationData: PaginationData = {
  pageIndex: 0,
  pageSize: 10,
  sortColumn: undefined,
  sortDirection: "ASC",
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(1, "week").format("YYYY-MM-DD"),
  isArrivalDate: true,
  firstName: "",
  lastName: "",
  externalBookingId: "",
  statusIds: [],
  bookingId: "",
};

function BookingsViewV2(): JSX.Element {
  const { hotelId } = useParams<{ hotelId?: string }>();
  const [paginationData, setPaginationData] = useState<PaginationData>(
    defaultPaginationData,
  );
  const [appliedPaginationData, setAppliedPaginationData] =
    useState<PaginationData>(defaultPaginationData);
  const { data, loading } = usePagedMinimalBookings(
    hotelId,
    appliedPaginationData,
  );

  const handleSearch = () => {
    setAppliedPaginationData(paginationData);
  };
  const { rooms, loadingRooms } = useHotelRooms(hotelId);

  const { t } = useLanguage();

  const breadcrumbs = useMemo(() => {
    return hotelId
      ? new BreadcrumbBuilder(t)
          .addHotel(hotelId)
          .addActive(t("booking.breadcrumb.bookings"))
          .build()
      : null;
  }, [hotelId, t]);

  const columnOrderTranslated: { id: string; label: string }[] = [
    { id: "id", label: t("booking.minimalCard.reservationNumber") },
    { id: "externalBookingId", label: t("booking.minimalCard.externalId") },
    { id: "arrivalDate", label: t("booking.minimalCard.arrival") },
    { id: "departureDate", label: t("booking.minimalCard.departure") },
    { id: "total", label: t("booking.minimalCard.total") },
    { id: "balanceDue", label: t("booking.minimalCard.balanceDue") },
    { id: "name", label: t("booking.minimalCard.name") },
    { id: "status", label: t("booking.minimalCard.status") },
  ];

  const exportExcel = async () => {
    if (!hotelId || data.items.length === 0) return;

    const { utils, writeFile } = await import("xlsx");

    const copyOfItems = data.items.map(
      (
        item,
      ): Pick<
        BookingMinimal,
        "id" | "externalBookingId" | "total" | "balanceDue"
      > & {
        status: string;
        name: string;
        arrivalDate: string;
        departureDate: string;
      } => ({
        id: item.id,
        externalBookingId: item.externalBookingId,
        arrivalDate: dayjs(item.arrivalDate).format("YYYY-MM-DD"),
        departureDate: dayjs(item.departureDate).format("YYYY-MM-DD"),
        total: item.total,
        balanceDue: item.balanceDue,
        status: t(
          BOOKING_STATUS_BY_ID[
            item.statusId as keyof typeof BOOKING_STATUS_BY_ID
          ],
        ),
        name: `${item.firstName} ${item.lastName}`,
      }),
    );

    const dataToExport = copyOfItems.map((row) =>
      columnOrderTranslated.reduce(
        (acc, obj) => {
          acc[obj.label as keyof typeof acc] =
            row[obj.id as keyof typeof row] ?? "";
          return acc;
        },
        {} as Record<string, string | number>,
      ),
    );
    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(
      workbook,
      worksheet,
      t("booking.bookingsView.title"),
    );
    writeFile(workbook, `${t("booking.bookingsView.title")}.xlsx`, {
      compression: true,
    });
  };

  const handleFilterByBookingId = (value: string): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      bookingId: value,
    }));
  };

  const handleClearBookingIdFilter = (): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      bookingId: "",
    }));
  };

  const handleFilterByCustomerName = (values: {
    firstName: string;
    lastName: string;
  }): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    }));
  };

  const handleClearCustomerNameFilter = (): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      firstName: "",
      lastName: "",
    }));
  };

  const handleDateChange =
    (field: "startDate" | "endDate") =>
    (date: Date | null): void => {
      setPaginationData((prev) => ({
        ...prev,
        pageIndex: 0,
        [field]: getDateString(date),
      }));
    };

  const handleFilterByExternalBookingId = (value: string): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      externalBookingId: value,
    }));
  };

  const handleClearExternalBookingIdFilter = (): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      externalBookingId: "",
    }));
  };

  const handleFilterByStatusIds = (values: number[]): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      statusIds: [...values],
    }));
  };

  const handleFilterByRoomIds = (values: number[]): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      roomIds: [...values],
    }));
  };

  const toggleDateType = (isArrivalDate: boolean) =>
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      isArrivalDate,
    }));

  const toggleSortDirection = () => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      sortDirection: prev.sortDirection === "ASC" ? "DESC" : "ASC",
    }));
    setAppliedPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      sortDirection: prev.sortDirection === "ASC" ? "DESC" : "ASC",
    }));
  };

  const onSortColumnChange = (column: PaginationData["sortColumn"]) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      sortColumn: column,
    }));
    setAppliedPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      sortColumn: column,
    }));
  };

  const onPageSizeChange = (page: number) => {
    setPaginationData((prev) => ({
      ...prev,
      pageSize: page,
      pageIndex: 0,
    }));
    setAppliedPaginationData((prev) => ({
      ...prev,
      pageSize: page,
      pageIndex: 0,
    }));
  };

  const gotoPage = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= data.totalPages) return;
    setPaginationData((prev) => ({ ...prev, pageIndex }));
    setAppliedPaginationData((prev) => ({ ...prev, pageIndex }));
  };

  return (
    <>
      {breadcrumbs}
      <LoadingOverlay isVisible={loading} />
      <h3>{t("booking.bookingsView.title")}</h3>
      <ErrorBoundary>
        <BookingFiltersV2
          paginationData={paginationData}
          loading={loading}
          rooms={rooms}
          loadingRooms={loadingRooms}
          handleDateChange={handleDateChange}
          handleFilterByCustomerName={handleFilterByCustomerName}
          handleClearCustomerNameFilter={handleClearCustomerNameFilter}
          handleFilterByExternalBookingId={handleFilterByExternalBookingId}
          handleClearExternalBookingIdFilter={
            handleClearExternalBookingIdFilter
          }
          handleFilterByStatusIds={handleFilterByStatusIds}
          toggleDateType={toggleDateType}
          onPageSizeChange={onPageSizeChange}
          handleFilterByBookingId={handleFilterByBookingId}
          handleClearBookingIdFilter={handleClearBookingIdFilter}
          toggleSortDirection={toggleSortDirection}
          onSortColumnChange={onSortColumnChange}
          handleFilterByRoomIds={handleFilterByRoomIds}
        />
        <div className="w-100 mb-3 d-flex justify-content-between">
          <Button color="dark" onClick={handleSearch} disabled={loading}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
            {t("booking.filters.filter")}
          </Button>
          <Button
            color="success"
            onClick={() => exportExcel()}
            disabled={loading || data.items.length === 0}>
            <FontAwesomeIcon icon={faFileExcel} className="me-2" />
            {t("transactions.view.exportExcel")}
          </Button>
        </div>
        <div className="w-100 d-flex align-items-center">
          <span
            className={classNames("ms-auto", {
              invisible: data.items.length === 0 || loading,
            })}>
            {t("booking.bookingsView.showing")}{" "}
            {paginationData.pageSize * paginationData.pageIndex + 1}{" "}
            {t("booking.bookingsView.to")}{" "}
            {!data.hasNextPage
              ? data.totalCount
              : paginationData.pageSize * (paginationData.pageIndex + 1)}{" "}
            {t("booking.bookingsView.of")} {data.totalCount}{" "}
            {t("booking.bookingsView.title").toLowerCase()}
          </span>
        </div>

        <div>
          {hotelId && data.items.length > 0 ? (
            <>
              <Row>
                <Col>
                  <Pagination
                    pageIndex={paginationData.pageIndex}
                    totalPages={data.totalPages}
                    onPageChange={gotoPage}
                  />
                </Col>
              </Row>

              <Row>
                {data.items.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    hotelId={hotelId}
                  />
                ))}
              </Row>
              <Row>
                <Col>
                  <Pagination
                    pageIndex={paginationData.pageIndex}
                    totalPages={data.totalPages}
                    onPageChange={gotoPage}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <Alert
              type="warning"
              className="text-center"
              message={t("booking.bookingsView.noBookings")}
            />
          )}
        </div>
      </ErrorBoundary>
    </>
  );
}

export default BookingsViewV2;

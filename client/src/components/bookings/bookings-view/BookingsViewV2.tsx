//types
import type { JSX } from "react";
import type { BookingMinimal } from "types/entities/booking.types";
import type { ErrorResponse, PagedResponse } from "types/apiResponse.types";
import type { BookingData, PaginationData } from "./BookingsViewV2.types";

//libs
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import classNames from "classnames";
import { utils, writeFile } from "xlsx";

//components
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import BookingCard from "components/bookings/bookings-view/BookingCard";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import BookingFiltersV2 from "./BookingFiltersV2";
import Pagination from "components/commonUI/Pagination";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import { getPagedMinimalBookingsByDateRange } from "services/bookingServiceV2";
import { getDateString } from "utils/dateHelper";
import { BOOKING_STATUS_BY_ID } from "components/bookings/constants";
import { Button, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";

const defaultData: BookingData = {
  items: [],
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

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
  statusId: "",
  bookingId: "",
};

function BookingsViewV2(): JSX.Element {
  const { hotelId } = useParams<{ hotelId?: string }>();
  const [data, setData] = useState<BookingData>(defaultData);
  const [paginationData, setPaginationData] = useState<PaginationData>(
    defaultPaginationData
  );
  const [loading, setLoading] = useState<boolean>(false);

  const { t } = useLanguage();

  const breadcrumbs = [
    { label: t("booking.breadcrumb.home"), path: "/" },
    { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
    { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
  ];

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

  const exportExcel = () => {
    if (!hotelId || data.items.length === 0) return;
    const copyOfItems = data.items.map(
      (
        item
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
          ]
        ),
        name: `${item.firstName} ${item.lastName}`,
      })
    );

    const dataToExport = copyOfItems.map((row) =>
      columnOrderTranslated.reduce((acc, obj) => {
        acc[obj.label as keyof typeof acc] =
          row[obj.id as keyof typeof row] ?? "";
        return acc;
      }, {} as Record<string, string | number>)
    );
    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(
      workbook,
      worksheet,
      t("booking.bookingsView.title")
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

  const handleFilterByStatusId = (value: string): void => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      statusId: value,
    }));
  };

  const toggleDateType = () =>
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      isArrivalDate: !prev.isArrivalDate,
    }));

  const toggleSortDirection = () =>
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      sortDirection: prev.sortDirection === "ASC" ? "DESC" : "ASC",
    }));

  const onSortColumnChange = (column: PaginationData["sortColumn"]) =>
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      sortColumn: column,
    }));

  const onPageSizeChange = (page: number) =>
    setPaginationData((prev) => ({
      ...prev,
      pageSize: page,
      pageIndex: 0,
    }));

  const gotoPage = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= data.totalPages) return;
    setPaginationData((prev) => ({ ...prev, pageIndex }));
  };

  useEffect(() => {
    if (!hotelId) return;

    const fetchData = async () => {
      setLoading(true);
      const startDate = paginationData.startDate
        ? dayjs(paginationData.startDate).format("YYYY-MM-DD")
        : undefined;
      const endDate = paginationData.endDate
        ? dayjs(paginationData.endDate).format("YYYY-MM-DD")
        : undefined;

      const res: PagedResponse<BookingMinimal> | ErrorResponse =
        await getPagedMinimalBookingsByDateRange({
          ...paginationData,
          hotelId,
          startDate,
          endDate,
        });

      if (res.isSuccessful) {
        setData({
          items: res.item.pagedItems,
          totalCount: res.item.totalCount,
          totalPages: res.item.totalPages,
          hasPreviousPage: res.item.hasPreviousPage,
          hasNextPage: res.item.hasNextPage,
        });
      } else {
        setData({ ...defaultData });
      }
      setLoading(false);
    };

    fetchData();
  }, [hotelId, paginationData]);

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("booking.breadcrumb.bookings")}
      />
      <LoadingOverlay isVisible={loading} />
      <h3>{t("booking.bookingsView.title")}</h3>
      <ErrorBoundary>
        <BookingFiltersV2
          paginationData={paginationData}
          loading={loading}
          handleDateChange={handleDateChange}
          handleFilterByCustomerName={handleFilterByCustomerName}
          handleClearCustomerNameFilter={handleClearCustomerNameFilter}
          handleFilterByExternalBookingId={handleFilterByExternalBookingId}
          handleClearExternalBookingIdFilter={
            handleClearExternalBookingIdFilter
          }
          handleFilterByStatusId={handleFilterByStatusId}
          toggleDateType={toggleDateType}
          onPageSizeChange={onPageSizeChange}
          handleFilterByBookingId={handleFilterByBookingId}
          handleClearBookingIdFilter={handleClearBookingIdFilter}
          toggleSortDirection={toggleSortDirection}
          onSortColumnChange={onSortColumnChange}
        />
        <div className="w-100 mb-3 d-flex justify-content-end">
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

        <Row>
          <Col>
            <Pagination
              pageIndex={paginationData.pageIndex}
              totalPages={data.totalPages}
              hasPreviousPage={data.hasPreviousPage}
              hasNextPage={data.hasNextPage}
              onPageChange={gotoPage}
            />
          </Col>
        </Row>

        <div className="w-100">
          {hotelId && data.items.length > 0 ? (
            data.items.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                hotelId={hotelId}
              />
            ))
          ) : (
            <p className="fw-bold text-center">
              {t("booking.bookingsView.noBookings")}
            </p>
          )}
        </div>
        <Row>
          <Col>
            <Pagination
              pageIndex={paginationData.pageIndex}
              totalPages={data.totalPages}
              hasPreviousPage={data.hasPreviousPage}
              hasNextPage={data.hasNextPage}
              onPageChange={gotoPage}
            />
          </Col>
        </Row>
      </ErrorBoundary>
    </>
  );
}

export default BookingsViewV2;

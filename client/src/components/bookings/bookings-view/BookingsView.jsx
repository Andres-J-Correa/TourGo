import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { getPagedMinimalBookingsByDateRange } from "services/bookingService";
import Breadcrumb from "components/commonUI/Breadcrumb";
import Pagination from "components/commonUI/Pagination";

import {
  faArrowUpShortWide,
  faArrowDownWideShort,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import classNames from "classnames";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import { bookingsTableColumns } from "components/bookings/constants";
import BookingFilters from "components/bookings/bookings-view/BookingFilters";

const defaultData = {
  items: [],
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

const BookingsView = () => {
  const { hotelId } = useParams();
  const [data, setData] = useState({ ...defaultData });
  const [loading, setLoading] = useState(false);

  const [paginationData, setPaginationData] = useState({
    pageIndex: 0,
    pageSize: 5,
    sortBy: [
      {
        id: "ArrivalDate",
        desc: false,
      },
    ],
    dates: {
      start: "",
      end: "",
    },
    isArrivalDate: true,
    customerNameFilters: {
      firstName: "",
      lastName: "",
    },
    externalBookingId: "",
  });

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const columns = useMemo(() => bookingsTableColumns, []);

  const table = useReactTable({
    data: data.items,
    columns,
    manualPagination: true,
    manualSorting: true,
    pageCount: data.totalPages,
    defaultColumn: {
      width: "auto",
    },
    state: {
      pagination: {
        pageIndex: paginationData.pageIndex,
        pageSize: paginationData.pageSize,
      },
      sorting: paginationData.sortBy.map((s) => ({
        id: s.id,
        desc: s.desc,
      })),
    },
    onSortingChange: (updater) => {
      const sortArray =
        typeof updater === "function"
          ? updater(paginationData.sortBy)
          : updater;
      setPaginationData((prev) => ({
        ...prev,
        sortBy: sortArray,
        pageIndex: 0,
      }));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDateChange = (field) => (date) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      dates: { ...prev.dates, [field]: date },
    }));
  };

  const toggleDateType = () =>
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      isArrivalDate: !prev.isArrivalDate,
    }));

  const handleFilterByCustomerName = (values) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      customerNameFilters: {
        firstName: values.firstName,
        lastName: values.lastName,
      },
    }));
  };

  const handleFilterByExternalBookingId = (value) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      externalBookingId: value,
    }));
  };

  const handleClearCustomerNameFilter = () => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      customerNameFilters: {
        firstName: "",
        lastName: "",
      },
    }));
  };
  const handleClearExternalBookingIdFilter = () => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      externalBookingId: "",
    }));
  };

  const handleClearDateFilters = () => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      dates: {
        start: "",
        end: "",
      },
    }));
  };

  const onPageSizeChange = (e) =>
    setPaginationData((prev) => ({
      ...prev,
      pageSize: Number(e.target.value),
      pageIndex: 0,
    }));

  const gotoPage = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= data.totalPages) return;
    setPaginationData((prev) => ({ ...prev, pageIndex }));
  };

  const fetchData = useCallback(async (hotelId, values) => {
    setLoading(true);
    const sortColumn = values.sortBy[0]?.id || "ArrivalDate";
    const sortDirection = values.sortBy[0]?.desc ? "DESC" : "ASC";
    const startDate = values.dates.start
      ? dayjs(values.dates.start).format("YYYY-MM-DD")
      : null;
    const endDate = values.dates.end
      ? dayjs(values.dates.end).format("YYYY-MM-DD")
      : null;

    try {
      const res = await getPagedMinimalBookingsByDateRange(
        hotelId,
        startDate,
        endDate,
        values.pageIndex,
        values.pageSize,
        values.isArrivalDate,
        sortColumn,
        sortDirection,
        values.customerNameFilters.firstName,
        values.customerNameFilters.lastName,
        values.externalBookingId
      );

      if (res.isSuccessful) {
        setData({
          items: res.item.pagedItems,
          totalCount: res.item.totalCount,
          totalPages: res.item.totalPages,
          hasPreviousPage: res.item.hasPreviousPage,
          hasNextPage: res.item.hasNextPage,
        });
      }
    } catch (err) {
      setData({ ...defaultData });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasDates =
      Boolean(paginationData.dates.start) || Boolean(paginationData.dates.end);
    const isValidDateRange =
      !hasDates ||
      (dayjs(paginationData.dates.start).isValid() &&
        dayjs(paginationData.dates.end).isValid());

    if (hotelId && isValidDateRange) {
      fetchData(hotelId, paginationData);
    }
  }, [hotelId, paginationData, fetchData]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active={"Reservas"} />
      <h3>Reservas</h3>
      <ErrorBoundary>
        <BookingFilters
          paginationData={paginationData}
          loading={loading}
          handleDateChange={handleDateChange}
          toggleDateType={toggleDateType}
          handleFilterByCustomerName={handleFilterByCustomerName}
          handleFilterByExternalBookingId={handleFilterByExternalBookingId}
          handleClearCustomerNameFilter={handleClearCustomerNameFilter}
          handleClearExternalBookingIdFilter={
            handleClearExternalBookingIdFilter
          }
          handleClearDateFilters={handleClearDateFilters}
          onPageSizeChange={onPageSizeChange}
        />

        <div className="table-responsive">
          <span
            className={classNames("float-end", {
              invisible: data.items.length === 0 || loading,
            })}>
            Mostrando {paginationData.pageSize * paginationData.pageIndex + 1} a{" "}
            {!data.hasNextPage
              ? data.totalCount
              : paginationData.pageSize * (paginationData.pageIndex + 1)}{" "}
            de {data.totalCount} reservas
          </span>

          <table className="table table-bordered table-hover table-striped mb-1">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-bg-dark text-center"
                      style={{
                        cursor: header.column.getCanSort()
                          ? "pointer"
                          : "default",
                      }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span className="float-end">
                        {{
                          asc: <FontAwesomeIcon icon={faArrowUpShortWide} />,
                          desc: <FontAwesomeIcon icon={faArrowDownWideShort} />,
                        }[header.column.getIsSorted()] || (
                          <FontAwesomeIcon icon={faSort} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    <Spinner size="sm" /> Cargando...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    No hay reservas
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="text-center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <p
            className={classNames("mb-0 text-center text-dark", {
              invisible: data.items.length === 0 || loading,
            })}>
            Página {paginationData.pageIndex + 1} de {data.totalPages}
          </p>
        </div>

        <Pagination
          pageIndex={paginationData.pageIndex}
          totalPages={data.totalPages}
          hasPreviousPage={data.hasPreviousPage}
          hasNextPage={data.hasNextPage}
          onPageChange={gotoPage}
        />
      </ErrorBoundary>
    </>
  );
};

export default BookingsView;

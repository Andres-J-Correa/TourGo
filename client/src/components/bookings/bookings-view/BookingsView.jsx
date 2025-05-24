import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner, Row, Col } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  getExpandedRowModel,
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
import {
  bookingsTableColumns,
  LOCKED_BOOKING_STATUSES,
} from "components/bookings/constants";
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
    sortBy: [],
    dates: {
      start: dayjs().format("YYYY-MM-DD"),
      end: dayjs().format("YYYY-MM-DD"),
    },
    isArrivalDate: true,
    customerNameFilters: {
      firstName: "",
      lastName: "",
    },
    externalBookingId: "",
    statusId: "",
  });

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const actionsColumn = useMemo(
    () => ({
      header: "Acciones",
      enableSorting: false,
      maxSize: 140,
      minSize: 140,
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div style={{ minWidth: "max-content" }}>
            <Link
              className="btn btn-dark btn-sm"
              target="_blank"
              to={`/hotels/${hotelId}/bookings/${booking.id}`}
              onClick={(e) => e.stopPropagation()}>
              Ver
            </Link>
            {!LOCKED_BOOKING_STATUSES.includes(info.row.original.statusId) && (
              <Link
                className="btn btn-info btn-sm ms-1"
                target="_blank"
                to={`/hotels/${hotelId}/bookings/${booking.id}/edit`}
                onClick={(e) => e.stopPropagation()}>
                Editar
              </Link>
            )}
          </div>
        );
      },
    }),
    [hotelId]
  );

  const columns = useMemo(
    () => [...bookingsTableColumns, actionsColumn],
    [actionsColumn]
  );

  const table = useReactTable({
    data: data.items,
    columns,
    manualPagination: true,
    manualSorting: true,
    pageCount: data.totalPages,
    defaultColumn: {
      size: "auto",
      minSize: 120,
      maxSize: "none",
    },
    initialState: {
      expanded: {}, // Initialize expanded state
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
      table.setExpanded({});
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // Enable row expansion
    getRowCanExpand: () => true,
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

  const handleFilterByStatusId = (value) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      statusId: value,
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
    const sortColumn = values.sortBy[0]?.id;
    const sortDirection = values.sortBy[0]
      ? values.sortBy[0].desc
        ? "DESC"
        : "ASC"
      : undefined;
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
        values.externalBookingId,
        values.statusId
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
          handleFilterByStatusId={handleFilterByStatusId}
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
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        onClick={
                          !loading
                            ? header.column.getToggleSortingHandler()
                            : () => {}
                        }
                        className={classNames(
                          "text-bg-dark text-center align-content-center",
                          {
                            "cursor-pointer": header.column.getCanSort(),
                            "text-bg-info": header.column.getIsSorted(),
                            "cursor-not-allowed": loading,
                          }
                        )}
                        style={{
                          maxWidth: header.column.columnDef.maxSize || "none",
                          minWidth: header.column.columnDef.minSize || "none",
                          width: header.column.getSize() || "auto",
                        }}>
                        {
                          <div
                            style={{ minWidth: "max-content" }}
                            className="align-items-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <span className="float-end ms-2">
                              {{
                                asc: (
                                  <FontAwesomeIcon icon={faArrowUpShortWide} />
                                ),
                                desc: (
                                  <FontAwesomeIcon
                                    icon={faArrowDownWideShort}
                                  />
                                ),
                              }[header.column.getIsSorted()] ||
                                (header.column.getCanSort() && (
                                  <FontAwesomeIcon icon={faSort} />
                                ))}
                            </span>
                          </div>
                        }
                      </th>
                    );
                  })}
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
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() =>
                        table.setExpanded({ [row.id]: !row.getIsExpanded() })
                      }
                      className="cursor-pointer">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          className={classNames(
                            "text-center align-content-center",
                            {
                              "bg-info-subtle": row.getIsExpanded(),
                            }
                          )}
                          style={{
                            maxWidth: cell.column.columnDef.maxSize || "none",
                            minWidth: cell.column.columnDef.minSize || "none",
                            width: cell.column.getSize() || "auto",
                          }}
                          key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {row.getIsExpanded() && (
                      <tr>
                        <td
                          colSpan={row.getVisibleCells().length}
                          className="p-0">
                          <div className="p-2 border border-info-subtle bg-light">
                            <Row>
                              <Col md={6}>
                                <strong>Creado por:</strong>{" "}
                                {row.original.createdBy?.firstName}{" "}
                                {row.original.createdBy?.lastName}
                              </Col>
                              <Col md={6}>
                                <strong>Fecha de creación:</strong>{" "}
                                {dayjs(row.original.dateCreated).format(
                                  "DD/MM/YYYY - h:mm A"
                                )}
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <strong>Modificado por:</strong>{" "}
                                {row.original.modifiedBy?.firstName}{" "}
                                {row.original.modifiedBy?.lastName}
                              </Col>
                              <Col md={6}>
                                <strong>Fecha de modificación:</strong>{" "}
                                {dayjs(row.original.dateModified).format(
                                  "DD/MM/YYYY - h:mm A"
                                )}
                              </Col>
                            </Row>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

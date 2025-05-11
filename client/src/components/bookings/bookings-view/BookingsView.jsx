import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner, Container } from "reactstrap";
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
import TableFilters from "components/bookings/bookings-view/BookingFilters";

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
  const [customerNameInputs, setCustomerNameInputs] = useState({
    firstName: "",
    lastName: "",
  });

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
      start: dayjs().toDate(),
      end: dayjs().endOf("month").toDate(),
    },
    isArrivalDate: true,
    customerNameFilters: {
      firstName: "",
      lastName: "",
    },
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

  const handleCustomerNameChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomerNameInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sortColumn = paginationData.sortBy[0]?.id || "ArrivalDate";
      const sortDirection = paginationData.sortBy[0]?.desc ? "DESC" : "ASC";
      try {
        const res = await getPagedMinimalBookingsByDateRange(
          hotelId,
          dayjs(paginationData.dates.start).format("YYYY-MM-DD"),
          dayjs(paginationData.dates.end).format("YYYY-MM-DD"),
          paginationData.pageIndex,
          paginationData.pageSize,
          paginationData.isArrivalDate,
          sortColumn,
          sortDirection,
          paginationData.customerNameFilters.firstName,
          paginationData.customerNameFilters.lastName
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
    };

    if (hotelId) {
      fetchData();
    }
  }, [hotelId, paginationData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        customerNameInputs.firstName !==
          paginationData.customerNameFilters.firstName ||
        customerNameInputs.lastName !==
          paginationData.customerNameFilters.lastName
      ) {
        setPaginationData((prev) => ({
          ...prev,
          pageIndex: 0,
          customerNameFilters: {
            firstName: customerNameInputs.firstName,
            lastName: customerNameInputs.lastName,
          },
        }));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [customerNameInputs, paginationData.customerNameFilters]);

  return (
    <Container className="my-4">
      <Breadcrumb breadcrumbs={breadcrumbs} active={"Reservas"} />
      <h3>Reservas</h3>
      <ErrorBoundary>
        <TableFilters
          paginationData={paginationData}
          loading={loading}
          handleDateChange={handleDateChange}
          toggleDateType={toggleDateType}
          handleCustomerNameChange={handleCustomerNameChange}
          customerNameInputs={customerNameInputs}
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
                        }[header.column.getIsSorted()] ||
                        header.column.getCanSort() ? (
                          <FontAwesomeIcon icon={faSort} />
                        ) : (
                          ""
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
    </Container>
  );
};

export default BookingsView;

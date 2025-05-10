import React, { useCallback, useEffect, useState } from "react";
import { Spinner, Container } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useTable, useSortBy, usePagination } from "react-table";
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
import { isEqual } from "lodash";
import classNames from "classnames";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import { columns } from "components/bookings/constants";
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
  const navigate = useNavigate();
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    state: { sortBy },
  } = useTable(
    {
      columns,
      data: data.items,
      manualPagination: true,
      manualSortBy: true,
      pageCount: data.totalPages,
      initialState: {
        pageIndex: paginationData.pageIndex,
        pageSize: paginationData.pageSize,
        sortBy: paginationData.sortBy,
      },
    },
    useSortBy,
    usePagination
  );

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
    if (!isEqual(paginationData.sortBy, sortBy)) {
      setPaginationData((prev) => ({
        ...prev,
        sortBy: sortBy,
      }));
    }
  }, [sortBy, paginationData.sortBy]);

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

          <table
            {...getTableProps()}
            className="table table-bordered table-hover table-striped mb-1">
            <thead>
              {headerGroups.map((headerGroup) => {
                const headerGroupProps = headerGroup.getHeaderGroupProps();
                return (
                  <tr {...headerGroupProps} key={headerGroupProps.key}>
                    {headerGroup.headers.map((column) => {
                      const columnProps = column.getHeaderProps(
                        column.getSortByToggleProps()
                      );
                      return (
                        <th
                          {...columnProps}
                          key={columnProps.key}
                          className="text-bg-dark text-center">
                          {column.render("Header")}
                          <span className="float-end">
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <FontAwesomeIcon icon={faArrowDownWideShort} />
                              ) : (
                                <FontAwesomeIcon icon={faArrowUpShortWide} />
                              )
                            ) : (
                              <FontAwesomeIcon icon={faSort} />
                            )}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()}>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    <Spinner size="sm" /> Cargando...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    No hay reservas
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  prepareRow(row);
                  const rowProps = row.getRowProps();
                  return (
                    <tr
                      {...rowProps}
                      key={rowProps.key}
                      onClick={() =>
                        navigate(
                          `/hotels/${hotelId}/bookings/${row.original.id}`
                        )
                      }
                      style={{ cursor: "pointer" }}>
                      {row.cells.map((cell) => {
                        const cellProps = cell.getCellProps();
                        return (
                          <td
                            {...cellProps}
                            key={cellProps.key}
                            className="text-center">
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
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

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";

import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import Pagination from "components/commonUI/Pagination";
import TransactionDetails from "components/transactions/TransactionDetails";

import { getPagedTransactions } from "services/transactionService";
import { transactionsTableColumns } from "./constants";

import { Spinner } from "reactstrap";
import classNames from "classnames";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faArrowDownWideShort,
  faSort,
} from "@fortawesome/free-solid-svg-icons";

const defaultData = {
  items: [],
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function TransactionsView() {
  const { hotelId } = useParams();
  const [data, setData] = useState({ ...defaultData });
  const [loading, setLoading] = useState(false);

  const [paginationData, setPaginationData] = useState({
    pageIndex: 0,
    pageSize: 5,
    sortBy: [],
  });

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const columns = useMemo(() => transactionsTableColumns, []);

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

  //     const onPageSizeChange = (e) =>
  // setPaginationData((prev) => ({
  //   ...prev,
  //   pageSize: Number(e.target.value),
  //   pageIndex: 0,
  // }));

  const gotoPage = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= data.totalPages) return;
    setPaginationData((prev) => ({ ...prev, pageIndex }));
    table.setExpanded({});
  };

  const fetchData = useCallback(async (hotelId, values) => {
    setLoading(true);
    const sortColumn = values.sortBy[0]?.id;
    const sortDirection = values.sortBy[0]
      ? values.sortBy[0].desc
        ? "DESC"
        : "ASC"
      : undefined;
    //   const startDate = values.dates.start
    //     ? dayjs(values.dates.start).format("YYYY-MM-DD")
    //     : null;
    //   const endDate = values.dates.end
    //     ? dayjs(values.dates.end).format("YYYY-MM-DD")
    //     : null;

    try {
      const res = await getPagedTransactions(
        hotelId,
        values.pageIndex,
        values.pageSize,
        sortColumn,
        sortDirection
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

  const updateHasDocumentUrl = useCallback((id, hasDocumentUrl) => {
    setData((prev) => {
      const newState = { ...prev };
      const newTransactions = newState.items.map((txn) => {
        if (txn.id === id) {
          return { ...txn, hasDocumentUrl };
        }
        return txn;
      });
      newState.items = newTransactions;
      return newState;
    });
  }, []);

  useEffect(() => {
    // const hasDates =
    //   Boolean(paginationData.dates.start) || Boolean(paginationData.dates.end);
    // const isValidDateRange =
    //   !hasDates ||
    //   (dayjs(paginationData.dates.start).isValid() &&
    //     dayjs(paginationData.dates.end).isValid());
    // if (hotelId && isValidDateRange) {
    if (hotelId) {
      fetchData(hotelId, paginationData);
    }
  }, [hotelId, paginationData, fetchData]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active={"Transacciones"} />
      <h3>Transacciones</h3>
      <ErrorBoundary>
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
                          className={classNames("text-center", {
                            "bg-info-subtle": row.getIsExpanded(),
                          })}
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
                            <TransactionDetails
                              txn={row.original}
                              updateHasDocumentUrl={updateHasDocumentUrl}
                            />
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
}

export default TransactionsView;

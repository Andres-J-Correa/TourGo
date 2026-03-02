import React, { useEffect } from "react";
import { useLanguage } from "contexts/LanguageContext";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faArrowDownWideShort,
  faSort,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import dayjs from "dayjs";
import { flattenObject } from "utils/objectHelper";
import { formatCurrency } from "utils/currencyHelper";
import {
  TRANSACTION_CATEGORIES_BY_ID,
  TRANSACTION_STATUS_BY_ID,
} from "components/transactions/constants";
import Pagination from "components/commonUI/Pagination";
import TransactionDetails from "components/transactions/TransactionDetails";
import { Button, Col, Label, Row, Spinner } from "reactstrap";

import { useTransactionsTableColumns, useExcelColumns } from "./constants";

const TransactionsTable = ({
  data,
  loading,
  paginationData,
  setPaginationData,
  onEditTransaction,
  updateHasDocumentUrl,
  onReverseSuccess,
  onEditDescriptionSuccess,
}) => {
  const { t } = useLanguage();

  // hooks from constants file
  const transactionsTableColumns = useTransactionsTableColumns();
  const columnOrderTranslated = useExcelColumns();

  const table = useReactTable({
    data: data.items,
    columns: transactionsTableColumns,
    manualPagination: true,
    manualSorting: true,
    pageCount: data.totalPages,
    defaultColumn: {
      size: "auto",
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

  // collapse any expanded rows when paginationData or filters change
  useEffect(() => {
    table.setExpanded({});
  }, [paginationData]);

  const exportExcel = async (rows) => {
    const { utils, writeFile } = await import("xlsx");

    let rowData = rows.map((row) => {
      let copy = { ...row.original };
      copy = flattenObject(copy);
      copy.category = t(TRANSACTION_CATEGORIES_BY_ID[copy.categoryId]) || "";
      copy.status = t(TRANSACTION_STATUS_BY_ID[copy.statusId]) || "";
      copy.transactionDate = dayjs(copy.transactionDate).format("YYYY-MM-DD");

      return copy;
    });
    rowData = rowData.map((row) =>
      columnOrderTranslated.reduce((acc, obj) => {
        acc[obj.label] = row[obj.id] ?? "";
        return acc;
      }, {}),
    );
    const worksheet = utils.json_to_sheet(rowData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, t("transactions.view.title"));
    writeFile(workbook, `${t("transactions.view.title")}.xlsx`, {
      compression: true,
    });
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
    table.setExpanded({});
  };

  return (
    <>
      <Row className="mb-3">
        <Col md="auto" className="align-content-end">
          <span className="text-dark fw-bold fs-5">
            {t("transactions.view.totalActual")}:{" "}
            {data.items?.length > 0
              ? formatCurrency(data.items[0].total, data.items[0].currencyCode)
              : 0}
          </span>
        </Col>
        <Col>
          <div className="float-end">
            <Label for="pageSize" className="text-dark">
              {t("transactions.view.rowsPerPage")}
            </Label>
            <select
              id="pageSize"
              className="form-select"
              value={paginationData.pageSize}
              disabled={loading}
              onChange={onPageSizeChange}>
              {[5, 10, 20, 50, 100, 200, 500].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>
      <Row>
        <div>
          <Button
            color="success"
            className="float-end"
            onClick={() => exportExcel(table.getRowModel().rows)}
            disabled={loading || table.getRowModel().rows.length === 0}>
            <FontAwesomeIcon icon={faFileExcel} className="me-2" />
            {t("transactions.view.exportExcel")}
          </Button>
        </div>
      </Row>
      <Row className="mt-3">
        <Col>
          <Pagination
            pageIndex={paginationData.pageIndex}
            totalPages={data.totalPages}
            onPageChange={gotoPage}
          />
        </Col>
      </Row>
      <div className="table-responsive">
        <span
          className={classNames("float-end", {
            invisible: data.items.length === 0 || loading,
          })}>
          {t("transactions.view.showing")}{" "}
          {paginationData.pageSize * paginationData.pageIndex + 1}{" "}
          {t("transactions.view.to")}{" "}
          {!data.hasNextPage
            ? data.totalCount
            : paginationData.pageSize * (paginationData.pageIndex + 1)}{" "}
          {t("transactions.view.of")} {data.totalCount}{" "}
          {t("transactions.view.title").toLowerCase()}
        </span>
        <table className="table-sm table table-bordered table-hover table-striped mb-1">
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
                        },
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
                            header.getContext(),
                          )}
                          <span className="float-end ms-2">
                            {{
                              asc: (
                                <FontAwesomeIcon icon={faArrowUpShortWide} />
                              ),
                              desc: (
                                <FontAwesomeIcon icon={faArrowDownWideShort} />
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
                <td
                  colSpan={transactionsTableColumns.length}
                  className="text-center">
                  <Spinner size="sm" /> {t("common.loading")}
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={transactionsTableColumns.length}
                  className="text-center">
                  {t("commonUI.dataTable.noRecords")}
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
                          },
                        )}
                        style={{
                          maxWidth: cell.column.columnDef.maxSize || "none",
                          minWidth: cell.column.columnDef.minSize || "none",
                          width: cell.column.getSize() || "auto",
                        }}
                        key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
                            onReverseSuccess={onReverseSuccess}
                            onEditDescriptionSuccess={onEditDescriptionSuccess}
                            onEditTransaction={onEditTransaction}
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
          {t("transactions.view.page")} {paginationData.pageIndex + 1}{" "}
          {t("transactions.view.of")} {data.totalPages}
        </p>
      </div>
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
  );
};

export default TransactionsTable;

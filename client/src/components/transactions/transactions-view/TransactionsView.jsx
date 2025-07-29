import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";

import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import Pagination from "components/commonUI/Pagination";
import TransactionDetails from "components/transactions/TransactionDetails";
import TransactionsTableFilters from "components/transactions/transactions-view/TransactionsTableFilters";
import TransactionAddForm from "components/transactions/TransactionAddForm";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import TransactionUpdateForm from "components/transactions/TransactionUpdateForm";

import {
  getPagedTransactions,
  getFixedPagination,
} from "services/transactionService";
import { useTransactionsTableColumns } from "./constants";
import { formatCurrency } from "utils/currencyHelper";
import { useAppContext } from "contexts/GlobalAppContext";
import { HOTEL_ROLES_IDS } from "components/hotels/constants";
import {
  TRANSACTION_CATEGORIES_BY_ID,
  TRANSACTION_STATUS_BY_ID,
} from "components/transactions/constants";
import useHotelFormData from "components/transactions/hooks/useHotelFormData";
import { useLanguage } from "contexts/LanguageContext";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";

import { Button, Col, Label, Row, Spinner } from "reactstrap";
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
  faSquarePlus,
  faSquareMinus,
  faFileCsv,
} from "@fortawesome/free-solid-svg-icons";
import { flattenObject } from "utils/objectHelper";
import dayjs from "dayjs";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { getDateString } from "utils/dateHelper";

import "./TransactionsView.css";

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
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [transactionToUpdate, setTransactionToUpdate] = useState(null);

  const {
    paymentMethods,
    transactionSubcategories,
    financePartners,
    isLoadingHotelData,
  } = useHotelFormData(hotelId);

  const transactionsTableColumns = useTransactionsTableColumns();

  const { hotel, user } = useAppContext();

  const { t } = useLanguage();

  const isUserAdmin = useMemo(
    () =>
      hotel.current.roleId === HOTEL_ROLES_IDS.ADMIN ||
      hotel.current.roleId === HOTEL_ROLES_IDS.OWNER,
    [hotel]
  );

  const fetchTransactions = useMemo(
    () => (isUserAdmin ? getPagedTransactions : getFixedPagination),
    [isUserAdmin]
  );

  const minDate = useMemo(() => {
    return dayjs().subtract(7, "day").toDate();
  }, []);

  const columnOrderTranslated = [
    { id: "id", label: t("transactions.table.id") },
    { id: "transactionDate", label: t("transactions.table.transactionDate") },
    { id: "amount", label: t("transactions.table.amount") },
    { id: "currencyCode", label: t("transactions.table.currencyCode") },
    { id: "category", label: t("transactions.table.category") },
    { id: "subcategory", label: t("transactions.table.subcategory") },
    { id: "paymentMethod-name", label: t("transactions.table.paymentMethod") },
    { id: "description", label: t("transactions.table.description") },
    { id: "referenceNumber", label: t("transactions.table.referenceNumber") },
    { id: "status", label: t("transactions.table.status") },
    { id: "entityId", label: t("transactions.table.entity") },
    {
      id: "financePartner-name",
      label: t("transactions.table.financePartner"),
    },
    { id: "parentId", label: t("transactions.table.parentId") },
    { id: "hasDocumentUrl", label: t("transactions.table.hasDocumentUrl") },
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ";",
    filename: t("transactions.view.title").toLowerCase(),
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const [paginationData, setPaginationData] = useState({
    pageIndex: 0,
    pageSize: 5,
    sortBy: [],
    dates: {
      start: "",
      end: "",
    },
    categoryId: "",
    statusId: "",
    subcategoryId: "",
    financePartnerId: "",
    paymentMethodId: "",
    txnId: "",
    referenceNumber: "",
    description: "",
    entityId: "",
    hasDocumentUrl: "",
    randomIdForUpdate: "",
  });

  const breadcrumbs = [
    { label: t("common.breadcrumbs.home"), path: "/" },
    { label: t("common.breadcrumbs.hotels"), path: "/hotels" },
    { label: t("common.breadcrumbs.hotel"), path: `/hotels/${hotelId}` },
  ];

  const columns = useMemo(
    () => transactionsTableColumns,
    [transactionsTableColumns]
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

  const exportExcel = (rows) => {
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
      }, {})
    );
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const onPageSizeChange = (e) =>
    setPaginationData((prev) => ({
      ...prev,
      pageSize: Number(e.target.value),
      pageIndex: 0,
    }));

  const handleDateChange = (field) => (date) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      dates: { ...prev.dates, [field]: getDateString(date) },
    }));
    table.setExpanded({});
  };

  const handleFixedStartDateChange = (date) => {
    if (dayjs(date).isBefore(dayjs(getDateString(minDate)))) {
      return;
    }
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      dates: { ...prev.dates, start: getDateString(date) },
    }));
    table.setExpanded({});
  };

  const gotoPage = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= data.totalPages) return;
    setPaginationData((prev) => ({ ...prev, pageIndex }));
    table.setExpanded({});
  };

  const handleCategoryChange = (categoryId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      categoryId,
    }));
    table.setExpanded({});
  };

  const handleStatusChange = (statusId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      statusId,
    }));
    table.setExpanded({});
  };

  const handleHasDocumentUrlChange = (hasDocumentUrl) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      hasDocumentUrl,
    }));
    table.setExpanded({});
  };
  const handleSubcategoryChange = (subcategoryId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      subcategoryId,
    }));
    table.setExpanded({});
  };

  const handleFinancePartnerChange = (financePartnerId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      financePartnerId,
    }));
    table.setExpanded({});
  };

  const handlePaymentMethodChange = (paymentMethodId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      paymentMethodId,
    }));
    table.setExpanded({});
  };

  const handleTransactionIdInputChange = (txnId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      txnId,
    }));
    table.setExpanded({});
  };

  const handleReferenceNumberInputChange = (referenceNumber) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      referenceNumber,
    }));
    table.setExpanded({});
  };

  const handleDescriptionInputChange = (description) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      description,
    }));
    table.setExpanded({});
  };

  const handleEntityIdInputChange = (entityId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      entityId,
    }));
    table.setExpanded({});
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleAddTransactionClick = () => {
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const onTransactionAdded = useCallback(() => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
    table.setExpanded({});
  }, [setPaginationData, table]);

  const handleClearAllFilters = () => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      dates: {
        start: "",
        end: "",
      },
      categoryId: "",
      statusId: "",
      subcategoryId: "",
      financePartnerId: "",
      paymentMethodId: "",
      txnId: "",
      referenceNumber: "",
      description: "",
      entityId: "",
      hasDocumentUrl: "",
    }));
    table.setExpanded({});
  };

  const onEditTransaction = useCallback(
    (transaction) => {
      setTransactionToUpdate(transaction);
      setShowForm(false);
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    },
    [setTransactionToUpdate]
  );

  const handleCancelUpdate = useCallback(() => {
    setTransactionToUpdate(null);
  }, [setTransactionToUpdate]);

  const onTransactionUpdated = useCallback(
    (updatedTransaction) => {
      setData((prev) => {
        const newItems = prev.items.map((txn) => {
          if (txn.id === updatedTransaction.id) {
            return { ...txn, ...updatedTransaction };
          }
          return txn;
        });
        return { ...prev, items: newItems };
      });
      setTransactionToUpdate(null);
    },
    [setData]
  );

  const fetchData = useCallback(
    async (hotelId, values) => {
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
        const res = await fetchTransactions(
          hotelId,
          values.pageIndex,
          values.pageSize,
          sortColumn,
          sortDirection,
          startDate,
          endDate,
          values.categoryId,
          values.statusId,
          values.subcategoryId,
          values.financePartnerId,
          values.paymentMethodId,
          values.txnId,
          values.referenceNumber,
          values.description,
          values.entityId,
          values.hasDocumentUrl
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
    },
    [fetchTransactions]
  );

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

  const onReverseSuccess = useCallback(() => {
    setPaginationData((prev) => ({
      ...prev,
    }));
    table.setExpanded({});
  }, [table]);

  const onEditDescriptionSuccess = useCallback(
    (txnId, newDescription) => {
      setData((prev) => {
        const newItems = prev.items.map((txn) => {
          if (txn.id === txnId) {
            return {
              ...txn,
              description: newDescription,
              dateModified: dayjs().toDate(),
              modifiedBy: {
                id: user.current.id,
                firstName: user.current.firstName,
                lastName: user.current.lastName,
              },
            };
          }
          return txn;
        });
        return { ...prev, items: newItems };
      });
    },
    [user]
  );

  useEffect(() => {
    const hasDates =
      Boolean(paginationData.dates.start) || Boolean(paginationData.dates.end);

    const isValidDateRange =
      dayjs(paginationData.dates.start).isValid() &&
      dayjs(paginationData.dates.end).isValid();

    const shouldFetchData = (hasDates && isValidDateRange) || !hasDates;

    if (hotelId && shouldFetchData && hotel.current.roleId !== 0) {
      fetchData(hotelId, paginationData);
    }
  }, [hotelId, paginationData, fetchData, hotel]);

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("transactions.view.title")}
      />
      <LoadingOverlay isVisible={hotel.isLoading} />
      <h3>{t("transactions.view.title")}</h3>
      <ErrorBoundary>
        <div>
          {isUserAdmin ? (
            <div
              className="text-dark cursor-pointer fw-bold fs-4 mb-2 ms-auto"
              style={{ maxWidth: "max-content" }}
              onClick={handleToggleFilters}>
              {t("transactions.view.filters")}
              <span className="ms-2">
                <FontAwesomeIcon
                  size="lg"
                  icon={showFilters ? faSquareMinus : faSquarePlus}
                />
              </span>
            </div>
          ) : (
            <Row>
              <Col lg={12} xl={3}>
                <DatePickersV2
                  startDate={paginationData.dates?.start}
                  endDate={paginationData.dates?.end}
                  handleStartChange={handleFixedStartDateChange}
                  handleEndChange={handleDateChange("end")}
                  disabled={loading}
                  allowSameDay={true}
                  minDate={minDate}
                />
              </Col>
            </Row>
          )}
          <div
            className={classNames(
              "mb-3 p-3 border shadow-sm rounded-3 bg-light",
              {
                "d-none": !showFilters,
              }
            )}>
            <TransactionsTableFilters
              hotelId={hotelId}
              paginationData={paginationData}
              loading={loading}
              handleDateChange={handleDateChange}
              onPageSizeChange={onPageSizeChange}
              handleCategoryChange={handleCategoryChange}
              handleStatusChange={handleStatusChange}
              handleSubcategoryChange={handleSubcategoryChange}
              handleFinancePartnerChange={handleFinancePartnerChange}
              handlePaymentMethodChange={handlePaymentMethodChange}
              handleTransactionIdInputChange={handleTransactionIdInputChange}
              handleReferenceNumberInputChange={
                handleReferenceNumberInputChange
              }
              handleDescriptionInputChange={handleDescriptionInputChange}
              handleEntityIdInputChange={handleEntityIdInputChange}
              handleHasDocumentUrlChange={handleHasDocumentUrlChange}
              handleClearAllFilters={handleClearAllFilters}
            />
          </div>
        </div>
        <Row className="mb-3">
          <Col md="auto" className="align-content-end">
            <span className="text-dark fw-bold fs-5">
              {t("transactions.view.totalActual")}:{" "}
              {data.items?.length > 0
                ? formatCurrency(
                    data.items[0].total,
                    data.items[0].currencyCode
                  )
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
                value={
                  paginationData.pageSize > data.totalCount
                    ? data.totalCount
                    : paginationData.pageSize
                }
                disabled={loading}
                onChange={onPageSizeChange}>
                {[5, 10, 20, 50]
                  .concat(
                    Boolean(data.totalCount) && data.totalCount > 50
                      ? [data.totalCount]
                      : []
                  )
                  .map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
              </select>
            </div>
          </Col>
        </Row>
        <Row>
          {!showForm && (
            <div className="text-center">
              <Button color="primary" onClick={handleAddTransactionClick}>
                {t("transactions.view.addTransaction")}
              </Button>
            </div>
          )}
          <div>
            <Button
              color="success"
              className="float-end"
              onClick={() => exportExcel(table.getRowModel().rows)}
              disabled={loading || table.getRowModel().rows.length === 0}>
              <FontAwesomeIcon icon={faFileCsv} className="me-2" />
              {t("transactions.view.exportCsv")}
            </Button>
          </div>
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
                    <Spinner size="sm" /> {t("common.loading")}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
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
                            <TransactionDetails
                              txn={row.original}
                              updateHasDocumentUrl={updateHasDocumentUrl}
                              onReverseSuccess={onReverseSuccess}
                              onEditDescriptionSuccess={
                                onEditDescriptionSuccess
                              }
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
        <Pagination
          pageIndex={paginationData.pageIndex}
          totalPages={data.totalPages}
          hasPreviousPage={data.hasPreviousPage}
          hasNextPage={data.hasNextPage}
          onPageChange={gotoPage}
        />
        <div className="mt-5">
          <TransactionAddForm
            hotelId={hotelId}
            submitting={loading}
            showForm={showForm}
            setShowForm={setShowForm}
            onTransactionAdded={onTransactionAdded}
            paymentMethods={paymentMethods}
            transactionSubcategories={transactionSubcategories}
            financePartners={financePartners}
            isLoadingHotelData={isLoadingHotelData}
          />
          <TransactionUpdateForm
            transaction={transactionToUpdate}
            hotelId={hotelId}
            showForm={!!transactionToUpdate}
            handleCancelClick={handleCancelUpdate}
            paymentMethods={paymentMethods}
            transactionSubcategories={transactionSubcategories}
            financePartners={financePartners}
            isLoadingHotelData={isLoadingHotelData}
            onTransactionUpdated={onTransactionUpdated}
          />
        </div>
      </ErrorBoundary>
    </>
  );
}

export default TransactionsView;

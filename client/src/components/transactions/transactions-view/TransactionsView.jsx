import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";

import ErrorBoundary from "components/commonUI/ErrorBoundary";
import TransactionsTableFilters from "components/transactions/transactions-view/TransactionsTableFilters";
import TransactionsTable from "./TransactionsTable";
import TransactionAddForm from "components/transactions/TransactionAddForm";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import TransactionUpdateForm from "components/transactions/TransactionUpdateForm";

import {
  getPagedTransactions,
  getFixedPagination,
} from "services/transactionService";
import { useAppContext } from "contexts/GlobalAppContext";
import { HOTEL_ROLES_IDS } from "components/hotels/constants";
import useHotelFormData from "components/transactions/hooks/useHotelFormData";
import { useLanguage } from "contexts/LanguageContext";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";

import { Button, Col, Row, Collapse } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faSquareMinus } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import isEqual from "lodash.isequal";
import { getDateString } from "utils/dateHelper";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import "./TransactionsView.css";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";

dayjs.extend(isSameOrBefore);

const defaultData = {
  items: [],
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

const defaultPaginationFilters = {
  pageIndex: 0,
  dates: {
    start: "",
    end: "",
  },
  categoryIds: [],
  statusIds: [],
  subcategoryIds: [],
  financePartnerIds: [],
  paymentMethodIds: [],
  txnId: "",
  referenceNumber: "",
  description: "",
  entityId: "",
  hasDocumentUrl: "",
};

function TransactionsView() {
  const { hotelId } = useParams();
  const [data, setData] = useState({ ...defaultData });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [transactionToUpdate, setTransactionToUpdate] = useState(null);

  const [paginationData, setPaginationData] = useState({
    pageSize: 5,
    sortBy: [],
    ...defaultPaginationFilters,
  });
  const [appliedPaginationData, setAppliedPaginationData] = useState({
    pageSize: 5,
    sortBy: [],
    ...defaultPaginationFilters,
  });

  const {
    paymentMethods,
    transactionSubcategories,
    financePartners,
    isLoadingHotelData,
  } = useHotelFormData(hotelId);

  const { hotel, user } = useAppContext();

  const { t } = useLanguage();

  const isUserAdmin = useMemo(
    () =>
      hotel.current.roleId === HOTEL_ROLES_IDS.ADMIN ||
      hotel.current.roleId === HOTEL_ROLES_IDS.OWNER,
    [hotel],
  );

  const fetchTransactions = useMemo(
    () => (isUserAdmin ? getPagedTransactions : getFixedPagination),
    [isUserAdmin],
  );

  const minDate = useMemo(() => {
    return dayjs().subtract(7, "day").toDate();
  }, []);

  const breadcrumbs = useMemo(() => {
    return hotelId
      ? new BreadcrumbBuilder(t)
          .addHotel(hotelId)
          .addActive(t("transactions.view.title"))
          .build()
      : null;
  }, [hotelId, t]);

  const handleDateChange = (field) => (date) => {
    const updater = (prev) => ({
      ...prev,
      pageIndex: 0,
      dates: { ...prev.dates, [field]: getDateString(date) },
    });

    setPaginationData(updater);
    if (!isUserAdmin) {
      setAppliedPaginationData(updater);
    }
  };

  const handleFixedStartDateChange = (date) => {
    if (dayjs(date).isBefore(dayjs(getDateString(minDate)))) {
      return;
    }
    const updater = (prev) => ({
      ...prev,
      pageIndex: 0,
      dates: { ...prev.dates, start: getDateString(date) },
    });
    setPaginationData(updater);
    if (!isUserAdmin) {
      setAppliedPaginationData(updater);
    }
  };

  const handleCategoryChange = (categoryIds) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      categoryIds,
    }));
  };

  const handleStatusChange = (statusIds) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      statusIds,
    }));
  };

  const handleHasDocumentUrlChange = (hasDocumentUrl) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      hasDocumentUrl,
    }));
  };
  const handleSubcategoryChange = (subcategoryIds) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      subcategoryIds,
    }));
  };

  const handleFinancePartnerChange = (financePartnerIds) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      financePartnerIds,
    }));
  };

  const handlePaymentMethodChange = (paymentMethodIds) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      paymentMethodIds,
    }));
  };

  const handleTransactionIdInputChange = (txnId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      txnId,
    }));
  };

  const handleReferenceNumberInputChange = (referenceNumber) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      referenceNumber,
    }));
  };

  const handleDescriptionInputChange = (description) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      description,
    }));
  };

  const handleEntityIdInputChange = (entityId) => {
    setPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
      entityId,
    }));
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
    setAppliedPaginationData((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [setPaginationData]);

  const handleClearAllFilters = () => {
    setPaginationData((prev) => ({
      ...prev,
      ...defaultPaginationFilters,
    }));
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
    [setTransactionToUpdate],
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
    [setData],
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
          values.categoryIds,
          values.statusIds,
          values.subcategoryIds,
          values.financePartnerIds,
          values.paymentMethodIds,
          values.txnId,
          values.referenceNumber,
          values.description,
          values.entityId,
          values.hasDocumentUrl,
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
    [fetchTransactions],
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
  }, []);

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
    [user],
  );

  useEffect(() => {
    const start = appliedPaginationData.dates.start;
    const end = appliedPaginationData.dates.end;

    const isValidDateRange =
      !!start && !!end
        ? dayjs(start).isValid() &&
          dayjs(end).isValid() &&
          dayjs(start).isSameOrBefore(dayjs(end))
        : true;

    if (hotelId && isValidDateRange && hotel.current.roleId !== 0) {
      fetchData(hotelId, appliedPaginationData);
    }
  }, [hotelId, appliedPaginationData, fetchData, hotel]);

  const handleSearch = () => {
    setAppliedPaginationData(paginationData);
  };

  const hasPaginationDataChanged = useMemo(() => {
    const paginationDataCopy = { ...paginationData };
    const appliedPaginationDataCopy = { ...appliedPaginationData };

    delete paginationDataCopy.pageIndex;
    delete appliedPaginationDataCopy.pageIndex;

    return !isEqual(paginationDataCopy, appliedPaginationDataCopy);
  }, [paginationData, appliedPaginationData]);

  const updateBoth = (updater) => {
    setPaginationData(updater);
    setAppliedPaginationData(updater);
  };

  return (
    <>
      {breadcrumbs}
      <LoadingOverlay isVisible={hotel.isLoading} />
      <h3>{t("transactions.view.title")}</h3>
      <ErrorBoundary>
        <div>
          {isUserAdmin ? (
            <div className="d-flex justify-content-end mb-2">
              <button className="btn btn-dark" onClick={handleToggleFilters}>
                {t("transactions.view.filters")}
                <FontAwesomeIcon
                  className="ms-2"
                  size="lg"
                  icon={showFilters ? faSquareMinus : faSquarePlus}
                />
              </button>
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
          <Collapse isOpen={showFilters}>
            <div className="mb-3 p-3 border shadow-sm rounded-3 bg-light">
              <TransactionsTableFilters
                hotelId={hotelId}
                paginationData={paginationData}
                loading={loading}
                handleDateChange={handleDateChange}
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
                handleSearch={handleSearch}
                hasPaginationDataChanged={hasPaginationDataChanged}
              />
            </div>
          </Collapse>
        </div>

        <Row className="mb-2">
          {!showForm && (
            <div className="text-center">
              <Button color="primary" onClick={handleAddTransactionClick}>
                {t("transactions.view.addTransaction")}
              </Button>
            </div>
          )}
        </Row>

        <TransactionsTable
          data={data}
          loading={loading}
          paginationData={appliedPaginationData}
          setPaginationData={updateBoth}
          onEditTransaction={onEditTransaction}
          updateHasDocumentUrl={updateHasDocumentUrl}
          onReverseSuccess={onReverseSuccess}
          onEditDescriptionSuccess={onEditDescriptionSuccess}
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

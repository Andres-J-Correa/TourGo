import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row } from "reactstrap";
import classNames from "classnames";
import Transaction from "components/transactions/Transaction";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import { formatCurrency } from "utils/currencyHelper";
import TransactionAddForm from "components/transactions/TransactionAddForm";
import TransactionUpdateForm from "components/transactions/TransactionUpdateForm";
import { TRANSACTION_STATUS_IDS } from "components/transactions/constants";
import useHotelFormData from "components/transactions/hooks/useHotelFormData";
import dayjs from "dayjs";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";

const EntityTransactionsView = ({
  hotelId,
  submitting,
  entity,
  setEntity,
  showTotals = true,
  showAddButton = true,
}) => {
  const [mappedTransactions, setMappedTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [transactionToUpdate, setTransactionToUpdate] = useState(null);

  const {
    paymentMethods,
    transactionSubcategories,
    financePartners,
    isLoadingHotelData,
  } = useHotelFormData(hotelId);

  const { user } = useAppContext();
  const { t } = useLanguage();

  const paid = entity?.transactions?.reduce((acc, txn) => acc + txn.amount, 0);

  const balance = entity?.total - (isNaN(paid) ? 0 : paid);

  const onReverseSuccess = useCallback(
    (reversedId, newId) => {
      setEntity((prev) => {
        const newTransactions = [...prev.transactions];
        const indexOfReversed = newTransactions.findIndex(
          (txn) => txn.id === reversedId
        );

        if (indexOfReversed !== -1) {
          const copyOfReversed = { ...newTransactions[indexOfReversed] };
          copyOfReversed.statusId = TRANSACTION_STATUS_IDS.REVERSED;
          copyOfReversed.dateModified = dayjs().toDate();
          copyOfReversed.modifiedBy = {
            id: user.current.id,
            firstName: user.current.firstName,
            lastName: user.current.lastName,
          };
          const reversedTransaction = {
            ...copyOfReversed,
            id: newId,
            parentId: reversedId,
            amount: -copyOfReversed.amount,
            description: "Reversal",
            dateCreated: dayjs().toDate(),
            dateModified: dayjs().toDate(),
            createdBy: {
              id: user.current.id,
              firstName: user.current.firstName,
              lastName: user.current.lastName,
            },
            approvedBy: {
              id: user.current.id,
              firstName: user.current.firstName,
              lastName: user.current.lastName,
            },
            hasDocumentUrl: false,
          };

          newTransactions[indexOfReversed] = copyOfReversed;
          newTransactions.splice(indexOfReversed, 0, reversedTransaction);

          return {
            ...prev,
            transactions: newTransactions,
          };
        }
        return prev;
      });
    },
    [setEntity, user]
  );

  const handleAddTransactionClick = () => {
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const updateHasDocumentUrl = useCallback(
    (id, hasDocumentUrl) => {
      setEntity((prev) => {
        const newState = { ...prev };
        const newTransactions = newState.transactions.map((txn) => {
          if (txn.id === id) {
            return { ...txn, hasDocumentUrl };
          }
          return txn;
        });
        newState.transactions = newTransactions;
        return newState;
      });
    },
    [setEntity]
  );

  const onTransactionAdded = useCallback(
    (newTransaction) => {
      setEntity((prev) => {
        const transactions = prev.transactions || [];
        return {
          ...prev,
          transactions: [newTransaction, ...transactions],
        };
      });
    },
    [setEntity]
  );

  const onEditDescriptionSuccess = useCallback(
    (id, newDescription) => {
      setEntity((prev) => {
        const newTransactions = prev.transactions.map((txn) => {
          if (txn.id === id) {
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
        return { ...prev, transactions: newTransactions };
      });
    },
    [setEntity, user]
  );

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
      setEntity((prev) => {
        const newTransactions = prev.transactions.map((txn) => {
          if (txn.id === updatedTransaction.id) {
            return { ...txn, ...updatedTransaction };
          }
          return txn;
        });
        return { ...prev, transactions: newTransactions };
      });
      setTransactionToUpdate(null);
    },
    [setEntity]
  );

  const mapTransaction = useCallback(
    (txn) => (
      <Transaction
        key={`transaction-${txn.id}`}
        txn={txn}
        updateHasDocumentUrl={updateHasDocumentUrl}
        onReverseSuccess={onReverseSuccess}
        onEditDescriptionSuccess={onEditDescriptionSuccess}
        onEditTransaction={onEditTransaction}
      />
    ),
    [
      updateHasDocumentUrl,
      onReverseSuccess,
      onEditDescriptionSuccess,
      onEditTransaction,
    ]
  );

  useEffect(() => {
    if (entity?.transactions?.length > 0) {
      setMappedTransactions(entity.transactions.map(mapTransaction));
    } else {
      setMappedTransactions([]);
    }
  }, [entity?.transactions, mapTransaction]);

  return (
    <>
      <LoadingOverlay isVisible={submitting} />
      <div>
        {showTotals && (
          <>
            {" "}
            <Row>
              <Col md={4}>
                <strong className="fs-5 text">
                  {t("transactions.view.total")}
                </strong>
                <span className="float-end mt-1">
                  {formatCurrency(entity.total, "COP")}
                </span>
              </Col>
              <Col md={4}>
                <strong className="fs-5 text">
                  {t("transactions.view.paid")}
                </strong>
                <span className="float-end mt-1">
                  {formatCurrency(paid, "COP")}
                </span>
              </Col>
              <Col md={4}>
                <strong className="fs-5 text">
                  {t("transactions.view.balance")}
                </strong>
                <span
                  className={classNames("float-end mt-1", {
                    "text-danger": balance < 0,
                  })}>
                  {formatCurrency(balance, "COP")}
                </span>
              </Col>
            </Row>
            <hr />
          </>
        )}

        {!showForm && showAddButton && (
          <div className="text-center mb-3">
            <Button color="primary" onClick={handleAddTransactionClick}>
              {t("transactions.view.addTransaction")}
            </Button>
          </div>
        )}
        {mappedTransactions}
        <TransactionAddForm
          hotelId={hotelId}
          entity={entity}
          submitting={submitting}
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
    </>
  );
};

export default EntityTransactionsView;

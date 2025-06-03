import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row } from "reactstrap";
import classNames from "classnames";
import Transaction from "components/transactions/Transaction";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import { formatCurrency } from "utils/currencyHelper";
import TransactionAddForm from "components/transactions/TransactionAddForm";
import { TRANSACTION_STATUS_IDS } from "components/transactions/constants";
import dayjs from "dayjs";
import { useAppContext } from "contexts/GlobalAppContext";

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

  const { user } = useAppContext();

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
          const reversedTransaction = {
            ...copyOfReversed,
            id: newId,
            parentId: reversedId,
            amount: -copyOfReversed.amount,
            description: "Reversal",
            dateCreated: dayjs().format("DD/MM/YYYY - h:mm a"),
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

  const mapTransaction = useCallback(
    (txn) => (
      <Transaction
        key={`transaction-${txn.id}`}
        txn={txn}
        updateHasDocumentUrl={updateHasDocumentUrl}
        onReverseSuccess={onReverseSuccess}
      />
    ),
    [updateHasDocumentUrl, onReverseSuccess]
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
                <strong className="fs-5 text">Total:</strong>
                <span className="float-end mt-1">
                  {formatCurrency(entity.total, "COP")}
                </span>
              </Col>
              <Col md={4}>
                <strong className="fs-5 text">Pagado:</strong>
                <span className="float-end mt-1">
                  {formatCurrency(paid, "COP")}
                </span>
              </Col>
              <Col md={4}>
                <strong className="fs-5 text">Saldo:</strong>
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
              Agregar Transacción
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
        />
      </div>
    </>
  );
};

export default EntityTransactionsView;

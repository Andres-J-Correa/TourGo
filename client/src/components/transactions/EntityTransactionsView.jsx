import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row } from "reactstrap";
import classNames from "classnames";
import Transaction from "components/transactions/Transaction";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import { formatCurrency } from "utils/currencyHelper";
import TransactionAddForm from "components/transactions/TransactionAddForm";

const EntityTransactionsView = ({
  hotelId,
  submitting,
  entity,
  setEntity,
  showTotals = true,
}) => {
  const [mappedTransactions, setMappedTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const paid = entity?.transactions?.reduce((acc, txn) => acc + txn.amount, 0);

  const balance = entity?.total - (isNaN(paid) ? 0 : paid);

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
      />
    ),
    [updateHasDocumentUrl]
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

        {!showForm && (
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

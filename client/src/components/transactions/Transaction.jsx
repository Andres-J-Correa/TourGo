import React, { useState } from "react";
import { Card, CardBody, CardHeader, Row } from "reactstrap";
import { formatCurrency } from "utils/currencyHelper";
import classNames from "classnames";
import dayjs from "dayjs";
import TransactionDetails from "components/transactions/TransactionDetails";
import TransactionStatusBadge from "components/transactions/TransactionStatusBadge";
import { TRANSACTION_STATUS_IDS } from "components/transactions/constants";

import "./Transaction.css";

function Transaction({
  txn,
  updateHasDocumentUrl,
  onReverseSuccess,
  onEditDescriptionSuccess,
  isVersion,
  parentSize,
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const cardClass = classNames("px-0", {
    "w-100": expanded,
    "w-75": !expanded,
  });

  const cardHeaderClass = classNames("transaction-card-header", {
    "bg-success-subtle":
      txn.amount >= 0 && txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED,
    "bg-warning-subtle":
      txn.amount < 0 && txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED,
    "bg-secondary-subtle": txn.statusId === TRANSACTION_STATUS_IDS.REVERSED,
    "text-dark": expanded,
  });

  return (
    <Row className="mb-1 justify-content-center">
      <Card className={cardClass}>
        <CardHeader onClick={toggleExpanded} className={cardHeaderClass}>
          <strong>{formatCurrency(txn.amount, txn.currencyCode)}</strong>
          {" - "}
          {dayjs(txn.transactionDate).format("DD/MMM/YYYY")}
          {" - "}
          {txn.paymentMethod?.name}
          <TransactionStatusBadge
            statusId={txn?.statusId}
            className="float-end"
          />
        </CardHeader>

        {expanded && (
          <CardBody>
            <TransactionDetails
              txn={txn}
              updateHasDocumentUrl={updateHasDocumentUrl}
              onReverseSuccess={onReverseSuccess}
              onEditDescriptionSuccess={onEditDescriptionSuccess}
              isVersion={isVersion}
              parentSize={parentSize}
            />
          </CardBody>
        )}
      </Card>
    </Row>
  );
}

export default Transaction;

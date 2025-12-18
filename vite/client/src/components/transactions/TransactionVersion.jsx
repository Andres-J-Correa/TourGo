import React, { useState } from "react";
import { Card, CardBody, CardHeader, Row } from "reactstrap";
import { formatCurrency } from "utils/currencyHelper";
import classNames from "classnames";
import dayjs from "dayjs";
import VersionDetails from "components/transactions/VersionDetails";
import TransactionStatusBadge from "components/transactions/TransactionStatusBadge";
import { TRANSACTION_STATUS_IDS } from "components/transactions/constants";

import "./Transaction.css";

function TransactionVersion({ txn }) {
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
          <span
            className={classNames({
              "text-danger": txn.changes?.transactionDate,
            })}>
            {dayjs(txn.transactionDate).format("DD/MMM/YYYY")}
          </span>
          {" - "}
          <span
            className={classNames({
              "text-danger": txn.changes?.paymentMethod,
            })}>
            {txn.paymentMethod?.name}
          </span>
          <TransactionStatusBadge
            statusId={txn?.statusId}
            className="float-md-end mx-2"
          />
        </CardHeader>

        {expanded && (
          <CardBody>
            <VersionDetails txn={txn} />
          </CardBody>
        )}
      </Card>
    </Row>
  );
}

export default TransactionVersion;

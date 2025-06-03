import React from "react";
import {
  TRANSACTION_STATUS_IDS,
  TRANSACTION_STATUSES,
} from "components/transactions/constants";
import classNames from "classnames";

function TransactionStatusBadge({ statusId, className, ...props }) {
  return (
    <span
      className={classNames("badge text-capitalize", className, {
        "bg-warning": statusId === TRANSACTION_STATUS_IDS.PENDING,
        "bg-success": statusId === TRANSACTION_STATUS_IDS.COMPLETED,
        "bg-danger": statusId === TRANSACTION_STATUS_IDS.FAILED,
        "bg-secondary": statusId === TRANSACTION_STATUS_IDS.REVERSED,
      })}
      {...props}>
      {TRANSACTION_STATUSES.find(
        (status) => Number(status.id) === Number(statusId)
      )?.name || "No definido"}
    </span>
  );
}

export default TransactionStatusBadge;

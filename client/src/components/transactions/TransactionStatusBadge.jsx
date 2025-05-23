import React from "react";
import {
  TRANSACTION_STATUS_DICT,
  transactionStatuses,
} from "components/transactions/constants";
import classNames from "classnames";

function TransactionStatusBadge({ statusId, className, ...props }) {
  return (
    <span
      className={classNames("badge", className, {
        "bg-warning": statusId === TRANSACTION_STATUS_DICT.PENDING,
        "bg-success": statusId === TRANSACTION_STATUS_DICT.COMPLETED,
        "bg-danger": statusId === TRANSACTION_STATUS_DICT.FAILED,
        "bg-info": statusId === TRANSACTION_STATUS_DICT.ADJUSTED,
        "bg-secondary": statusId === TRANSACTION_STATUS_DICT.REVERTED,
      })}
      {...props}>
      {transactionStatuses.find(
        (status) => Number(status.id) === Number(statusId)
      )?.name || "No definido"}
    </span>
  );
}

export default TransactionStatusBadge;

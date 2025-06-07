import React from "react";
import {
  TRANSACTION_STATUS_IDS,
  TRANSACTION_STATUS_BY_ID,
} from "components/transactions/constants";
import classNames from "classnames";
import {
  faHourglass,
  faCheckCircle,
  faTimesCircle,
  faArrowRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const statusIcons = {
  [TRANSACTION_STATUS_IDS.PENDING]: faHourglass,
  [TRANSACTION_STATUS_IDS.COMPLETED]: faCheckCircle,
  [TRANSACTION_STATUS_IDS.FAILED]: faTimesCircle,
  [TRANSACTION_STATUS_IDS.REVERSED]: faArrowRotateLeft,
};

function TransactionStatusBadge({ statusId, className, ...props }) {
  return (
    <span
      title={TRANSACTION_STATUS_BY_ID[statusId] || "Estado desconocido"}
      className={classNames("badge text-capitalize", className, {
        "bg-warning": statusId === TRANSACTION_STATUS_IDS.PENDING,
        "bg-success": statusId === TRANSACTION_STATUS_IDS.COMPLETED,
        "bg-danger": statusId === TRANSACTION_STATUS_IDS.FAILED,
        "bg-secondary": statusId === TRANSACTION_STATUS_IDS.REVERSED,
      })}
      {...props}>
      <FontAwesomeIcon icon={statusIcons[statusId] || faHourglass} />
    </span>
  );
}

export default TransactionStatusBadge;

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import TransactionCategoriesExplanation from "components/transactions/TransactionCategoriesExplanation";

import Popover from "components/commonUI/popover/Popover";

function TransactionCategoriesExplanationIcon() {
  return (
    <Popover
      content={<TransactionCategoriesExplanation />}
      placement="bottom"
      className="charge-types-explanation-popover">
      <div className="question-icon-container">
        <FontAwesomeIcon
          icon={faCircleQuestion}
          className="question-icon"
          size="lg"
          title="Explicación"
        />
      </div>
    </Popover>
  );
}

export default TransactionCategoriesExplanationIcon;

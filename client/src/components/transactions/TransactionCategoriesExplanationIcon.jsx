import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import TransactionCategoriesExplanation from "components/transactions/TransactionCategoriesExplanation";

import Popover from "components/commonUI/popover/Popover";
import { useLanguage } from "contexts/LanguageContext";

function TransactionCategoriesExplanationIcon() {
  const { t } = useLanguage();
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
          title={t("transactions.categoriesExplanation.iconTitle")}
        />
      </div>
    </Popover>
  );
}

export default TransactionCategoriesExplanationIcon;

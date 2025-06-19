import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import Popover from "components/commonUI/popover/Popover";
import { useLanguage } from "contexts/LanguageContext";

function FinancePartnersExplanationIcon() {
  const { t } = useLanguage();
  return (
    <Popover
      content={
        <div style={{ maxHeight: "50vh", overflow: "auto" }} className="p-3">
          <span>{t("transactions.financePartners.explanation")}</span>
        </div>
      }
      placement="bottom"
      className="charge-types-explanation-popover">
      <div className="question-icon-container">
        <FontAwesomeIcon
          icon={faCircleQuestion}
          className="question-icon"
          title={t("transactions.financePartners.explanationTitle")}
        />
      </div>
    </Popover>
  );
}

export default FinancePartnersExplanationIcon;

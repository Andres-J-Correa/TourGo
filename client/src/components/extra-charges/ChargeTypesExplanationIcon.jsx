import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import ChargeTypesExplanation from "components/extra-charges/ChargeTypesExplanation";
import "./ExtraChargesView.css";

import Popover from "components/commonUI/popover/Popover";

function ChargeTypesExplanationIcon() {
  return (
    <Popover
      content={<ChargeTypesExplanation />}
      placement="bottom"
      className="charge-types-explanation-popover">
      <div className="question-icon-container">
        <FontAwesomeIcon
          icon={faCircleQuestion}
          className="question-icon"
          size="sm"
          title="Explicación"
        />
      </div>
    </Popover>
  );
}

export default ChargeTypesExplanationIcon;

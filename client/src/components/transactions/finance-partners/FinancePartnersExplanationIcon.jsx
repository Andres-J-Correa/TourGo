import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import Popover from "components/commonUI/popover/Popover";

function FinancePartnersExplanationIcon() {
  return (
    <Popover
      content={
        <div style={{ maxHeight: "50vh", overflow: "auto" }} className="p-3">
          <span>
            Los socios financieros son entidades que proveen o tu provees con
            servicios o productos. Por ejemplo, agencias de viajes, proveedores
            de implementos de aseo, servicios de limpieza, etc.
          </span>
        </div>
      }
      placement="bottom"
      className="charge-types-explanation-popover">
      <div className="question-icon-container">
        <FontAwesomeIcon
          icon={faCircleQuestion}
          className="question-icon"
          title="Explicación"
        />
      </div>
    </Popover>
  );
}

export default FinancePartnersExplanationIcon;

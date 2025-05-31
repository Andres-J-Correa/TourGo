import React from "react";
import { EXTRA_CHARGE_TYPES } from "components/extra-charges/constants";

function ChargeTypesExplanation() {
  return (
    <div className="p-3">
      <h4>Tipos de cargos extra</h4>
      <ul>
        {EXTRA_CHARGE_TYPES.map((type) => (
          <li key={type.value}>
            <strong>{type.label}:</strong> {type.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChargeTypesExplanation;

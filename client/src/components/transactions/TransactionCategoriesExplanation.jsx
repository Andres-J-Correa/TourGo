import React from "react";
import { TRANSACTION_CATEGORIES } from "components/transactions/constants";

function TransactionCategoriesExplanation() {
  return (
    <div style={{ maxHeight: "50vh", overflow: "auto" }} className="p-3">
      <h4>Tipos de categorías</h4>
      <ul>
        {TRANSACTION_CATEGORIES.map((type) => (
          <li key={type.id}>
            <strong>{type.name}:</strong> {type.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionCategoriesExplanation;

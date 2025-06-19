import React from "react";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES,
} from "components/transactions/constants";
import { useLanguage } from "contexts/LanguageContext";

function TransactionCategoriesExplanation() {
  const { t } = useLanguage();
  // Group categories by typeId
  const grouped = TRANSACTION_CATEGORY_TYPES.map((type) => ({
    typeId: Number(type.id),
    typeName: t(type.name),
    categories: TRANSACTION_CATEGORIES.filter(
      (cat) => cat.typeId === Number(type.id)
    ),
  }));

  return (
    <div style={{ maxHeight: "50vh", overflow: "auto" }} className="p-3">
      <h4>{t("transactions.categoriesExplanation.title")}</h4>
      {grouped.map((group) => (
        <div key={group.typeId} className="mb-3">
          <h5 className="mt-3">{group.typeName}</h5>
          <ul>
            {group.categories.map((type) => (
              <li key={type.id}>
                <strong>{t(type.name)}:</strong> {t(type.description)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default TransactionCategoriesExplanation;

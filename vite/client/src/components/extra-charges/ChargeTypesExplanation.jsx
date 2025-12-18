import React from "react";
import { EXTRA_CHARGE_TYPES } from "components/extra-charges/constants";
import { useLanguage } from "contexts/LanguageContext";

function ChargeTypesExplanation() {
  const { t } = useLanguage();
  return (
    <div style={{ maxHeight: "50vh", overflow: "auto" }} className="p-3">
      <h4>{t("extraCharges.chargeTypesExplanation.title")}</h4>
      <ul>
        {EXTRA_CHARGE_TYPES.map((type) => (
          <li key={type.value}>
            <strong>{t(type.label)}:</strong> {t(type.description)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChargeTypesExplanation;

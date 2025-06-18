import React from "react";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  EXTRA_CHARGE_TYPES_BY_ID,
  EXTRA_CHARGE_TYPE_IDS,
  formatExtraChargeAmount,
} from "components/extra-charges/constants";
import { useLanguage } from "contexts/LanguageContext";

const ExtraChargeCard = ({
  charge,
  onClick,
  isSelected = false,
  showType = true,
  typeIdOverride,
  amountOverride,
}) => {
  const { t } = useLanguage();
  const typeId =
    typeIdOverride !== undefined
      ? typeIdOverride
      : charge.type?.id ?? EXTRA_CHARGE_TYPE_IDS.CUSTOM;
  const typeLabel =
    EXTRA_CHARGE_TYPES_BY_ID[typeId] || t("booking.extraChargeCard.na");
  const amount = amountOverride !== undefined ? amountOverride : charge.amount;

  return (
    <Card
      onClick={onClick}
      className={`h-100 cursor-pointer extra-charge-card ${
        isSelected ? "border-success bg-success-subtle shadow-success" : ""
      }`}
      type="button">
      {isSelected && (
        <FontAwesomeIcon
          icon={faCheckCircle}
          className="text-success position-absolute top-0 end-0"
          size="lg"
        />
      )}
      <CardBody className="text-center p-2 align-content-center">
        <CardTitle tag="h6" className="mb-2">
          {charge.name}
        </CardTitle>
        {showType && (
          <CardText className="mb-1 fs-7">
            <strong>{t("booking.extraChargeCard.type")}</strong> {typeLabel}
          </CardText>
        )}
        <CardText className="mb-0 fs-7">
          <strong>{t("booking.extraChargeCard.amount")}</strong>{" "}
          {formatExtraChargeAmount(amount, typeId)}
        </CardText>
      </CardBody>
    </Card>
  );
};

export default ExtraChargeCard;

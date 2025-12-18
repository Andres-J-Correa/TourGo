import * as Yup from "yup";
import { formatCurrency } from "utils/currencyHelper";
import { useLanguage } from "contexts/LanguageContext";

// Use translation keys for labels and descriptions
export const EXTRA_CHARGE_TYPES = [
  {
    label: "extraCharges.types.percentage",
    value: 1,
    description: "extraCharges.types.percentageDesc",
  },
  {
    label: "extraCharges.types.daily",
    value: 2,
    description: "extraCharges.types.dailyDesc",
  },
  {
    label: "extraCharges.types.perRoom",
    value: 3,
    description: "extraCharges.types.perRoomDesc",
  },
  {
    label: "extraCharges.types.general",
    value: 4,
    description: "extraCharges.types.generalDesc",
  },
  {
    label: "extraCharges.types.perPerson",
    value: 5,
    description: "extraCharges.types.perPersonDesc",
  },
  {
    label: "extraCharges.types.custom",
    value: 6,
    description: "extraCharges.types.customDesc",
  },
];

export const EXTRA_CHARGE_TYPES_BY_ID = {
  1: "extraCharges.types.percentage",
  2: "extraCharges.types.daily",
  3: "extraCharges.types.perRoom",
  4: "extraCharges.types.general",
  5: "extraCharges.types.perPerson",
  6: "extraCharges.types.custom",
};

export const EXTRA_CHARGE_TYPE_IDS = {
  PERCENTAGE: 1,
  DAILY: 2,
  PER_ROOM: 3,
  GENERAL: 4,
  PER_PERSON: 5,
  CUSTOM: 6,
};

export const GENERAL_CHARGE_TYPES = [
  EXTRA_CHARGE_TYPE_IDS.GENERAL,
  EXTRA_CHARGE_TYPE_IDS.PER_PERSON,
  EXTRA_CHARGE_TYPE_IDS.CUSTOM,
];

export const formatExtraChargeAmount = (amount, typeId) => {
  if (typeId === EXTRA_CHARGE_TYPE_IDS.PERCENTAGE)
    return `${(amount * 100).toFixed(0)}%`;
  return formatCurrency(amount, "COP");
};

export const useAddValidationSchema = () => {
  const { t } = useLanguage();

  return Yup.object().shape({
    name: Yup.string()
      .min(2, (params) => t("extraCharges.validation.nameMin", params))
      .max(100, (params) => t("extraCharges.validation.nameMax", params))
      .required((params) => t("extraCharges.validation.nameRequired", params)),
    typeId: Yup.string()
      .required((params) => t("extraCharges.validation.typeRequired", params))
      .oneOf(
        EXTRA_CHARGE_TYPES.map((type) => type.value.toString()),
        t("extraCharges.validation.typeInvalid")
      ),
    amount: Yup.number()
      .min(0, (params) => t("extraCharges.validation.amountMin", params))
      .required((params) =>
        t("extraCharges.validation.amountRequired", params)
      ),
  });
};

import * as Yup from "yup";
import { formatCurrency } from "utils/currencyHelper";

export const EXTRA_CHARGE_TYPES = [
  {
    label: "Porcentaje",
    value: 1,
    description: "Se aplica el porcentaje a los subtotales de cada habitación",
  },
  {
    label: "Diario",
    value: 2,
    description: "Se aplica un monto fijo por cada noche de cada habitación",
  },
  {
    label: "Por habitación",
    value: 3,
    description: "Se aplica un monto fijo por cada habitación",
  },
  {
    label: "General",
    value: 4,
    description: "Se aplica un monto fijo a la reserva completa",
  },
  {
    label: "Por persona",
    value: 5,
    description: "Se aplica un monto fijo por cada persona en la reserva",
  },
  {
    label: "Personalizado",
    value: 6,
    description: "Se aplica un monto personalizado al total de la reserva",
  },
];

export const EXTRA_CHARGE_TYPES_BY_ID = {
  1: "Porcentaje",
  2: "Diario",
  3: "Por habitación",
  4: "General",
  5: "Por persona",
  6: "Personalizado",
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

export const addValidationSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es obligatorio").max(100),
  typeId: Yup.number().required("El tipo es obligatorio"),
  amount: Yup.number()
    .typeError("El monto debe ser un número válido")
    .required("El monto es obligatorio")
    .min(0.001, "El monto mínimo es 0.001")
    .max(9999999.999, "El monto máximo es 9,999,999.999")
    .test("decimal-precision", "Máximo 3 decimales permitidos", (value) =>
      /^\d+(\.\d{1,3})?$/.test(value.toString())
    ),
});

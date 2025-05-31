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
    label: "General",
    value: 3,
    description: "Se aplica un monto fijo por cada habitación",
  },
];

export const EXTRA_CHARGE_TYPES_BY_ID = {
  1: "Porcentaje",
  2: "Diario",
  3: "General",
};

export const EXTRA_CHARGE_IDS = {
  PERCENTAGE: 1,
  DAILY: 2,
  GENERAL: 3,
};

export const formatExtraChargeAmount = (amount, typeId) => {
  if (typeId === EXTRA_CHARGE_IDS.PERCENTAGE)
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

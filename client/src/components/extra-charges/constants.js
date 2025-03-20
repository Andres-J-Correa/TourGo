import * as Yup from "yup";

export const EXTRA_CHARGE_TYPES = [
  { label: "Porcentaje", value: 1 },
  { label: "Diario", value: 2 },
  { label: "General", value: 3 },
];

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

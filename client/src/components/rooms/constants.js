import * as Yup from "yup";

export const addValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  capacity: Yup.number()
    .typeError("La capacidad debe ser un número válido")
    .integer("El monto debe ser un número entero")
    .required("La capacidad es obligatoria")
    .min(1, "La capacidad mínima es 1")
    .max(50, "La capacidad máxima es 50"),

  description: Yup.string()
    .required("La descripción es obligatoria")
    .max(100, "Máximo 100 caracteres"),
});

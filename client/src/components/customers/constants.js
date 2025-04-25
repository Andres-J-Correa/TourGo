import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";

export const customerSchema = Yup.object().shape({
  documentNumber: Yup.string()
    .min(2, "Documento muy corto")
    .max(100, "Documento muy largo")
    .required("Documento requerido"),
  firstName: Yup.string()
    .min(2, "El nombre debe tener mínimo 2 caracteres.")
    .max(50, "El nombre debe tener máximo 50 caracteres.")
    .required("El nombre es obligatorio."),
  lastName: Yup.string()
    .min(2, "El apellido debe tener mínimo 2 caracteres.")
    .max(50, "El apellido debe tener máximo 50 caracteres.")
    .required("El apellido es obligatorio."),
  email: Yup.string()
    .required("El correo electrónico es obligatorio.")
    .email("Debe ingresar un correo electrónico válido.")
    .max(100, "El correo debe tener máximo 100 caracteres."),
  phone: Yup.string()
    .required("El teléfono es obligatorio.")
    .test(
      "is-valid-phone",
      "Debe ingresar un número de teléfono válido.",
      (value) => isValidPhoneNumber(value)
    ),
});

import * as Yup from "yup";

export const addValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  phone: Yup.string()
    .required("El teléfono es obligatorio")
    .max(20, "Máximo 20 caracteres"),
  address: Yup.string()
    .required("La dirección es obligatoria")
    .max(200, "Máximo 200 caracteres"),
  email: Yup.string()
    .required("El correo electrónico es obligatorio")
    .email("Formato de correo inválido")
    .max(100),
  taxId: Yup.string().required("El ID Fiscal es obligatorio").max(100),
});

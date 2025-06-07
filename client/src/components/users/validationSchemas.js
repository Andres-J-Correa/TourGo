import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";

export const userSignInSchema = Yup.object().shape({
  email: Yup.string()
    .email("Debe ingresar un correo electrónico válido.")
    .max(100, "El correo debe tener máximo 100 caracteres.")
    .required("El correo electrónico es obligatorio."),
  password: Yup.string().required("La contraseña es obligatoria."),
});

export const userSignUpSchema = Yup.object().shape({
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
  phone: Yup.string().test(
    "is-valid-phone",
    "Debe ingresar un número de teléfono válido.",
    (value) => (value ? isValidPhoneNumber(value) : true)
  ),
  password: Yup.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres.")
    .max(50, "La contraseña debe tener máximo 50 caracteres.")
    .matches(
      /[a-z]/,
      "La contraseña debe contener al menos una letra minúscula."
    )
    .matches(
      /[A-Z]/,
      "La contraseña debe contener al menos una letra mayúscula."
    )
    .matches(/\d/, "La contraseña debe contener al menos un número.")
    .matches(
      /[^A-Za-z\d]/,
      "La contraseña debe contener al menos un carácter especial."
    )
    .required("La contraseña es obligatoria."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas deben coincidir.")
    .required("La confirmación de la contraseña es obligatoria."),
});

export const userUpdateSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "El nombre debe tener mínimo 2 caracteres.")
    .max(50, "El nombre debe tener máximo 50 caracteres.")
    .required("El nombre es obligatorio."),
  lastName: Yup.string()
    .min(2, "El apellido debe tener mínimo 2 caracteres.")
    .max(50, "El apellido debe tener máximo 50 caracteres.")
    .required("El apellido es obligatorio."),
  phone: Yup.string().test(
    "is-valid-phone",
    "Debe ingresar un número de teléfono válido.",
    (value) => (value ? isValidPhoneNumber(value) : true)
  ),
});

export const userPasswordForgotSchema = Yup.object().shape({
  email: Yup.string()
    .email("Debe ingresar un correo electrónico válido.")
    .max(100, "El correo debe tener máximo 100 caracteres.")
    .required("El correo electrónico es obligatorio."),
});

export const userPasswordChangeSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres.")
    .max(50, "La contraseña debe tener máximo 50 caracteres.")
    .matches(
      /[a-z]/,
      "La contraseña debe contener al menos una letra minúscula."
    )
    .matches(
      /[A-Z]/,
      "La contraseña debe contener al menos una letra mayúscula."
    )
    .matches(/\d/, "La contraseña debe contener al menos un número.")
    .matches(
      /[^A-Za-z\d]/,
      "La contraseña debe contener al menos un carácter especial."
    )
    .required("La contraseña es obligatoria."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas deben coincidir.")
    .required("La confirmación de la contraseña es obligatoria."),
});

export const userPasswordResetSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres.")
    .max(50, "La contraseña debe tener máximo 50 caracteres.")
    .matches(
      /[a-z]/,
      "La contraseña debe contener al menos una letra minúscula."
    )
    .matches(
      /[A-Z]/,
      "La contraseña debe contener al menos una letra mayúscula."
    )
    .matches(/\d/, "La contraseña debe contener al menos un número.")
    .matches(
      /[^A-Za-z\d]/,
      "La contraseña debe contener al menos un carácter especial."
    )
    .required("La contraseña es obligatoria."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas deben coincidir.")
    .required("La confirmación de la contraseña es obligatoria."),
  token: Yup.string().required("El token es obligatorio."),
});

import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useLanguage } from "contexts/LanguageContext";

export function useUserSignInSchema() {
  const { t } = useLanguage();
  return Yup.object().shape({
    email: Yup.string()
      .email(t("yup.email", { label: t("users.validation.email") }))
      .max(
        100,
        t("yup.maxLength", { label: t("users.validation.email"), max: 100 })
      )
      .required(t("yup.required", { label: t("users.validation.email") })),
    password: Yup.string().required(
      t("yup.required", { label: t("users.validation.password") })
    ),
  });
}

export function useUserSignUpSchema() {
  const { t } = useLanguage();
  return Yup.object().shape({
    firstName: Yup.string()
      .min(
        2,
        t("yup.minLength", { label: t("users.validation.firstName"), min: 2 })
      )
      .max(
        50,
        t("yup.maxLength", { label: t("users.validation.firstName"), max: 50 })
      )
      .required(t("yup.required", { label: t("users.validation.firstName") })),
    lastName: Yup.string()
      .min(
        2,
        t("yup.minLength", { label: t("users.validation.lastName"), min: 2 })
      )
      .max(
        50,
        t("yup.maxLength", { label: t("users.validation.lastName"), max: 50 })
      )
      .required(t("yup.required", { label: t("users.validation.lastName") })),
    email: Yup.string()
      .required(t("yup.required", { label: t("users.validation.email") }))
      .email(t("yup.email", { label: t("users.validation.email") }))
      .max(
        100,
        t("yup.maxLength", { label: t("users.validation.email"), max: 100 })
      ),
    phone: Yup.string().test(
      "is-valid-phone",
      t("yup.phone", { label: t("users.validation.phone") }),
      (value) => (value ? isValidPhoneNumber(value) : true)
    ),
    password: Yup.string()
      .min(
        8,
        t("yup.minLength", { label: t("users.validation.password"), min: 8 })
      )
      .max(
        50,
        t("yup.maxLength", { label: t("users.validation.password"), max: 50 })
      )
      .matches(/[a-z]/, t("yup.password.lowercase"))
      .matches(/[A-Z]/, t("yup.password.uppercase"))
      .matches(/\d/, t("yup.password.number"))
      .matches(/[^A-Za-z\d]/, t("yup.password.special"))
      .required(t("yup.required", { label: t("users.validation.password") })),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("yup.confirmPassword"))
      .required(t("users.validation.confirmPasswordRequired")),
  });
}

export function useUserUpdateSchema() {
  const { t } = useLanguage();
  return Yup.object().shape({
    firstName: Yup.string()
      .min(
        2,
        t("yup.minLength", { label: t("users.validation.firstName"), min: 2 })
      )
      .max(
        50,
        t("yup.maxLength", { label: t("users.validation.firstName"), max: 50 })
      )
      .required(t("yup.required", { label: t("users.validation.firstName") })),
    lastName: Yup.string()
      .min(
        2,
        t("yup.minLength", { label: t("users.validation.lastName"), min: 2 })
      )
      .max(
        50,
        t("yup.maxLength", { label: t("users.validation.lastName"), max: 50 })
      )
      .required(t("yup.required", { label: t("users.validation.lastName") })),
    phone: Yup.string().test(
      "is-valid-phone",
      t("yup.phone", { label: t("users.validation.phone") }),
      (value) => (value ? isValidPhoneNumber(value) : true)
    ),
  });
}

export function useUserPasswordForgotSchema() {
  const { t } = useLanguage();
  return Yup.object().shape({
    email: Yup.string()
      .email(t("yup.email", { label: t("users.validation.email") }))
      .max(
        100,
        t("yup.maxLength", { label: t("users.validation.email"), max: 100 })
      )
      .required(t("yup.required", { label: t("users.validation.email") })),
  });
}

export function useUserPasswordChangeSchema() {
  const { t } = useLanguage();
  return Yup.object().shape({
    oldPassword: Yup.string()
      .min(
        8,
        t("yup.minLength", {
          label: t("users.validation.oldPassword"),
          min: 8,
        })
      )
      .max(
        50,
        t("yup.maxLength", {
          label: t("users.validation.oldPassword"),
          max: 50,
        })
      )
      .matches(/[a-z]/, t("yup.password.lowercase"))
      .matches(/[A-Z]/, t("yup.password.uppercase"))
      .matches(/\d/, t("yup.password.number"))
      .matches(/[^A-Za-z\d]/, t("yup.password.special"))
      .required(t("users.validation.oldPasswordRequired")),
    password: Yup.string()
      .min(
        8,
        t("yup.minLength", {
          label: t("users.validation.newPassword"),
          min: 8,
        })
      )
      .max(
        50,
        t("yup.maxLength", {
          label: t("users.validation.newPassword"),
          max: 50,
        })
      )
      .matches(/[a-z]/, t("yup.password.lowercase"))
      .matches(/[A-Z]/, t("yup.password.uppercase"))
      .matches(/\d/, t("yup.password.number"))
      .matches(/[^A-Za-z\d]/, t("yup.password.special"))
      .required(t("users.validation.newPasswordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("yup.confirmPassword"))
      .required(t("users.validation.confirmPasswordRequired")),
  });
}

export function useUserPasswordResetSchema() {
  const { t } = useLanguage();
  return Yup.object().shape({
    password: Yup.string()
      .min(
        8,
        t("yup.minLength", {
          label: t("users.validation.newPassword"),
          min: 8,
        })
      )
      .max(
        50,
        t("yup.maxLength", {
          label: t("users.validation.newPassword"),
          max: 50,
        })
      )
      .matches(/[a-z]/, t("yup.password.lowercase"))
      .matches(/[A-Z]/, t("yup.password.uppercase"))
      .matches(/\d/, t("yup.password.number"))
      .matches(/[^A-Za-z\d]/, t("yup.password.special"))
      .required(t("users.validation.newPasswordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("yup.confirmPassword"))
      .required(t("users.validation.confirmPasswordRequired")),
    token: Yup.string().required(t("users.validation.tokenRequired")),
  });
}

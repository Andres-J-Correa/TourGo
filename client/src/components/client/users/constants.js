import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useLanguage } from "contexts/LanguageContext";

export const useUserSignInSchema = () => {
  const { t } = useLanguage();

  return Yup.object().shape({
    email: Yup.string()
      .email(t("yup.email"))
      .max(100, t("yup.maxLength", { max: 100 }))
      .required(t("yup.required")),
    password: Yup.string().required(t("yup.required")),
  });
};

export const useUserSignUpSchema = () => {
  const { t } = useLanguage();

  return Yup.object().shape({
    firstName: Yup.string()
      .min(2, t("yup.minLength", { min: 2 }))
      .max(50, t("yup.maxLength", { max: 50 }))
      .required(t("yup.required")),
    lastName: Yup.string()
      .min(2, t("yup.minLength", { min: 2 }))
      .max(50, t("yup.maxLength", { max: 50 }))
      .required(t("yup.required")),
    email: Yup.string()
      .required(t("yup.required"))
      .email(t("yup.email"))
      .max(100, t("yup.maxLength", { max: 100 })),
    phone: Yup.string()
      .required(t("yup.required"))
      .test("is-valid-phone", t("yup.phone"), (value) =>
        isValidPhoneNumber(value)
      ),
    password: Yup.string()
      .min(8, t("yup.minLength", { min: 8 }))
      .max(50, t("yup.maxLength", { max: 50 }))
      .matches(/[a-z]/, t("yup.password.lowercase"))
      .matches(/[A-Z]/, t("yup.password.uppercase"))
      .matches(/\d/, t("yup.password.number"))
      .matches(/[^A-Za-z\d]/, t("yup.password.special"))
      .required(t("yup.required")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("yup.confirmPassword"))
      .required(t("yup.required")),
  });
};

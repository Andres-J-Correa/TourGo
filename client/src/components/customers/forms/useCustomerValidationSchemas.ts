import * as Yup from "yup";
import { useLanguage } from "contexts/LanguageContext";
import { isValidPhoneNumber } from "react-phone-number-input";

export default function useCustomerValidationSchemas() {
  const { t } = useLanguage();

  const customerAddEditSchema = Yup.object().shape({
    documentNumber: Yup.string()
      .min(2, (params) => t("booking.validation.documentShort", params))
      .max(100, (params) => t("booking.validation.documentLong", params))
      .required((params) => t("booking.validation.documentRequired", params)),
    firstName: Yup.string()
      .min(2, (params) => t("booking.validation.firstNameMin", params))
      .max(50, (params) => t("booking.validation.firstNameMax", params))
      .required(t("booking.validation.firstNameRequired")),
    lastName: Yup.string()
      .min(2, (params) => t("booking.validation.lastNameMin", params))
      .max(50, (params) => t("booking.validation.lastNameMax", params))
      .required(t("booking.validation.lastNameRequired")),
    email: Yup.string()
      .email(t("booking.validation.emailValid"))
      .max(100, (params) => t("booking.validation.emailMax", params)),
    phone: Yup.string()
      .required(t("booking.validation.phoneRequired"))
      .test(
        "is-valid-phone",
        () => t("booking.validation.phoneValid"),
        (value) => isValidPhoneNumber(value)
      ),
  });

  const searchCustomerSchema = Yup.object().shape({
    documentNumber: Yup.string()
      .min(2, (params) => t("booking.validation.documentShort", params))
      .max(100, (params) => t("booking.validation.documentLong", params))
      .required(t("booking.validation.documentRequired")),
  });

  return {
    customerAddEditSchema,
    searchCustomerSchema,
  };
}

import * as Yup from "yup";
import { useLanguage } from "contexts/LanguageContext"; // added

export const useAddValidationSchema = () => {
  const { t } = useLanguage();
  return Yup.object().shape({
    name: Yup.string()
      .required(t("hotels.validation.nameRequired"))
      .max(100, t("hotels.validation.nameMax")),
    phone: Yup.string()
      .required(t("hotels.validation.phoneRequired"))
      .max(20, t("hotels.validation.phoneMax")),
    address: Yup.string()
      .required(t("hotels.validation.addressRequired"))
      .max(200, t("hotels.validation.addressMax")),
    email: Yup.string()
      .required(t("hotels.validation.emailRequired"))
      .email(t("hotels.validation.emailInvalid"))
      .max(100, t("hotels.validation.emailMax")),
    taxId: Yup.string()
      .required(t("hotels.validation.taxIdRequired"))
      .max(100, t("hotels.validation.taxIdMax")),
  });
};

export const HOTEL_ROLES_IDS = {
  OWNER: 1,
  ADMIN: 2,
  RECEPTIONIST: 3,
};

export const HOTEL_ROLES_BY_ID = {
  1: "hotels.roles.owner",
  2: "hotels.roles.admin",
  3: "hotels.roles.receptionist",
};

export const HOTEL_ROLES = [
  {
    id: 1,
    name: "hotels.roles.owner",
  },
  {
    id: 2,
    name: "hotels.roles.admin",
  },
  {
    id: 3,
    name: "hotels.roles.receptionist",
  },
];

export const HOTEL_RESOURCES_BY_ID = {
  1: "hotels.resources.hotel",
  2: "hotels.resources.rooms",
  3: "hotels.resources.bookings",
  4: "hotels.resources.transactions",
  5: "hotels.resources.customers",
  6: "hotels.resources.extraCharges",
  7: "hotels.resources.invoices",
  8: "hotels.resources.transactionSubcategories",
  9: "hotels.resources.paymentMethods",
  10: "hotels.resources.bookingProviders",
  11: "hotels.resources.financePartners",
  12: "hotels.resources.staffInvites",
  13: "hotels.resources.financialReports",
};

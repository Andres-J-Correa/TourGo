import * as Yup from "yup";
import { useLanguage } from "contexts/LanguageContext";

export const TRANSACTION_CATEGORY_TYPES_BY_ID = {
  1: "transactions.categoryTypes.income",
  2: "transactions.categoryTypes.expense",
};

export const TRANSACTION_CATEGORY_TYPES_IDS = {
  INCOME: 1,
  EXPENSE: 2,
};

export const TRANSACTION_CATEGORY_TYPES = [
  { id: 1, name: "transactions.categoryTypes.income" },
  { id: 2, name: "transactions.categoryTypes.expense" },
];

export const TRANSACTION_CATEGORIES_BY_ID = {
  1: "transactions.categories.roomIncome",
  2: "transactions.categories.roomExpense",
  3: "transactions.categories.foodBeverageIncome",
  4: "transactions.categories.additionalServicesIncome",
  5: "transactions.categories.otherIncome",
  6: "transactions.categories.foodBeverageExpense",
  7: "transactions.categories.additionalServicesExpense",
  8: "transactions.categories.repairsMaintenanceExpense",
  9: "transactions.categories.adminExpense",
  10: "transactions.categories.marketingSalesExpense",
  11: "transactions.categories.staffExpense",
  12: "transactions.categories.utilitiesExpense",
  13: "transactions.categories.otherExpense",
  14: "transactions.categories.nonOperatingLeaseExpense",
};

export const TRANSACTION_CATEGORIES = [
  {
    id: 1,
    name: "transactions.categories.roomIncome",
    description: "transactions.categories.roomIncomeDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.INCOME,
  },
  {
    id: 3,
    name: "transactions.categories.foodBeverageIncome",
    description: "transactions.categories.foodBeverageIncomeDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.INCOME,
  },
  {
    id: 4,
    name: "transactions.categories.additionalServicesIncome",
    description: "transactions.categories.additionalServicesIncomeDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.INCOME,
  },
  {
    id: 5,
    name: "transactions.categories.otherIncome",
    description: "transactions.categories.otherIncomeDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.INCOME,
  },
  {
    id: 2,
    name: "transactions.categories.roomExpense",
    description: "transactions.categories.roomExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 11,
    name: "transactions.categories.staffExpense",
    description: "transactions.categories.staffExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 12,
    name: "transactions.categories.utilitiesExpense",
    description: "transactions.categories.utilitiesExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 8,
    name: "transactions.categories.repairsMaintenanceExpense",
    description: "transactions.categories.repairsMaintenanceExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 14,
    name: "transactions.categories.nonOperatingLeaseExpense",
    description: "transactions.categories.nonOperatingLeaseExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 6,
    name: "transactions.categories.foodBeverageExpense",
    description: "transactions.categories.foodBeverageExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 7,
    name: "transactions.categories.additionalServicesExpense",
    description: "transactions.categories.additionalServicesExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 9,
    name: "transactions.categories.adminExpense",
    description: "transactions.categories.adminExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 10,
    name: "transactions.categories.marketingSalesExpense",
    description: "transactions.categories.marketingSalesExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
  {
    id: 13,
    name: "transactions.categories.otherExpense",
    description: "transactions.categories.otherExpenseDesc",
    typeId: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
  },
];

export const TRANSACTION_STATUSES = [
  { id: 1, name: "transactions.statuses.pending" },
  { id: 2, name: "transactions.statuses.completed" },
  { id: 3, name: "transactions.statuses.failed" },
  { id: 5, name: "transactions.statuses.reversed" },
];

export const TRANSACTION_STATUS_IDS = {
  PENDING: 1,
  COMPLETED: 2,
  FAILED: 3,
  REVERSED: 5,
};

export const TRANSACTION_STATUS_BY_ID = {
  1: "transactions.statuses.pending",
  2: "transactions.statuses.completed",
  3: "transactions.statuses.failed",
  5: "transactions.statuses.reversed",
};

export const useTransactionAddValidationSchema = () => {
  const { t } = useLanguage();
  return Yup.object({
    amount: Yup.number().required(t("transactions.validation.amountRequired")),
    transactionDate: Yup.date().required(
      t("transactions.validation.transactionDateRequired")
    ),
    paymentMethodId: Yup.number().required(
      t("transactions.validation.paymentMethodRequired")
    ),
    categoryId: Yup.number().required(
      t("transactions.validation.categoryRequired")
    ),
    subcategoryId: Yup.number().nullable(),
    referenceNumber: Yup.string()
      .min(2, t("transactions.validation.referenceNumberMin"))
      .max(100, t("transactions.validation.referenceNumberMax"))
      .nullable(),
    description: Yup.string()
      .min(2, t("transactions.validation.descriptionMin"))
      .max(500, t("transactions.validation.descriptionMax")),
    financePartnerId: Yup.number().nullable(),
  });
};

export const useTransactionUpdateValidationSchema = () => {
  const { t } = useLanguage();
  return Yup.object({
    transactionDate: Yup.date().required(
      t("transactions.validation.transactionDateRequired")
    ),
    paymentMethodId: Yup.number().required(
      t("transactions.validation.paymentMethodRequired")
    ),
    categoryId: Yup.number().required(
      t("transactions.validation.categoryRequired")
    ),
    subcategoryId: Yup.number().nullable(),
    referenceNumber: Yup.string()
      .min(2, t("transactions.validation.referenceNumberMin"))
      .max(100, t("transactions.validation.referenceNumberMax"))
      .nullable(),
    description: Yup.string()
      .min(2, t("transactions.validation.descriptionMin"))
      .max(500, t("transactions.validation.descriptionMax")),
    financePartnerId: Yup.number().nullable(),
  });
};

export const sanitizeNewTransaction = (
  transaction,
  user,
  paymentMethods,
  transactionSubcategories,
  financePartners
) => ({
  ...transaction,
  statusId: Number(transaction.statusId),
  categoryId: Number(transaction.categoryId),
  paymentMethod: {
    id: Number(transaction.paymentMethodId),
    name: paymentMethods.find(
      (pm) => Number(pm.id) === Number(transaction.paymentMethodId)
    )?.name,
  },
  ...(transaction.subcategoryId
    ? {
        subcategory: {
          id: Number(transaction.subcategoryId),
          name: transactionSubcategories.find(
            (s) => Number(s.id) === Number(transaction.subcategoryId)
          )?.name,
        },
      }
    : {}),
  ...(transaction.financePartnerId
    ? {
        financePartner: {
          id: Number(transaction.financePartnerId),
          name: financePartners.find(
            (fp) => Number(fp.id) === Number(transaction.financePartnerId)
          )?.name,
        },
      }
    : {}),
  createdBy: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
  },
  approvedBy: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
  },
  modifiedBy: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
  },
  dateCreated: new Date(),
  dateModified: new Date(),
});

export const sanitizeUpdatedTransaction = (
  transaction,
  user,
  paymentMethods,
  transactionSubcategories,
  financePartners
) => ({
  ...transaction,
  categoryId: Number(transaction.categoryId),
  paymentMethod: {
    id: Number(transaction.paymentMethodId),
    name: paymentMethods.find(
      (pm) => Number(pm.id) === Number(transaction.paymentMethodId)
    )?.name,
  },
  subcategory: transaction.subcategoryId
    ? {
        id: Number(transaction.subcategoryId),
        name: transactionSubcategories.find(
          (s) => Number(s.id) === Number(transaction.subcategoryId)
        )?.name,
      }
    : null,
  financePartner: transaction.financePartnerId
    ? {
        id: Number(transaction.financePartnerId),
        name: financePartners.find(
          (fp) => Number(fp.id) === Number(transaction.financePartnerId)
        )?.name,
      }
    : null,
  modifiedBy: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
  },
  dateModified: new Date(),
});

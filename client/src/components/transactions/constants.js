import * as Yup from "yup";

export const transactionCategories = [
  { id: 1, name: "Ingreso" },
  { id: 2, name: "Gasto" },
  { id: 3, name: "Ajuste" },
];

export const TRANSACTION_CATEGORIES_BY_ID = {
  1: "Ingreso",
  2: "Gasto",
  3: "Ajuste",
};

export const TRANSACTION_STATUSES = [
  { id: 1, name: "Pendiente" },
  { id: 2, name: "Completado" },
  { id: 3, name: "Fallído" },
  { id: 5, name: "Revertido" },
];

export const TRANSACTION_STATUS_IDS = {
  PENDING: 1,
  COMPLETED: 2,
  FAILED: 3,
  REVERSED: 5,
};

export const TRANSACTION_STATUS_BY_ID = {
  1: "Pendiente",
  2: "Completado",
  3: "Fallído",
  5: "Revertido",
};

export const transactionAddValidationSchema = Yup.object({
  amount: Yup.number().required("El monto es requerido"),
  transactionDate: Yup.date().required(
    "La fecha de la transacción es requerida"
  ),
  paymentMethodId: Yup.number().required("El método de pago es requerido"),
  categoryId: Yup.number().required("La categoría es requerida"),
  subcategoryId: Yup.number().nullable(),
  referenceNumber: Yup.string()
    .min(2, "El número de referencia debe tener al menos 2 caracteres")
    .max(100, "El número de referencia no puede exceder los 100 caracteres")
    .nullable(),
  description: Yup.string().min(2).max(500),
});

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
  subcategory: {
    id: Number(transaction.subcategoryId),
    name: transactionSubcategories.find(
      (s) => Number(s.id) === Number(transaction.subcategoryId)
    )?.name,
  },
  financePartner: {
    id: Number(transaction.financePartnerId),
    name: financePartners.find(
      (fp) => Number(fp.id) === Number(transaction.financePartnerId)
    )?.name,
  },
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
});

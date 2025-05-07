import * as Yup from "yup";

export const transactionCategories = [
  { id: 1, name: "Ingreso" },
  { id: 2, name: "Gasto" },
  { id: 3, name: "Ajuste" },
];

export const transactionStatuses = [
  { id: 1, name: "Pendiente" },
  { id: 2, name: "Completado" },
  { id: 3, name: "Fallído" },
  { id: 4, name: "Ajustado" },
  { id: 5, name: "Revertido" },
];

export const transactionAddValidationSchema = Yup.object({
  amount: Yup.number().required("El monto es requerido"),
  transactionDate: Yup.date().required(
    "La fecha de la transacción es requerida"
  ),
  paymentMethodId: Yup.number().required("El método de pago es requerido"),
  categoryId: Yup.number().required("La categoría es requerida"),
  subcategoryId: Yup.number().nullable(),
  referenceNumber: Yup.string()
    .min(2)
    .required("El número de referencia es requerido"),
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
  paymentMethod: {
    id: Number(transaction.paymentMethodId),
    name: paymentMethods.find(
      (pm) => Number(pm.id) === Number(transaction.paymentMethodId)
    )?.name,
  },
  status: {
    id: Number(transaction.statusId),
    name: transactionStatuses.find(
      (s) => Number(s.id) === Number(transaction.statusId)
    )?.name,
  },
  category: {
    id: Number(transaction.categoryId),
    name: transactionCategories.find(
      (c) => Number(c.id) === Number(transaction.categoryId)
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

import * as Yup from "yup";

export const TRANSACTION_CATEGORIES = [
  {
    id: 1,
    name: "Ingresos por Habitaciones",
    description:
      "Ingresos por venta de habitaciones: reservas individuales, grupales o largas estancias.",
  },
  {
    id: 3,
    name: "Ingresos por Alimentos y Bebidas",
    description:
      "Ingresos de restaurantes, bares, servicio a la habitación y banquetes.",
  },
  {
    id: 4,
    name: "Ingresos por Servicios Complementarios",
    description:
      "Ingresos por servicios adicionales: spa, estacionamiento, tours o tiendas.",
  },
  {
    id: 5,
    name: "Otros Ingresos",
    description:
      "Ingresos diversos no relacionados con departamentos principales.",
  },
  {
    id: 2,
    name: "Gastos por Habitaciones",
    description:
      "Costos de operación del departamento de habitaciones: suministros de limpieza, compra sabanas etc.",
  },
  {
    id: 6,
    name: "Gastos por Alimentos y Bebidas",
    description: "Costos de operación de restaurantes, bares y banquetes.",
  },
  {
    id: 7,
    name: "Gastos por Servicios Complementarios",
    description: "Costos de operación de spa, estacionamiento o tours.",
  },
  {
    id: 8,
    name: "Gastos por Reparaciones y Mantenimiento",
    description: "Costos de reparaciones y mantenimiento de la propiedad.",
  },
  {
    id: 9,
    name: "Gastos Administrativos",
    description:
      "Costos generales de administración y servicios profesionales.",
  },
  {
    id: 10,
    name: "Gastos de Marketing y Ventas",
    description: "Costos de promoción, publicidad y comisiones de ventas.",
  },
  {
    id: 11,
    name: "Gastos de Personal",
    description: "Costos de salarios, beneficios y capacitación del personal.",
  },
  {
    id: 12,
    name: "Gastos por Servicios Públicos",
    description: "Costos de electricidad, agua, gas y gestión de residuos.",
  },
  {
    id: 13,
    name: "Otros Gastos",
    description:
      "Gastos diversos no relacionados con departamentos específicos.",
  },
];

export const TRANSACTION_CATEGORIES_BY_ID = {
  1: "Ingresos por Habitaciones",
  2: "Gastos por Habitaciones",
  3: "Ingresos por Alimentos y Bebidas",
  4: "Ingresos por Servicios Complementarios",
  5: "Otros Ingresos",
  6: "Gastos por Alimentos y Bebidas",
  7: "Gastos por Servicios Complementarios",
  8: "Gastos por Reparaciones y Mantenimiento",
  9: "Gastos Administrativos",
  10: "Gastos de Marketing y Ventas",
  11: "Gastos de Personal",
  12: "Gastos por Servicios Públicos",
  13: "Otros Gastos",
};

export const TRANSACTION_STATUSES = [
  { id: 1, name: "Pendiente" },
  { id: 2, name: "Completado" },
  { id: 3, name: "Fallido" },
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
  3: "Fallido",
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

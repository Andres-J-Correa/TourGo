import * as Yup from "yup";

export const TRANSACTION_CATEGORIES = [
  {
    id: 1,
    name: "Ingresos por Habitaciones",
    description:
      "Ingresos generados por la venta de habitaciones, incluyendo reservas individuales, grupales o de larga estancia. Ejemplos: pago por habitación estándar, tarifa de suite de lujo, reserva de grupo para conferencia.",
  },
  {
    id: 3,
    name: "Ingresos por Alimentos y Bebidas",
    description:
      "Ingresos de restaurantes, bares, servicio a la habitación y banquetes. Ejemplos: venta en el restaurante del hotel, ingresos por bar, facturación de banquete de boda.",
  },
  {
    id: 4,
    name: "Ingresos por Servicios Complementarios",
    description:
      "Ingresos de servicios adicionales como spa, estacionamiento, tours o tiendas. Ejemplos: venta de toures, tarifa de estacionamiento, venta de souvenirs en la tienda.",
  },
  {
    id: 5,
    name: "Otros Ingresos",
    description:
      "Ingresos no relacionados con departamentos principales, como ingresos diversos. Ejemplos: reembolsos creditados a el hotel, ingresos de máquinas expendedoras, intereses bancarios.",
  },
  {
    id: 2,
    name: "Gastos por Habitaciones",
    description:
      "Costos asociados con la operación del departamento de habitaciones, como limpieza y suministros. Ejemplos: compra de productos de limpieza, reposición de sábanas, costos de software de reservas.",
  },
  {
    id: 6,
    name: "Gastos por Alimentos y Bebidas",
    description:
      "Costos relacionados con la operación de restaurantes, bares y banquetes. Ejemplos: compra de ingredientes para el restaurante, mantenimiento de equipos de cocina, costos de bebidas para el bar.",
  },
  {
    id: 7,
    name: "Gastos por Servicios Complementarios",
    description:
      "Costos de operación de servicios como spa, estacionamiento o tours. Ejemplos: productos para el spa, mantenimiento del estacionamiento, pago a guías turísticos.",
  },
  {
    id: 8,
    name: "Gastos por Reparaciones y Mantenimiento",
    description:
      "Costos para reparaciones y mantenimiento de la propiedad del hotel. Ejemplos: reparación de una puerta, mantenimiento del sistema de aire acondicionado, pintura de áreas comunes.",
  },
  {
    id: 9,
    name: "Gastos Administrativos",
    description:
      "Costos generales de administración, como suministros de oficina y servicios profesionales. Ejemplos: honorarios de contabilidad, suscripción a software administrativo, seguros del hotel.",
  },
  {
    id: 10,
    name: "Gastos de Marketing y Ventas",
    description:
      "Costos de promoción y ventas, incluyendo publicidad y programas de lealtad. Ejemplos: comisiones de Booking/Airbnb/Agoda, campaña publicitaria en redes sociales, comisiones a agencias de viajes.",
  },
  {
    id: 11,
    name: "Gastos de Personal",
    description:
      "Costos de salarios, beneficios y capacitación para el personal del hotel. Ejemplos: sueldos de recepcionistas, bonos para el personal de cocina, costos de capacitación.",
  },
  {
    id: 12,
    name: "Gastos por Servicios Públicos",
    description:
      "Costos de servicios como electricidad, agua, gas y gestión de residuos. Ejemplos: factura de electricidad, factura de agua, servicio de recolección de basura.",
  },
  {
    id: 13,
    name: "Otros Gastos",
    description:
      "Gastos diversos no relacionados con departamentos específicos. Ejemplos: multas legales, donaciones, costos de eventos especiales no recurrentes.",
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

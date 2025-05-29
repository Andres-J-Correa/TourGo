import * as Yup from "yup";

export const addValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  phone: Yup.string()
    .required("El teléfono es obligatorio")
    .max(20, "Máximo 20 caracteres"),
  address: Yup.string()
    .required("La dirección es obligatoria")
    .max(200, "Máximo 200 caracteres"),
  email: Yup.string()
    .required("El correo electrónico es obligatorio")
    .email("Formato de correo inválido")
    .max(100),
  taxId: Yup.string().required("El ID Fiscal es obligatorio").max(100),
});

export const HOTEL_ROLES_IDS = {
  OWNER: 1,
  ADMIN: 2,
  RECEPTIONIST: 3,
};

export const HOTEL_ROLES_BY_ID = {
  1: "Propietario",
  2: "Administrador",
  3: "Recepcionista",
};

export const HOTEL_ROLES = [
  {
    id: 1,
    name: "Propietario",
  },
  {
    id: 2,
    name: "Administrador",
  },
  {
    id: 3,
    name: "Recepcionista",
  },
];

export const HOTEL_RESOURCES_BY_ID = {
  1: "Hotel",
  2: "Habitaciones",
  3: "Reservas",
  4: "Transacciones",
  5: "Clientes",
  6: "Cargos Extra",
  7: "Facturas",
  8: "Subcategorías de Transacciones",
  9: "Métodos de Pago",
  10: "Proveedores de Reservas",
  11: "Socios financieros",
  12: "Invitaciones de Personal",
};

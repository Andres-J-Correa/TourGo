import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import {
  faUser,
  faFilePen,
  faMoneyBill1Wave,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

export const customerSchema = Yup.object().shape({
  documentNumber: Yup.string()
    .min(2, "Documento muy corto")
    .max(100, "Documento muy largo")
    .required("Documento requerido"),
  firstName: Yup.string()
    .min(2, "El nombre debe tener mínimo 2 caracteres.")
    .max(50, "El nombre debe tener máximo 50 caracteres.")
    .required("El nombre es obligatorio."),
  lastName: Yup.string()
    .min(2, "El apellido debe tener mínimo 2 caracteres.")
    .max(50, "El apellido debe tener máximo 50 caracteres.")
    .required("El apellido es obligatorio."),
  email: Yup.string()
    .required("El correo electrónico es obligatorio.")
    .email("Debe ingresar un correo electrónico válido.")
    .max(100, "El correo debe tener máximo 100 caracteres."),
  phone: Yup.string()
    .required("El teléfono es obligatorio.")
    .test(
      "is-valid-phone",
      "Debe ingresar un número de teléfono válido.",
      (value) => isValidPhoneNumber(value)
    ),
});

export const bookingSchema = Yup.object().shape({
  customerId: Yup.number()
    .required("El cliente es obligatorio")
    .min(1, "El cliente es obligatorio"),

  externalId: Yup.string()
    .min(2, "La identificación externa debe tener al menos 2 caracteres")
    .max(100, "La identificación externa no puede exceder los 100 caracteres")
    .nullable(),

  bookingProviderId: Yup.number()
    .min(1, "Booking Provider ID must be a positive number")
    .nullable(),

  eta: Yup.date()
    .nullable()
    .typeError("Fecha y hora estimada de llegada no es válida"),

  adultGuests: Yup.number()
    .required("El número de personas es obligatorio")
    .min(1, "El número de personas no puede ser menor a 1"),

  childGuests: Yup.number()
    .min(0, "El número de menores no puede ser negativo")
    .nullable(),

  notes: Yup.string().max(1000, "Las notas son demasiado largas").nullable(),

  externalCommission: Yup.number()
    .min(0, "La comision no puede ser negativa")
    .nullable(),

  roomBookings: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.string().required(),
        roomId: Yup.number().required(),
        price: Yup.number().required(),
      })
    )
    .test(
      "all-dates-covered",
      "Debes seleccionar al menos una habitación para cada noche de la reserva",
      function (bookings) {
        const start = this.options.context?.arrivalDate;
        const end = this.options.context?.departureDate;

        if (!start || !end || !Array.isArray(bookings)) return true; // fallback to pass

        const expectedDates = [];
        let current = dayjs(start);
        const last = dayjs(end).subtract(1, "day");

        while (current.isSameOrBefore(last)) {
          expectedDates.push(current.format("YYYY-MM-DD"));
          current = current.add(1, "day");
        }

        const bookedDates = new Set(bookings.map((b) => b.date));

        const missingDate = expectedDates.find(
          (date) => !bookedDates.has(date)
        );
        return !missingDate;
      }
    ),
});

export const chargeTypeLabels = {
  1: "Porcentaje",
  2: "Diario",
  3: "General",
};

export const defaultBooking = {
  id: null,
  externalId: null,
  arrivalDate: null,
  departureDate: null,
  eta: null,
  adultGuests: 0,
  childGuests: 0,
  status: {
    id: 1,
    name: "active",
  },
  notes: null,
  customer: {
    id: null,
    firstName: null,
    lastName: null,
    documentNumber: null,
    phone: null,
    email: null,
  },
  bookingProvider: {
    id: 1,
    name: "Booking.com",
  },
  externalCommission: 0,
  nights: 0,
  subotal: 0,
  charges: 0,
  total: 0,
  invoiceId: 0,
};

export const bookingFormTabs = [
  { id: 0, icon: faUser, name: "Cliente" },
  { id: 1, icon: faFilePen, name: "Informacion de la Reserva" },
  { id: 2, icon: faMoneyBill1Wave, name: "Cobros" },
  { id: 3, icon: faCheckCircle, name: "Confirmación" },
];

export const formatAmount = (amount, typeId) => {
  if (typeId === 1) return `${(amount * 100).toFixed(0)}%`;
  return `$${amount.toFixed(2)}`;
};

import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { BOOKING_STATUS_IDS } from "components/bookings/constants";
import {
  faFilePen,
  faMoneyBill1Wave,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

dayjs.extend(isSameOrBefore);

export const bookingFormTabs = [
  { id: 0, icon: faUser, name: "Cliente" },
  { id: 1, icon: faFilePen, name: "Informacion de la Reserva" },
  { id: 2, icon: faMoneyBill1Wave, name: "Transacciones" },
];

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

export const searchCustomerSchema = Yup.object().shape({
  documentNumber: Yup.string()
    .min(2, "Documento muy corto")
    .max(100, "Documento muy largo")
    .required("Documento requerido"),
});

export const bookingSchema = Yup.object().shape({
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

  roomBookings: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.string().required(),
        roomId: Yup.number().required(),
        price: Yup.number().required(),
      })
    )
    .test("all-dates-covered", function (bookings) {
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

      const missingDates = expectedDates.filter(
        (date) => !bookedDates.has(date)
      );

      return missingDates.length > 0
        ? this.createError({
            message: `Falta reservar en las fechas: ${missingDates
              .map((date) => dayjs(date).format("DD/MM/YYYY"))
              .join(", ")}`,
          })
        : true;
    }),
  bookingProviderId: Yup.number()
    .min(0, "El proveedor de reservas debe ser valido")
    .nullable(),

  externalId: Yup.string().when("bookingProviderId", {
    is: (val) => Number(val) > 0,
    then: () =>
      Yup.string()
        .min(2, "La identificación externa debe tener al menos 2 caracteres")
        .max(
          100,
          "La identificación externa no puede exceder los 100 caracteres"
        )
        .required("La identificación externa es obligatoria"),
    otherwise: () =>
      Yup.string()
        .min(2, "La identificación externa debe tener al menos 2 caracteres")
        .max(
          100,
          "La identificación externa no puede exceder los 100 caracteres"
        )
        .nullable(),
  }),

  externalCommission: Yup.mixed().when("bookingProviderId", {
    is: (val) => Number(val) > 0,
    then: () =>
      Yup.number()
        .required("La comisión externa es obligatoria")
        .min(0, "La comisión externa no puede ser negativa"),
    otherwise: () =>
      Yup.number()
        .min(0, "La comisión externa no puede ser negativa")
        .nullable(),
  }),
});

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
  subtotal: 0,
  charges: 0,
  total: 0,
  invoiceId: 0,
};

export const bookingDefaultInitialValues = {
  bookingProviderId: "",
  adultGuests: "",
  childGuests: "",
  eta: "",
  externalId: "",
  externalCommission: "",
  notes: "",
  status: {
    id: BOOKING_STATUS_IDS.ACTIVE,
  },
};

export const sanitizeBooking = (booking) => {
  const sanitizedBooking = { ...booking };
  sanitizedBooking.bookingProviderId =
    sanitizedBooking.bookingProvider?.id ||
    sanitizedBooking.bookingProviderId ||
    "";
  sanitizedBooking.bookingProviderName =
    sanitizedBooking.bookingProvider?.name || "";
  sanitizedBooking.externalId = sanitizedBooking.externalId || "";
  sanitizedBooking.eta = sanitizedBooking.eta
    ? dayjs.utc(sanitizedBooking.eta).format("YYYY-MM-DDTHH:mm:ss")
    : "";
  sanitizedBooking.externalCommission =
    sanitizedBooking.externalCommission || "";
  sanitizedBooking.notes = sanitizedBooking.notes || "";
  sanitizedBooking.childGuests = sanitizedBooking.childGuests || "";
  sanitizedBooking.adultGuests = sanitizedBooking.adultGuests || "";
  sanitizedBooking.customerId = booking.customer?.id || booking.customerId;
  sanitizedBooking.status = booking.status?.id
    ? booking.status
    : { id: BOOKING_STATUS_IDS.ACTIVE };

  return sanitizedBooking;
};

export const bookingKeysToCompare = [
  "customerId",
  "externalId",
  "bookingProviderId",
  "arrivalDate",
  "departureDate",
  "eta",
  "adultGuests",
  "childGuests",
  "notes",
  "externalCommission",
  "subtotal",
  "charges",
  "extraCharges",
  "roomBookings",
];

export const currentFormKeysToCompare = [
  "roomBookings",
  "extraCharges",
  "subtotal",
  "charges",
  "arrivalDate",
  "departureDate",
  "customerId",
];

export const deepCompareBooking = (obj1, obj2, keysToCompare) => {
  const forceNumericFields = new Set([
    "customerId",
    "bookingProviderId",
    "adultGuests",
    "childGuests",
    "externalCommission",
  ]);

  function areValuesEqual(val1, val2, key) {
    if (val1 == null && val2 == null) return true; // Treat null and undefined as equal

    if (val1 === "" && val2 === "") return true; // Treat empty strings as equal
    if ((val1 == null && val2 === "") || (val1 === "" && val2 == null))
      return true; // Treat null and empty strings as equal

    if (forceNumericFields.has(key)) {
      // Force both sides to numbers
      const num1 = Number(val1);
      const num2 = Number(val2);
      return Math.abs(num1 - num2) < 0.001;
    }

    if (typeof val1 === "number" && typeof val2 === "number") {
      return Math.abs(val1 - val2) < 0.001; // 3 decimal precision
    }

    return val1 === val2;
  }

  function compareArrays(arr1, arr2, fields) {
    if (!Array.isArray(arr1) && !Array.isArray(arr2)) return true;
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;

    const hashItem = (item) =>
      JSON.stringify(
        fields.reduce((obj, key) => {
          obj[key] = item?.[key];
          return obj;
        }, {})
      );

    const getHashCountMap = (arr) => {
      const map = new Map();
      for (const item of arr) {
        const hash = hashItem(item);
        map.set(hash, (map.get(hash) || 0) + 1);
      }
      return map;
    };

    const map1 = getHashCountMap(arr1);
    const map2 = getHashCountMap(arr2);

    if (map1.size !== map2.size) return false;

    for (const [hash, count] of map1.entries()) {
      if (map2.get(hash) !== count) return false;
    }

    return true;
  }

  for (const key of keysToCompare) {
    if (key === "extraCharges") {
      if (
        !compareArrays(obj1?.extraCharges, obj2?.extraCharges, [
          "extraChargeId",
        ])
      ) {
        return false;
      }
    } else if (key === "roomBookings") {
      if (
        !compareArrays(obj1?.roomBookings, obj2?.roomBookings, [
          "roomId",
          "date",
          "price",
        ])
      ) {
        return false;
      }
    } else {
      if (!areValuesEqual(obj1?.[key], obj2?.[key], key)) {
        return false;
      }
    }
  }
  return true;
};

export const LOCAL_STORAGE_FORM_KEYS = {
  PREVIOUS: "previousBookingForm",
  CURRENT: "currentBookingForm",
};

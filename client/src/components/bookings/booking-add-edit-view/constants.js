import { BOOKING_STATUS_IDS } from "components/bookings/constants";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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
  "personalizedCharges",
];

export const currentFormKeysToCompare = [
  "roomBookings",
  "extraCharges",
  "personalizedCharges",
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
    } else if (key === "personalizedCharges") {
      if (
        !compareArrays(obj1?.personalizedCharges, obj2?.personalizedCharges, [
          "name",
          "amount",
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

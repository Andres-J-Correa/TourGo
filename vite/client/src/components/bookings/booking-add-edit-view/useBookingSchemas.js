import * as Yup from "yup";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useLanguage } from "contexts/LanguageContext"; // add import

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

export default function useBookingSchemas() {
  const { t } = useLanguage(); // add hook

  const customerSchema = Yup.object().shape({
    documentNumber: Yup.string()
      .min(2, (params) => t("booking.validation.documentShort", params))
      .max(100, (params) => t("booking.validation.documentLong", params))
      .required((params) => t("booking.validation.documentRequired", params)),
    firstName: Yup.string()
      .min(2, (params) => t("booking.validation.firstNameMin", params))
      .max(50, (params) => t("booking.validation.firstNameMax", params))
      .required((params) => t("booking.validation.firstNameRequired", params)),
    lastName: Yup.string()
      .min(2, (params) => t("booking.validation.lastNameMin", params))
      .max(50, (params) => t("booking.validation.lastNameMax", params))
      .required((params) => t("booking.validation.lastNameRequired", params)),
    email: Yup.string()
      .required((params) => t("booking.validation.emailRequired", params))
      .email((params) => t("booking.validation.emailValid", params))
      .max(100, (params) => t("booking.validation.emailMax", params)),
    phone: Yup.string()
      .required((params) => t("booking.validation.phoneRequired", params))
      .test(
        "is-valid-phone",
        (params) => t("booking.validation.phoneValid", params),
        (value) => isValidPhoneNumber(value)
      ),
  });

  const searchCustomerSchema = Yup.object().shape({
    documentNumber: Yup.string()
      .min(2, (params) => t("booking.validation.documentShort", params))
      .max(100, (params) => t("booking.validation.documentLong", params))
      .required((params) => t("booking.validation.documentRequired", params)),
  });

  const bookingSchema = Yup.object().shape({
    eta: Yup.date()
      .nullable()
      .typeError((params) => t("booking.validation.etaInvalid", params)),

    adultGuests: Yup.number()
      .required((params) => t("booking.validation.adultGuestsRequired", params))
      .min(1, (params) => t("booking.validation.adultGuestsMin", params)),

    childGuests: Yup.number()
      .min(0, (params) => t("booking.validation.childGuestsMin", params))
      .nullable(),

    notes: Yup.string()
      .max(1000, (params) => t("booking.validation.notesMax", params))
      .nullable(),

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

        if (!start || !end || !Array.isArray(bookings)) return true;

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
              message: t("booking.validation.missingDates", {
                dates: missingDates
                  .map((date) => dayjs(date).format("DD/MM/YYYY"))
                  .join(", "),
              }),
            })
          : true;
      }),
    bookingProviderId: Yup.number()
      .min(0, (params) => t("booking.validation.bookingProviderValid", params))
      .nullable(),

    externalId: Yup.string().when("bookingProviderId", {
      is: (val) => Number(val) > 0,
      then: () =>
        Yup.string()
          .min(2, (params) => t("booking.validation.externalIdMin", params))
          .max(100, (params) => t("booking.validation.externalIdMax", params))
          .required((params) =>
            t("booking.validation.externalIdRequired", params)
          ),
      otherwise: () =>
        Yup.string()
          .min(2, (params) => t("booking.validation.externalIdMin", params))
          .max(100, (params) => t("booking.validation.externalIdMax", params))
          .nullable(),
    }),

    externalCommission: Yup.mixed().when("bookingProviderId", {
      is: (val) => Number(val) > 0,
      then: () =>
        Yup.number()
          .required((params) =>
            t("booking.validation.externalCommissionRequired", params)
          )
          .min(0, (params) =>
            t("booking.validation.externalCommissionMin", params)
          ),
      otherwise: () =>
        Yup.number()
          .min(0, (params) =>
            t("booking.validation.externalCommissionMin", params)
          )
          .nullable(),
    }),
  });

  return {
    customerSchema,
    searchCustomerSchema,
    bookingSchema,
  };
}

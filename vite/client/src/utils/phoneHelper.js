import { parsePhoneNumberFromString } from "libphonenumber-js";

export function formatPhoneNumber(rawPhone) {
  if (!rawPhone) return null;
  const phoneNumber = parsePhoneNumberFromString(rawPhone);

  return phoneNumber ? phoneNumber.formatInternational() : rawPhone;
}

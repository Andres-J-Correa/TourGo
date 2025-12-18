export const formatCurrency = (number, currency, locale = "es-CO") => {
  //check that number is valid
  if (isNaN(number)) {
    return "-";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(Number(number));
};

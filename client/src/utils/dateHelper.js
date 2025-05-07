import dayjs from "dayjs";

export const getDate = (date) => {
  if (!date) return null;
  if (!dayjs(date).isValid()) return null;

  const day = dayjs(date).get("date");
  const month = dayjs(date).get("month") + 1;
  const year = dayjs(date).get("year");
  const formattedDate = `${year}-${month < 10 ? "0" + month : month}-${
    day < 10 ? "0" + day : day
  }`;
  return formattedDate;
};

import dayjs from "dayjs";

export const getDateString = (date?: string | Date | null): string | null => {
  if (!date || !dayjs(date).isValid()) return null;

  const day = dayjs(date).get("date");
  const month = dayjs(date).get("month") + 1;
  const year = dayjs(date).get("year");
  const formattedDate = `${year}-${month < 10 ? "0" + month : month}-${
    day < 10 ? "0" + day : day
  }`;
  return formattedDate;
};

export const getDate = (date?: string | Date | null): Date | null => {
  if (!date || !dayjs(date).isValid()) return null;

  const day = dayjs(date).get("date");
  const month = dayjs(date).get("month") + 1;
  const year = dayjs(date).get("year");
  const formattedDate = `${year}-${month < 10 ? "0" + month : month}-${
    day < 10 ? "0" + day : day
  }`;
  return dayjs(formattedDate).toDate();
};

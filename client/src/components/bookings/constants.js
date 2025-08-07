import dayjs from "dayjs";
import { formatCurrency } from "utils/currencyHelper";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import { useTranslation } from "react-i18next";

// Use translation keys instead of hardcoded strings
export const BOOKING_STATUS_BY_ID = {
  1: "booking.status.active",
  2: "booking.status.cancelled",
  3: "booking.status.completed",
  4: "booking.status.noShow",
  5: "booking.status.arrived",
};

export const BOOKING_STATUSES = [
  { id: 1, name: "booking.status.active" },
  { id: 2, name: "booking.status.cancelled" },
  { id: 3, name: "booking.status.completed" },
  { id: 4, name: "booking.status.noShow" },
  { id: 5, name: "booking.status.arrived" },
];

export const BOOKING_STATUS_IDS = {
  ACTIVE: 1,
  CANCELLED: 2,
  COMPLETED: 3,
  NO_SHOW: 4,
  ARRIVED: 5,
};

export const LOCKED_BOOKING_STATUSES = [
  BOOKING_STATUS_IDS.CANCELLED,
  BOOKING_STATUS_IDS.NO_SHOW,
];

// Export a function to get columns with translations
export const useBookingsTableColumns = () => {
  const { t } = useTranslation();

  return [
    {
      header: t("booking.table.id"),
      accessorKey: "id",
      maxSize: 120,
    },
    {
      header: t("booking.table.firstName"),
      accessorKey: "firstName",
    },
    {
      header: t("booking.table.lastName"),
      accessorKey: "lastName",
    },
    {
      header: t("booking.table.arrival"),
      accessorKey: "arrivalDate",
      cell: ({ getValue }) => dayjs(getValue()).format("DD/MM/YYYY"),
    },
    {
      header: t("booking.table.departure"),
      accessorKey: "departureDate",
      cell: ({ getValue }) => dayjs(getValue()).format("DD/MM/YYYY"),
    },
    {
      header: t("booking.table.total"),
      accessorKey: "total",
      cell: ({ getValue }) => formatCurrency(getValue(), "COP"),
    },
    {
      header: t("booking.table.balanceDue"),
      accessorKey: "balanceDue",
      cell: ({ getValue }) => formatCurrency(getValue(), "COP"),
    },
    {
      header: t("booking.table.externalId"),
      accessorKey: "externalBookingId",
      minSize: "fit-content",
      sortDescFirst: true,
      sortingFn: "alphanumeric",
      sortUndefined: 1,
    },
    {
      header: t("booking.table.status"),
      accessorKey: "statusId",
      cell: ({ getValue }) => {
        const statusId = getValue();
        return <BookingStatusBadge statusId={statusId} />;
      },
    },
  ];
};

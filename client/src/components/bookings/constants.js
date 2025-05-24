import dayjs from "dayjs";
import { formatCurrency } from "utils/currencyHelper";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";

export const BOOKING_STATUS_BY_ID = {
  1: "Activo",
  2: "Cancelado",
  3: "Completado",
  4: "No Show",
  5: "Arribada",
};

export const BOOKING_STATUSES = [
  { id: 1, name: "Activo" },
  { id: 2, name: "Cancelado" },
  { id: 3, name: "Completado" },
  { id: 4, name: "No Show" },
  { id: 5, name: "Arribada" },
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
  BOOKING_STATUS_IDS.COMPLETED,
];

export const bookingsTableColumns = [
  {
    header: "ID",
    accessorKey: "id",
    maxSize: 50,
    minSize: 50,
  },
  {
    header: "Nombre",
    accessorKey: "firstName",
  },
  {
    header: "Apellido",
    accessorKey: "lastName",
  },
  {
    header: "Llegada",
    accessorKey: "arrivalDate",
    cell: ({ getValue }) => dayjs(getValue()).format("DD/MM/YYYY"),
  },
  {
    header: "Salida",
    accessorKey: "departureDate",
    cell: ({ getValue }) => dayjs(getValue()).format("DD/MM/YYYY"),
  },
  {
    header: "Total",
    accessorKey: "total",
    cell: ({ getValue }) => formatCurrency(getValue(), "COP"),
  },
  {
    header: "Saldo",
    accessorKey: "balanceDue",
    cell: ({ getValue }) => formatCurrency(getValue(), "COP"),
  },
  {
    header: "ID externa",
    accessorKey: "externalBookingId",
    minSize: "fit-content",
    sortDescFirst: true,
    sortingFn: "alphanumeric",
    sortUndefined: 1,
  },
  {
    header: "Estado",
    accessorKey: "statusId",
    cell: ({ getValue }) => {
      const statusId = getValue();
      return <BookingStatusBadge statusId={statusId} />;
    },
  },
];

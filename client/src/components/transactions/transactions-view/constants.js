import dayjs from "dayjs";
import {
  transactionCategories,
  transactionStatuses,
  TRANSACTION_STATUS_DICT,
} from "../constants";
import { formatCurrency } from "utils/currencyHelper";

export const transactionsTableColumns = [
  {
    header: "Id",
    accessorKey: "id",
    minSize: 50,
  },
  {
    header: "Fecha de transacción",
    accessorKey: "transactionDate",
    cell: ({ getValue }) => {
      const date = getValue();
      return dayjs(date).format("DD/MM/YYYY");
    },
  },
  {
    header: "Monto",
    accessorKey: "amount",
    cell: (cell) => {
      const amount = cell.getValue();
      return formatCurrency(amount, cell.row.original.currencyCode);
    },
  },
  {
    header: "Método de pago",
    accessorKey: "paymentMethod.name",
  },
  {
    header: "Categoría",
    accessorKey: "categoryId",
    cell: ({ getValue }) => {
      const categoryId = getValue();
      const category = transactionCategories.find(
        (category) => Number(category.id) === Number(categoryId)
      );
      return category ? category.name : "No definido";
    },
  },
  {
    header: "Subcategoría",
    accessorKey: "subcategory.name",
    sortDescFirst: true,
    minSize: 140,
  },
  {
    header: "Estado",
    accessorKey: "statusId",
    cell: ({ getValue }) => {
      const statusId = getValue();
      return (
        <span
          className={`badge ${
            statusId === TRANSACTION_STATUS_DICT.PENDING
              ? "bg-warning"
              : statusId === TRANSACTION_STATUS_DICT.COMPLETED
              ? "bg-success"
              : statusId === TRANSACTION_STATUS_DICT.FAILED
              ? "bg-danger"
              : statusId === TRANSACTION_STATUS_DICT.ADJUSTED
              ? "bg-info"
              : statusId === TRANSACTION_STATUS_DICT.REVERTED
              ? "bg-secondary"
              : ""
          }`}>
          {transactionStatuses.find(
            (status) => Number(status.id) === Number(statusId)
          )?.name || "No definido"}
        </span>
      );
    },
  },
  {
    header: "Socio Financiero",
    accessorKey: "financePartner.name",
  },
  {
    header: "Entidad Asociada",
    accessorKey: "entityId",
  },
];

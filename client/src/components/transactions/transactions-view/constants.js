import dayjs from "dayjs";
import { TRANSACTION_CATEGORIES_BY_ID } from "components/transactions/constants";
import { formatCurrency } from "utils/currencyHelper";
import TransactionStatusBadge from "components/transactions/TransactionStatusBadge";

export const transactionsTableColumns = [
  {
    header: "Id",
    accessorKey: "id",
    minSize: 50,
  },
  {
    header: "Fecha",
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
      const category = TRANSACTION_CATEGORIES_BY_ID[categoryId];
      return category ?? "No definido";
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
    maxSize: 80,
    minSize: 80,
    cell: ({ getValue }) => {
      const statusId = getValue();
      return <TransactionStatusBadge statusId={statusId} />;
    },
  },
  {
    header: "Socio financiero",
    accessorKey: "financePartner.name",
  },
  {
    header: "Entidad",
    accessorKey: "entityId",
    cell: ({ getValue }) => {
      const entityId = getValue();
      return entityId ? entityId : "";
    },
    maxSize: 120,
    minSize: 120,
  },
];

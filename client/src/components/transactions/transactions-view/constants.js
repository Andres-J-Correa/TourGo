import dayjs from "dayjs";
import { transactionCategories, transactionStatuses } from "../constants";
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
      const status = transactionStatuses.find(
        (status) => Number(status.id) === Number(statusId)
      );
      return status ? status.name : "No definido";
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

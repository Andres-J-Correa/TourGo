import dayjs from "dayjs";
import { TRANSACTION_CATEGORIES_BY_ID } from "components/transactions/constants";
import { formatCurrency } from "utils/currencyHelper";
import TransactionStatusBadge from "components/transactions/TransactionStatusBadge";
import { useLanguage } from "contexts/LanguageContext";

export const useTransactionsTableColumns = () => {
  const { t } = useLanguage();
  return [
    {
      header: t("transactions.table.id"),
      accessorKey: "id",
      minSize: 50,
    },
    {
      header: t("transactions.table.date"),
      accessorKey: "transactionDate",
      cell: ({ getValue }) => {
        const date = getValue();
        return dayjs(date).format("DD/MM/YYYY");
      },
    },
    {
      header: t("transactions.table.amount"),
      accessorKey: "amount",
      cell: (cell) => {
        const amount = cell.getValue();
        return formatCurrency(amount, cell.row.original.currencyCode);
      },
    },
    {
      header: t("transactions.table.paymentMethod"),
      accessorKey: "paymentMethod.name",
    },
    {
      header: t("transactions.table.category"),
      accessorKey: "categoryId",
      cell: ({ getValue }) => {
        const categoryId = getValue();
        const category = TRANSACTION_CATEGORIES_BY_ID[categoryId];
        return category ? t(category) : t("transactions.table.undefined");
      },
    },
    {
      header: t("transactions.table.subcategory"),
      accessorKey: "subcategory.name",
      sortDescFirst: true,
      minSize: 140,
    },
    {
      header: t("transactions.table.status"),
      accessorKey: "statusId",
      maxSize: 80,
      minSize: 80,
      cell: ({ getValue }) => {
        const statusId = getValue();
        return <TransactionStatusBadge statusId={statusId} />;
      },
    },
    {
      header: t("transactions.table.financePartner"),
      accessorKey: "financePartner.name",
    },
    {
      header: t("transactions.table.entity"),
      accessorKey: "entityId",
      cell: ({ getValue }) => {
        const entityId = getValue();
        return entityId ? entityId : "";
      },
      maxSize: 120,
      minSize: 120,
    },
  ];
};

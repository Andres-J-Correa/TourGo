import { RowData, CellContext } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    getTdProps?: (info: CellContext<TData, TValue>) => Record<string, string>;
  }
}

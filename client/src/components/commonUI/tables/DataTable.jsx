// DataTable.jsx
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import classNames from "classnames";
import { Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faArrowDownWideShort,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "contexts/LanguageContext"; // added

const DataTable = ({
  data,
  columns,
  loading,
  sorting,
  onSortingChange,
  expandedRowRender,
  getRowCanExpand = () => true,
  emptyMessage,
  rowClassName,
  onRowClick,
}) => {
  const { t } = useLanguage(); // added
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(newSorting);
      table.setExpanded({});
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
  });

  return (
    <table className="table table-sm table-bordered table-striped table-hover">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                onClick={
                  !loading ? header.column.getToggleSortingHandler() : () => {}
                }
                className={classNames(
                  "text-bg-dark text-center align-content-center",
                  {
                    "cursor-pointer": header.column.getCanSort(),
                    "text-bg-info": header.column.getIsSorted(),
                    "cursor-not-allowed": loading,
                  }
                )}
                style={{
                  maxWidth: header.column.columnDef.maxSize || "none",
                  minWidth: header.column.columnDef.minSize || "none",
                  width: header.column.getSize() || "auto",
                }}>
                <div
                  style={{ minWidth: "max-content" }}
                  className="align-items-center">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  <span className="float-end ms-2">
                    {{
                      asc: <FontAwesomeIcon icon={faArrowUpShortWide} />,
                      desc: <FontAwesomeIcon icon={faArrowDownWideShort} />,
                    }[header.column.getIsSorted()] ||
                      (header.column.getCanSort() && (
                        <FontAwesomeIcon icon={faSort} />
                      ))}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="text-center">
              <Spinner size="sm" /> {t("commonUI.dataTable.loading")}
            </td>
          </tr>
        ) : table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center">
              {emptyMessage || t("commonUI.dataTable.noRecords")}
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr
                onClick={() => {
                  if (onRowClick) onRowClick(row);
                  table.setExpanded({ [row.id]: !row.getIsExpanded() });
                }}
                className={classNames("cursor-pointer", rowClassName?.(row))}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    className={classNames("text-center align-content-center", {
                      "bg-info-subtle": row.getIsExpanded(),
                    })}
                    style={{
                      maxWidth: cell.column.columnDef.maxSize || "none",
                      minWidth: cell.column.columnDef.minSize || "none",
                      width: cell.column.getSize() || "auto",
                    }}
                    key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() && expandedRowRender && (
                <tr>
                  <td colSpan={row.getVisibleCells().length} className="p-0">
                    {expandedRowRender(row)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))
        )}
      </tbody>
    </table>
  );
};

export default DataTable;

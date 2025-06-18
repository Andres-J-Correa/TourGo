import React from "react";
import { Spinner, Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faArrowDownWideShort,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { flexRender } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext"; // added

const BookingsTable = ({ table, columns, loading }) => {
  const { t } = useLanguage(); // added
  return (
    <table className="table table-sm table-bordered table-hover table-striped mb-1">
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
              <Spinner size="sm" /> {t("booking.bookingsTable.loading")}
            </td>
          </tr>
        ) : table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center">
              {t("booking.bookingsTable.noRecords")}
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr
                onClick={() =>
                  table.setExpanded({ [row.id]: !row.getIsExpanded() })
                }
                className="cursor-pointer">
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
              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={row.getVisibleCells().length} className="p-0">
                    <div className="p-2 border border-info-subtle bg-light">
                      <Row>
                        <Col md={6}>
                          <strong>
                            {t("booking.bookingsTable.createdBy")}
                          </strong>{" "}
                          {row.original.createdBy?.firstName}{" "}
                          {row.original.createdBy?.lastName}
                        </Col>
                        <Col md={6}>
                          <strong>
                            {t("booking.bookingsTable.dateCreated")}
                          </strong>{" "}
                          {dayjs(row.original.dateCreated).format(
                            "DD/MM/YYYY - h:mm A"
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <strong>
                            {t("booking.bookingsTable.modifiedBy")}
                          </strong>{" "}
                          {row.original.modifiedBy?.firstName}{" "}
                          {row.original.modifiedBy?.lastName}
                        </Col>
                        <Col md={6}>
                          <strong>
                            {t("booking.bookingsTable.dateModified")}
                          </strong>{" "}
                          {dayjs(row.original.dateModified).format(
                            "DD/MM/YYYY - h:mm A"
                          )}
                        </Col>
                      </Row>
                    </div>
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

export default BookingsTable;

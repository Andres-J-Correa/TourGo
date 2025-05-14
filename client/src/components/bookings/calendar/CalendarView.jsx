import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getRoomBookingsByDateRange } from "services/bookingService";

import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

import { formatCurrency } from "utils/currencyHelper";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import classNames from "classnames";

import { useVirtualizer } from "@tanstack/react-virtual";

import "components/bookings/booking-add-edit-view/room-booking-table/RoomBookingTable.css";

const _logger = require("debug")("CalendarView");

function CalendarView() {
  const { hotelId } = useParams();
  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [dates, setDates] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf("month").format("YYYY-MM-DD"),
    end: dayjs().endOf("month").format("YYYY-MM-DD"),
  });

  const tableContainerRef = useRef(null);

  const bookingMap = useMemo(() => {
    const map = {};
    roomBookings.forEach((booking) => {
      const key = `${booking.date}-${booking.room.id}`;
      map[key] = booking.price;
    });
    return map;
  }, [roomBookings]);

  // Define columns
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => {
    // First column for dates
    const dateColumn = columnHelper.accessor("date", {
      header: () => "Fechas",
      cell: (info) => dayjs(info.getValue()).format("ddd DD - MMM - YYYY"),
      size: 200,
    });

    // Dynamic columns for each room
    const roomColumns = rooms.map((room) =>
      columnHelper.accessor(`room-${room.id}`, {
        header: () => room.name,
        cell: (info) => {
          const date = info.row.original.date;
          const price = bookingMap[`${date}-${room.id}`];
          return price ? formatCurrency(price, "COP") : "";
        },
        size: 200,
      })
    );

    return [dateColumn, ...roomColumns];
  }, [rooms, bookingMap, columnHelper]);

  const table = useReactTable({
    data: dates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const onGetRoomsSuccess = (res) => {
    if (res.isSuccessful) {
      setRooms(res.items);
    } else {
      setRooms([]);
    }
  };

  const onGetRoomsError = (err) => {
    if (err?.response?.status !== 404) {
      toast.error("Error al cargar habitaciones");
    }
    setRooms([]);
  };

  const onGetRoomBookingsSuccess = (res) => {
    if (res.isSuccessful) {
      setRoomBookings(res.items);
    } else {
      setRoomBookings([]);
    }
  };

  const onGetRoomBookingsError = (err) => {
    if (err?.response?.status !== 404) {
      toast.error("Error al cargar reservas");
    }
    setRoomBookings([]);
  };

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 42.4, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  // 🔁 Date range
  useEffect(() => {
    const dateList = [];
    let current = dayjs(dateRange.start);
    while (
      current.isBefore(dayjs(dateRange.end)) ||
      current.isSame(dayjs(dateRange.end))
    ) {
      dateList.push({ date: current.format("YYYY-MM-DD") });
      current = current.add(1, "day");
    }
    setDates(dateList);
  }, [dateRange]);

  useEffect(() => {
    if (!hotelId) return;

    setIsLoadingRooms(true);
    getRoomsByHotelId(hotelId)
      .then(onGetRoomsSuccess)
      .catch(onGetRoomsError)
      .finally(() => setIsLoadingRooms(false));
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId || !dateRange.start || !dateRange.end) return;

    setIsLoadingBookings(true);
    getRoomBookingsByDateRange(hotelId, dateRange.start, dateRange.end)
      .then(onGetRoomBookingsSuccess)
      .catch(onGetRoomBookingsError)
      .finally(() => setIsLoadingBookings(false));
  }, [hotelId, dateRange]);

  useEffect(() => {
    _logger("rows", rows);
    _logger("virtualItems", rowVirtualizer.getVirtualItems());
  }, [rows, rowVirtualizer]);

  return (
    <>
      <LoadingOverlay isVisible={isLoadingRooms} />
      <Breadcrumb breadcrumbs={breadcrumbs} active="Calendario" />
      <h3>Calendario</h3>
      <div
        ref={tableContainerRef}
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
        }}>
        <table style={{ display: "grid" }} className="table table-bordered">
          <thead
            className="border"
            style={{
              display: "grid",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isDateColumn = header.id.includes("date");
                  return (
                    <th
                      className="text-center align-content-center bg-dark text-white fw-bold"
                      key={header.id}
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        minWidth: header.getSize(),
                        maxWidth: header.getSize(),
                        position: isDateColumn ? "sticky" : "static",
                        left: isDateColumn ? 0 : "auto",
                      }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            className="border"
            style={{
              display: "grid",
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: "relative", //needed for absolute positioning of rows
            }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              debugger;
              return (
                <tr
                  data-index={virtualRow.index}
                  key={row.id}
                  ref={(node) => rowVirtualizer.measureElement(node)}
                  style={{
                    display: "flex",
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    width: "100%",
                  }}>
                  {row.getVisibleCells().map((cell) => {
                    const isDateColumn = cell.column.id.includes("date");
                    return (
                      <td
                        className={classNames(
                          "text-center align-content-center",
                          {
                            "bg-dark text-white fw-bold": isDateColumn,
                          }
                        )}
                        key={cell.id}
                        style={{
                          display: "flex",
                          border: "1px solid black",
                          padding: "8px",
                          minWidth: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                          position: isDateColumn ? "sticky" : "static",
                          left: isDateColumn ? 0 : "auto",
                        }}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CalendarView;

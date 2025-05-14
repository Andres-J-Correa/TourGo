import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getRoomBookingsByDateRange } from "services/bookingService";

import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

import { formatCurrency } from "utils/currencyHelper";

import { throttle } from "lodash";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import classNames from "classnames";

import { useVirtualizer } from "@tanstack/react-virtual";
import isSameorBefore from "dayjs/plugin/isSameOrBefore";
import "./CalendarView.css";

dayjs.extend(isSameorBefore);

const initialStartDate = dayjs().startOf("month").format("YYYY-MM-DD");
const initialEndDate = dayjs().endOf("month").format("YYYY-MM-DD");
const SCROLL_OFFSET_ROWS = 36;

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
    start: initialStartDate,
    end: initialEndDate,
  });

  const lastScrollTop = useRef(0);
  const tableContainerRef = useRef(null);
  const lastStartDate = useRef(initialStartDate);

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
          let price = bookingMap[`${date}-${room.id}`];
          return (
            <span
              className={classNames("text-center", {
                hasValue: Boolean(price),
              })}>
              {formatCurrency(price, "COP")}
            </span>
          );
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
  };

  const onGetRoomBookingsSuccess = (res) => {
    if (res.isSuccessful) {
      setRoomBookings((prev) => [...prev, ...res.items]);
    }
  };

  const onGetRoomBookingsError = (err) => {
    if (err?.response?.status !== 404) {
      toast.error("Error al cargar reservas");
    }
  };

  const fetchRoomBookings = useCallback((hotelId, dateStart, dateEnd) => {
    setIsLoadingBookings(true);
    getRoomBookingsByDateRange(hotelId, dateStart, dateEnd)
      .then(onGetRoomBookingsSuccess)
      .catch(onGetRoomBookingsError)
      .finally(() => setIsLoadingBookings(false));
  }, []);

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

  const buildDates = useCallback((startDate, endDate, direction = "append") => {
    const dateList = [];
    let current = dayjs(startDate);
    while (current.isSameOrBefore(dayjs(endDate))) {
      dateList.push({ date: current.format("YYYY-MM-DD") });
      current = current.add(1, "day");
    }
    setDates((prev) => {
      if (direction === "append") {
        return [...prev, ...dateList];
      } else {
        return [...dateList, ...prev];
      }
    });
  }, []);

  const triggerNextMonthFetch = useCallback(() => {
    const dateStart = dayjs(dateRange.end)
      .endOf("month")
      .add(1, "day")
      .format("YYYY-MM-DD");
    const newEnd = dayjs(dateStart).endOf("month").format("YYYY-MM-DD");
    setDateRange((prev) => ({
      ...prev,
      end: newEnd,
    }));

    buildDates(dateStart, newEnd, "append");

    fetchRoomBookings(hotelId, dateStart, newEnd);
  }, [dateRange, buildDates, hotelId, fetchRoomBookings]);

  const triggerPreviousMonthFetch = useCallback(() => {
    const dateEnd = dayjs(dateRange.start)
      .startOf("month")
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    const newStart = dayjs(dateEnd).startOf("month").format("YYYY-MM-DD");

    setDateRange((prev) => ({
      ...prev,
      start: newStart,
    }));

    buildDates(newStart, dateEnd, "prepend");
    fetchRoomBookings(hotelId, newStart, dateEnd);
  }, [dateRange, buildDates, hotelId, fetchRoomBookings]);

  useEffect(() => {
    const container = tableContainerRef.current;
    const handleScroll = throttle(() => {
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const direction = scrollTop > lastScrollTop.current ? "down" : "up";
      lastScrollTop.current = scrollTop;

      const bottomVirtualItem = rowVirtualizer.getVirtualItems()?.at(-1);
      const bottomVisibleRow = bottomVirtualItem
        ? table.getRowModel().rows[bottomVirtualItem.index]
        : null;
      const lastRow = table.getRowModel().rows.at(-1);
      const isLastRowVisible = bottomVisibleRow?.id === lastRow?.id;

      const isAtBottom =
        scrollHeight - scrollTop - clientHeight < 200 && isLastRowVisible;
      if (isAtBottom && direction === "down" && !isLoadingBookings) {
        triggerNextMonthFetch();
      }

      const isAtTop = scrollTop < 200;
      if (isAtTop && direction === "up" && !isLoadingBookings) {
        triggerPreviousMonthFetch();
      }
    }, 500);

    container?.addEventListener("scroll", handleScroll);
    return () => {
      container?.removeEventListener("scroll", handleScroll);
      handleScroll.cancel(); // Clean up throttle
    };
  }, [
    isLoadingBookings,
    triggerNextMonthFetch,
    triggerPreviousMonthFetch,
    rowVirtualizer,
    table,
  ]);

  // 🔁 Date range
  useEffect(() => {
    if (dates.length === 0) {
      const dateList = [];
      let current = dayjs(initialStartDate);
      while (current.isSameOrBefore(dayjs(initialEndDate))) {
        dateList.push({ date: current.format("YYYY-MM-DD") });
        current = current.add(1, "day");
      }
      setDates(dateList);
    }
  }, [dates]);

  useEffect(() => {
    if (!hotelId) return;

    setIsLoadingRooms(true);
    getRoomsByHotelId(hotelId)
      .then(onGetRoomsSuccess)
      .catch(onGetRoomsError)
      .finally(() => setIsLoadingRooms(false));
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId) return;
    fetchRoomBookings(hotelId, initialStartDate, initialEndDate);
  }, [hotelId, fetchRoomBookings]);

  useEffect(() => {
    if (dates.length === 0) return;

    if (dayjs(dates[0]?.date).isBefore(dayjs(lastStartDate.current))) {
      rowVirtualizer.scrollToIndex(SCROLL_OFFSET_ROWS);
      lastStartDate.current = dates[0]?.date;
    }
  }, [dates, rowVirtualizer]);

  return (
    <>
      <LoadingOverlay
        isVisible={isLoadingRooms || isLoadingBookings}
        message={isLoadingBookings ? "Cargando Reservas" : undefined}
      />
      <Breadcrumb breadcrumbs={breadcrumbs} active="Calendario" />
      <h3>Calendario</h3>
      <div
        ref={tableContainerRef}
        style={{
          minHeight: "70vh",
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
              return (
                <tr
                  data-index={virtualRow.index}
                  key={row.id}
                  ref={
                    rowVirtualizer.measureElement
                      ? (node) => node && rowVirtualizer.measureElement(node)
                      : undefined
                  }
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
                          "text-center align-content-center justify-content-center calendar-cell",
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

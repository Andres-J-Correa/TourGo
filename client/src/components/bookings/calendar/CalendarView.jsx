import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table } from "reactstrap";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getRoomBookingsByDateRange } from "services/bookingService";

import Breadcrumb from "components/commonUI/Breadcrumb";
import BookingRow from "components/bookings/booking-add-edit-view/room-booking-table/BookingRow";
import RoomHeader from "components/bookings/booking-add-edit-view/room-booking-table/RoomHeader";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

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
    start: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
    end: dayjs().add(3, "day").format("YYYY-MM-DD"),
  });

  const getBooking = (date, roomId) =>
    roomBookings?.find(
      (b) => b.date === date && Number(b.room.id) === Number(roomId)
    );

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

  // 🔁 Date range
  useEffect(() => {
    const dateList = [];
    let current = dayjs(dateRange.start);
    while (
      current.isBefore(dayjs(dateRange.end)) ||
      current.isSame(dayjs(dateRange.end))
    ) {
      dateList.push(current.format("YYYY-MM-DD"));
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
    _logger("rooms", rooms);
    _logger("roomBookings", roomBookings);
    _logger("dates", dates);
  }, [rooms, roomBookings, dates]);

  return (
    <>
      <LoadingOverlay isVisible={isLoadingRooms || isLoadingBookings} />
      <Breadcrumb breadcrumbs={breadcrumbs} active="Calendario" />
      <h3>Calendario</h3>
      <div className="bookings-table-container">
        <Table bordered className="table-fixed">
          <thead className="sticky-top">
            <tr>
              <th className="date-row-label text-bg-dark">Fecha</th>
              {rooms.map((room) => (
                <RoomHeader
                  key={room.id}
                  room={room}
                  onRoomHeaderClick={() => {}}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <BookingRow
                key={`${date}-date-row`}
                date={date}
                rooms={rooms}
                getBooking={getBooking}
                onCellClick={() => {}}
                isCalendarView={true}
              />
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default CalendarView;

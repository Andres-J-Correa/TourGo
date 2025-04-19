import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Container,
} from "reactstrap";

const testRooms = [
  { Id: 1, Name: "Room A" },
  { Id: 2, Name: "Room B" },
  { Id: 3, Name: "Room C" },
  { Id: 4, Name: "Room D" },
];

const testBookings = [
  {
    Date: "2024-04-01",
    Bookings: [
      { RoomId: 1, RoomName: "Room A", BookingId: 10, Price: 100.0 },
      { RoomId: 2, RoomName: "Room B", BookingId: 12, Price: 150.0 },
    ],
  },
  {
    Date: "2024-04-02",
    Bookings: [
      { RoomId: 1, RoomName: "Room A", BookingId: 10, Price: 100.0 },
      { RoomId: 3, RoomName: "Room C", BookingId: 14, Price: 200.0 },
    ],
  },
];

const RoomBookingTable = ({
  startDate = "2024-03-25",
  endDate = "2024-04-05",
  rooms = testRooms,
  roomBookings = testBookings,
}) => {
  const [selectedCells, setSelectedCells] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [currentSelection, setCurrentSelection] = useState(null);
  const [dates, setDates] = useState([]);

  // Generate date range using dayjs
  useEffect(() => {
    const dateList = [];
    let current = dayjs(startDate);
    while (current.isBefore(dayjs(endDate)) || current.isSame(dayjs(endDate))) {
      dateList.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }
    setDates(dateList);
  }, [startDate, endDate]);

  // Get a booking by date & roomId
  const getBooking = (date, roomId) => {
    const day = roomBookings.find((b) => b.Date === date);
    return day
      ? day.Bookings.find((booking) => booking.RoomId === roomId)
      : null;
  };

  // Toggle Modal
  const toggleModal = () => setModalOpen(!modalOpen);

  // Handle Cell Click
  const handleCellClick = (date, roomId) => {
    const isPreBooked = getBooking(date, roomId);
    if (isPreBooked) return; // Ignore pre-booked cells

    if (isMultiSelect) {
      setSelectedCells((prev) => [...prev, { date, roomId }]);
    } else {
      setCurrentSelection([{ date, roomId }]); // Single selection
      setPrice("");
      toggleModal();
    }
  };

  // Handle Multi-Select Price Apply
  const handleMultiSelectPrice = () => {
    if (price) {
      setSelectedCells((prev) =>
        prev.map((cell) => ({ ...cell, price: parseFloat(price) }))
      );
      toggleModal();
    }
  };

  // Handle Price Submit for Single Selection
  const handlePriceSubmit = () => {
    if (price && currentSelection) {
      setSelectedCells([
        ...selectedCells,
        ...currentSelection.map((cell) => ({
          ...cell,
          price: parseFloat(price),
        })),
      ]);
      toggleModal();
    }
  };

  // Clear selection
  const clearSelection = () => setSelectedCells([]);

  return (
    <Container fluid className="mt-4">
      <h2>Seleccionar Reservas de Habitaciones</h2>
      <div className="mb-3">
        <Button
          color={isMultiSelect ? "danger" : "primary"}
          onClick={() => setIsMultiSelect(!isMultiSelect)}>
          {isMultiSelect
            ? "Cancelar Multi-Selección"
            : "Activar Multi-Selección"}
        </Button>
        {isMultiSelect && selectedCells.length > 0 && (
          <Button color="success" className="ms-2" onClick={toggleModal}>
            Finalizar Selección
          </Button>
        )}
        {selectedCells.length > 0 && (
          <Button color="warning" className="ms-2" onClick={clearSelection}>
            Limpiar Selección
          </Button>
        )}
      </div>

      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "600px" }}>
        <Table bordered className="table-fixed">
          <thead>
            <tr>
              <th style={{ width: "150px" }}>Fecha</th>
              {rooms.map((room) => (
                <th key={room.Id} style={{ minWidth: "120px" }}>
                  {room.Name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <tr key={date}>
                <td style={{ width: "150px", fontWeight: "bold" }}>{date}</td>
                {rooms.map((room) => {
                  const booking = getBooking(date, room.Id);
                  const isSelected = selectedCells.some(
                    (c) => c.date === date && c.roomId === room.Id
                  );
                  const customPrice = selectedCells.find(
                    (c) => c.date === date && c.roomId === room.Id
                  )?.price;

                  return (
                    <td
                      key={room.Id}
                      className={`text-center ${
                        booking
                          ? "bg-secondary text-white"
                          : isSelected
                          ? "bg-warning"
                          : ""
                      }`}
                      style={{
                        cursor: booking ? "not-allowed" : "pointer",
                        minWidth: "120px",
                      }}
                      onClick={() => handleCellClick(date, room.Id)}>
                      {booking
                        ? `$${booking.Price.toFixed(2)}`
                        : customPrice
                        ? `$${customPrice.toFixed(2)}`
                        : "🆕"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Price Input Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Ingresar Precio</ModalHeader>
        <ModalBody>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ingrese el precio"
            min="0"
            step="0.01"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={
              isMultiSelect ? handleMultiSelectPrice : handlePriceSubmit
            }>
            Guardar
          </Button>
          <Button color="secondary" onClick={toggleModal}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

// ✅ Define PropTypes
RoomBookingTable.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      Id: PropTypes.number.isRequired,
      Name: PropTypes.string.isRequired,
    })
  ).isRequired,
  roomBookings: PropTypes.arrayOf(
    PropTypes.shape({
      Date: PropTypes.string.isRequired,
      Bookings: PropTypes.arrayOf(
        PropTypes.shape({
          RoomId: PropTypes.number.isRequired,
          RoomName: PropTypes.string.isRequired,
          BookingId: PropTypes.number.isRequired,
          Price: PropTypes.number.isRequired,
        })
      ),
    })
  ).isRequired,
};

export default RoomBookingTable;

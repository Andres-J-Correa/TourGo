// 🧠 Required imports (same as before)
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import classNames from "classnames";
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Container,
  Row,
  Col,
  Form,
} from "reactstrap";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import "./RoomBookingTable.css"; // Custom styles for the table

const RoomBookingTable = ({
  startDate,
  endDate,
  rooms,
  roomBookings,
  setSelectedRoomBookings,
  selectedRoomBookings,
  bookingId,
}) => {
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [currentSelection, setCurrentSelection] = useState([]);
  const [lastSelection, setLastSelection] = useState([]);
  const [dates, setDates] = useState([]);
  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);

  // 🔍 Booking lookup
  const getBooking = (date, roomId) =>
    roomBookings?.find(
      (b) =>
        b.date === date &&
        Number(b.room.id) === Number(roomId) &&
        Number(b.bookingId) !== Number(bookingId)
    );

  // 🎯 Cell click handler
  const handleCellClick = (date, room) => {
    const isPreBooked = getBooking(date, room.id);
    if (isPreBooked) return;

    const alreadySelected = selectedRoomBookings.find(
      (c) => c.date === date && c.roomId === room.id
    );

    const isInCurrentSelection = currentSelection.find(
      (c) => c.date === date && c.roomId === room.id
    );

    if (isInCurrentSelection) {
      setCurrentSelection((prev) =>
        prev.filter((c) => c.date !== date || c.roomId !== room.id)
      );
    } else if (!alreadySelected) {
      setCurrentSelection((prev) => [
        ...prev,
        { date, roomId: room.id, room: { ...room } },
      ]);
    }

    if (alreadySelected) {
      confirmDeselection([{ date, roomId: room.id }], false);
      return;
    }

    if (!isMultiSelect) {
      setPrice("");
      toggleModal();
    }
  };

  const confirmDeselection = (cellsToDeselect, isMulti) => {
    Swal.fire({
      title: isMulti
        ? "¿Desea deseleccionar las celdas?"
        : "¿Desea deseleccionar esta celda?",
      text: isMulti
        ? "Perderás los precios asignados a esta selección."
        : "Esta celda se eliminará de tu selección.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, deseleccionar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedRoomBookings((prev) =>
          prev.filter(
            (cell) =>
              !cellsToDeselect.some(
                (d) => d.date === cell.date && d.roomId === cell.roomId
              )
          )
        );
      }
    });
  };

  const handlePriceSubmit = () => {
    if (price && currentSelection) {
      const newSelections = currentSelection.map((cell) => ({
        ...cell,
        price: parseFloat(price),
      }));
      setSelectedRoomBookings((prev) => [...prev, ...newSelections]);
      setLastSelection(newSelections);
      setCurrentSelection([]);
      setPrice("");
      if (isMultiSelect) {
        setIsMultiSelect(false);
      }
      toggleModal();
    }
  };

  // 🔄 Utility buttons
  const toggleModal = () => setModalOpen((prev) => !prev);
  const clearSelection = () => {
    Swal.fire({
      title: "¿Desea borrar toda la selección?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedRoomBookings([]);
        setLastSelection([]);
        setCurrentSelection([]);
        setPrice("");
      }
    });
  };
  const undoLast = () => {
    Swal.fire({
      title: "¿Desea deshacer la última selección?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, deshacer",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedRoomBookings((prev) =>
          prev.filter(
            (cell) =>
              !lastSelection?.some(
                (last) => last.date === cell.date && last.roomId === cell.roomId
              )
          )
        );
        setLastSelection([]);
        setCurrentSelection([]);
      }
    });
  };

  const handlePriceCancel = () => {
    if (!isMultiSelect) {
      setCurrentSelection([]);
    }
    setPrice("");
    toggleModal();
  };

  const handleActivateMultiSelect = () => {
    if (isMultiSelect) {
      setCurrentSelection([]);
    }
    setIsMultiSelect((prev) => !prev);
  };

  const handleRoomHeaderClick = (room) => {
    // Get all available (not booked or selected) dates for this room
    const availableDates = dates.filter((date) => {
      const isAlreadyBooked = getBooking(date, room.id);
      const isAlreadySelected = selectedRoomBookings.some(
        (s) => s.date === date && s.roomId === room.id
      );
      return !isAlreadyBooked && !isAlreadySelected;
    });

    // Build a list of those date+roomId pairs
    const roomCells = availableDates.map((date) => ({
      date,
      roomId: room.id,
      room: { ...room },
    }));

    // Check how many of those are already in currentSelection
    const allAlreadyInSelection = roomCells.every((cell) =>
      currentSelection.some(
        (sel) => sel.date === cell.date && sel.roomId === cell.roomId
      )
    );

    if (allAlreadyInSelection) {
      // Deselect them
      setCurrentSelection((prev) =>
        prev.filter(
          (sel) => sel.roomId !== room.id || !availableDates.includes(sel.date)
        )
      );
    } else {
      // Add missing ones
      const newCells = roomCells.filter(
        (cell) =>
          !currentSelection.some(
            (sel) => sel.date === cell.date && sel.roomId === cell.roomId
          )
      );
      setCurrentSelection((prev) => [...prev, ...newCells]);
    }

    setIsMultiSelect(true);
  };

  // 🔁 Date range
  useEffect(() => {
    const dateList = [];
    let current = dayjs(startDate);
    while (
      current.isBefore(dayjs(endDate)) ||
      current.isSame(dayjs(endDate).subtract(1, "day"))
    ) {
      dateList.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }
    setDates(dateList);
    setCurrentSelection([]);
  }, [startDate, endDate]);

  // 🆕 Ctrl key handler for multi-select
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && !isMultiSelect) {
        setIsMultiSelect(true);
        setIsCtrlKeyPressed(true);
      }
    };

    const handleKeyUp = (event) => {
      if (!event.ctrlKey && isMultiSelect && isCtrlKeyPressed) {
        if (currentSelection.length > 0) {
          toggleModal();
        } else {
          setIsMultiSelect(false);
        }
      }
      setIsCtrlKeyPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isMultiSelect, currentSelection, isCtrlKeyPressed]);

  return (
    <Container fluid className="mt-4 px-0">
      <>
        <h5>Seleccione las habitaciones y fechas</h5>
        <div className="bg-light p-2 rounded mb-3">
          <p className="text-muted fw-bold">
            Haga clic en las celdas para seleccionar habitaciones y fechas.
            Puede seleccionar varias celdas oprimiendo el botón{" "}
            <span className="text-info">"Activar Multi-Selección"</span>, o
            presionando la tecla "Ctrl" mientras hace clic en las celdas.
          </p>
          <p className="fw-bold text-info">
            ℹ️ Debe seleccionar al menos una habitación para cada una de las
            noches en el rango de fechas.
          </p>
        </div>

        <Row className="mb-3">
          <Col>
            <button
              type="button"
              className={classNames({
                "btn-outline-danger": isMultiSelect,
                "btn-primary": !isMultiSelect,
                btn: true,
              })}
              onClick={handleActivateMultiSelect}
              disabled={isCtrlKeyPressed}>
              {isMultiSelect
                ? "Cancelar Multi-Selección"
                : "Activar Multi-Selección"}
            </button>
            {isMultiSelect &&
              !isCtrlKeyPressed &&
              currentSelection.length > 0 && (
                <Button
                  type="button"
                  color="success"
                  className="ms-2"
                  onClick={toggleModal}>
                  Finalizar Selección
                </Button>
              )}
          </Col>
          <Col className="text-end">
            {lastSelection.length > 0 && (
              <Button
                type="button"
                color="secondary"
                className="ms-2"
                onClick={undoLast}>
                Deshacer Última Selección
              </Button>
            )}
            {selectedRoomBookings.length > 0 && (
              <Button
                type="button"
                color="warning"
                className="ms-2"
                onClick={clearSelection}>
                Borrar Todo
              </Button>
            )}
          </Col>
        </Row>

        <div
          style={{
            overflow: "auto",
            maxHeight: "600px",
            position: "relative",
          }}>
          <Table bordered className="table-fixed">
            <thead className="sticky-top" style={{ zIndex: 2 }}>
              <tr>
                <th className="date-row-label text-bg-dark">Fecha</th>
                {rooms.map((room) => (
                  <th
                    key={room.id}
                    className="text-center align-middle booking-table-cell-container text-bg-dark"
                    role="button"
                    onClick={() => handleRoomHeaderClick(room)}>
                    <span className="booking-table-cell-text">{room.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date}>
                  <td className="date-row-label text-bg-light">
                    {dayjs(date).format("ddd DD - MMM - YYYY")}
                  </td>
                  {rooms.map((room) => {
                    const booking = getBooking(date, room.id);
                    const currentSelected = currentSelection.find(
                      (c) => c.date === date && c.roomId === room.id
                    );
                    const selected = selectedRoomBookings.find(
                      (c) =>
                        c.date === date &&
                        (c.roomId === room.id || c.room?.id === room.id)
                    );
                    return (
                      <td
                        key={room.id}
                        className={`text-center booking-table-cell-container ${
                          booking
                            ? "bg-secondary text-white"
                            : selected
                            ? "bg-success-subtle text-success-emphasis"
                            : currentSelected
                            ? "bg-success text-white"
                            : ""
                        }`}
                        style={{
                          cursor: booking ? "not-allowed" : "pointer",
                        }}
                        onClick={() => handleCellClick(date, room)}>
                        {booking ? (
                          `$${booking.price.toFixed(2)}`
                        ) : selected?.price ? (
                          `$${selected.price.toFixed(2)}`
                        ) : currentSelected?.roomId ? (
                          "seleccionado"
                        ) : (
                          <span className="booking-table-cell-text text-secondary">
                            <FontAwesomeIcon icon={faCalendarPlus} />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* 💬 Modal */}
        <Modal
          isOpen={modalOpen}
          toggle={toggleModal}
          backdrop="static"
          autoFocus={false}>
          <ModalHeader>Ingresar Precio</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handlePriceSubmit();
              }}>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ingrese el precio"
                min="0"
                step="0.01"
                autoFocus={true}
              />
              <div className="d-flex justify-content-end mt-3">
                <Button
                  className="me-2"
                  color="primary"
                  type="submit"
                  disabled={!price}>
                  Guardar
                </Button>
                <Button
                  type="button"
                  color="secondary"
                  onClick={handlePriceCancel}>
                  Cancelar
                </Button>
              </div>
            </Form>
          </ModalBody>
        </Modal>
      </>
    </Container>
  );
};

// 🧾 PropTypes
RoomBookingTable.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  roomBookings: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      room: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
      bookingId: PropTypes.number,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  setSelectedRoomBookings: PropTypes.func.isRequired,
  selectedRoomBookings: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      roomId: PropTypes.number.isRequired,
      price: PropTypes.number,
    })
  ).isRequired,
  bookingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default RoomBookingTable;

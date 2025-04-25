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
  ModalFooter,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import Swal from "sweetalert2";

const RoomBookingTable = ({
  startDate,
  endDate,
  rooms,
  roomBookings,
  setSelectedRoomBookings,
  isDisabled,
  bookingId,
}) => {
  const currentBookings =
    roomBookings?.length > 0
      ? roomBookings?.filter((b) => Number(b.bookingId) === Number(bookingId))
      : [];

  const [selectedCells, setSelectedCells] = useState([...currentBookings]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [currentSelection, setCurrentSelection] = useState([]);
  const [lastSelection, setLastSelection] = useState([]);
  const [dates, setDates] = useState([]);

  // 🔍 Booking lookup
  const getBooking = (date, roomId) =>
    roomBookings?.find(
      (b) =>
        b.date === date &&
        Number(b.room.id) === Number(roomId) &&
        Number(b.bookingId) !== Number(bookingId)
    );

  // 🎯 Cell click handler
  const handleCellClick = (date, roomId) => {
    const isPreBooked = getBooking(date, roomId);
    if (isPreBooked) return;

    const alreadySelected = selectedCells.find(
      (c) => c.date === date && c.roomId === roomId
    );

    const isInCurrentSelection = currentSelection.find(
      (c) => c.date === date && c.roomId === roomId
    );

    if (isInCurrentSelection) {
      setCurrentSelection((prev) =>
        prev.filter((c) => c.date !== date || c.roomId !== roomId)
      );
    } else if (!alreadySelected) {
      setCurrentSelection((prev) => [...prev, { date, roomId }]);
    }

    if (alreadySelected) {
      confirmDeselection([{ date, roomId }], false);
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
        setSelectedCells((prev) =>
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
      setSelectedCells((prev) => [...prev, ...newSelections]);
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
  const toggleModal = () => setModalOpen(!modalOpen);
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
        setSelectedCells([]);
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
        setSelectedCells((prev) =>
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
  }, [startDate, endDate]);

  useEffect(() => {
    setSelectedRoomBookings(
      selectedCells.map((cell) => ({ ...cell, price: cell.price }))
    );
  }, [selectedCells, setSelectedRoomBookings]);

  useEffect(() => {});

  return (
    <Container fluid className="mt-4 px-0">
      {isDisabled ? (
        <div className="alert alert-warning text-center" role="alert">
          <strong>Selección de habitaciones desactivada</strong>
          <p className="mb-0">
            No se puede seleccionar habitaciones en este momento.
          </p>
        </div>
      ) : (
        <>
          <h5>Seleccione las habitaciones y fechas</h5>
          <p className="text-muted fw-bold bg-light p-2 rounded">
            Haga clic en las celdas para seleccionar habitaciones y fechas.
            Puede seleccionar varias celdas oprimiendo el botón{" "}
            <span style={{ color: "blue" }}>"Activar Multi-Selección"</span>, o
            presionando la tecla "Ctrl" mientras hace clic en las celdas.
          </p>
          <Row className="mb-3">
            <Col>
              <button
                className={classNames({
                  "btn-outline-danger": isMultiSelect,
                  "btn-primary": !isMultiSelect,
                  btn: true,
                })}
                onClick={handleActivateMultiSelect}>
                {isMultiSelect
                  ? "Cancelar Multi-Selección"
                  : "Activar Multi-Selección"}
              </button>
              {isMultiSelect && currentSelection.length > 0 && (
                <Button color="success" className="ms-2" onClick={toggleModal}>
                  Finalizar Selección
                </Button>
              )}
            </Col>
            <Col className="text-end">
              {lastSelection.length > 0 && (
                <Button color="secondary" className="ms-2" onClick={undoLast}>
                  Deshacer Última Selección
                </Button>
              )}
              {selectedCells.length > 0 && (
                <Button
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
              <thead className="sticky-top bg-white" style={{ zIndex: 2 }}>
                <tr>
                  <th
                    style={{
                      width: "150px",
                      position: "sticky",
                      left: 0,
                      background: "#fff",
                      textAlign: "center",
                    }}>
                    Fecha
                  </th>
                  {rooms.map((room) => (
                    <th
                      key={room.id}
                      className="text-center"
                      style={{ minWidth: "120px" }}>
                      {room.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map((date) => (
                  <tr key={date}>
                    <td
                      style={{
                        width: "200px",
                        fontWeight: "bold",
                        position: "sticky",
                        left: 0,
                        background: "#f8f9fa",
                        textAlign: "center",
                      }}>
                      {dayjs(date).format("ddd DD - MMM - YYYY")}
                    </td>
                    {rooms.map((room) => {
                      const booking = getBooking(date, room.id);
                      const currentSelected = currentSelection.find(
                        (c) => c.date === date && c.roomId === room.id
                      );
                      const selected = selectedCells.find(
                        (c) =>
                          c.date === date &&
                          (c.roomId === room.id || c.room?.id === room.id)
                      );
                      return (
                        <td
                          key={room.id}
                          className={`text-center ${
                            booking
                              ? "bg-secondary text-white"
                              : selected
                              ? "bg-warning"
                              : currentSelected
                              ? "bg-success text-white"
                              : ""
                          }`}
                          style={{
                            cursor: booking ? "not-allowed" : "pointer",
                            minWidth: "120px",
                          }}
                          onClick={() => handleCellClick(date, room.id)}>
                          {booking
                            ? `$${booking.price.toFixed(2)}`
                            : selected?.price
                            ? `$${selected.price.toFixed(2)}`
                            : currentSelected?.roomId
                            ? "seleccionado"
                            : "➕"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* 💬 Modal */}
          <Modal isOpen={modalOpen} toggle={toggleModal} backdrop="static">
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
                onClick={handlePriceSubmit}
                disabled={!price}>
                Guardar
              </Button>
              <Button color="secondary" onClick={handlePriceCancel}>
                Cancelar
              </Button>
            </ModalFooter>
          </Modal>
        </>
      )}
    </Container>
  );
};

// 🧾 PropTypes
RoomBookingTable.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
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
      bookingId: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default RoomBookingTable;

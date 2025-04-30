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
import Swal from "sweetalert2";

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
  const handleCellClick = (date, roomId) => {
    const isPreBooked = getBooking(date, roomId);
    if (isPreBooked) return;

    const alreadySelected = selectedRoomBookings.find(
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
        <p className="text-muted fw-bold bg-light p-2 rounded">
          Haga clic en las celdas para seleccionar habitaciones y fechas. Puede
          seleccionar varias celdas oprimiendo el botón{" "}
          <span style={{ color: "blue" }}>"Activar Multi-Selección"</span>, o
          presionando la tecla "Ctrl" mientras hace clic en las celdas.
        </p>
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
                    const selected = selectedRoomBookings.find(
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
        <Modal
          isOpen={modalOpen}
          toggle={toggleModal}
          backdrop="static"
          autoFocus={false}>
          <ModalHeader toggle={toggleModal}>Ingresar Precio</ModalHeader>
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

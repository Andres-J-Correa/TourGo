// 🧠 Required imports (same as before)
import React, { useState, useEffect, useMemo } from "react";
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
import BookingRow from "./BookingRow";
import RoomHeader from "./RoomHeader";
import "./RoomBookingTable.css"; // Custom styles for the table
import { useLanguage } from "contexts/LanguageContext"; // add import
import { useNumericFormat } from "react-number-format";

const RoomBookingTable = ({
  startDate,
  endDate,
  rooms,
  roomBookings,
  setSelectedRoomBookings,
  selectedRoomBookings,
  bookingId,
  roomAvailability,
}) => {
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [currentSelection, setCurrentSelection] = useState([]);
  const [lastSelection, setLastSelection] = useState([]);
  const [dates, setDates] = useState([]);
  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
  const { t } = useLanguage(); // add hook

  const prevAndNextDays = useMemo(() => {
    const start = dayjs(startDate).subtract(1, "day").format("YYYY-MM-DD");
    const end = dayjs(endDate).format("YYYY-MM-DD");
    return { start, end };
  }, [startDate, endDate]);

  const roomAvailabilityByDateAndRoom = useMemo(() => {
    const roomAvailabilityByDate = {};

    roomAvailability.forEach((availability) => {
      if (availability.roomId && availability.date) {
        //check if the date exists in the roomAvailabilityByDate
        if (!roomAvailabilityByDate[availability.date]) {
          //if not, create it and initialize with the room id and availability
          roomAvailabilityByDate[availability.date] = {
            [availability.roomId]: availability,
          };
          return;
        }

        //if the date exists, check if the room id exists
        if (!roomAvailabilityByDate[availability.date][availability.roomId]) {
          //if not, create it and initialize with the availability
          roomAvailabilityByDate[availability.date][availability.roomId] =
            availability;
        }
      }
    });

    return roomAvailabilityByDate;
  }, [roomAvailability]);

  const { format, removeFormatting } = useNumericFormat({
    thousandSeparator: ".",
    decimalSeparator: ",",
  });

  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = removeFormatting(rawValue);
    setPrice(numericValue);
  };

  // 🔍 Booking lookup
  const getBooking = (date, roomId) =>
    roomBookings?.find(
      (b) =>
        b.date === date &&
        Number(b.room.id) === Number(roomId) &&
        b.bookingId !== bookingId
    );

  // 🎯 Cell click handler
  const handleCellClick = (date, room, disabled) => {
    if (disabled) return;

    const isPreBooked = getBooking(date, room.id);
    if (isPreBooked) return;

    const isOpen =
      roomAvailabilityByDateAndRoom[date]?.[room.id]?.isOpen ?? true;

    if (!isOpen) return;

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
        ? t("booking.table.deselectCellsTitle")
        : t("booking.table.deselectCellTitle"),
      text: isMulti
        ? t("booking.table.deselectCellsText")
        : t("booking.table.deselectCellText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.table.deselectConfirm"),
      cancelButtonText: t("common.cancel"),
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
      title: t("booking.table.clearSelectionTitle"),
      text: t("booking.table.clearSelectionText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.table.clearSelectionConfirm"),
      cancelButtonText: t("common.cancel"),
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
      title: t("booking.table.undoLastTitle"),
      text: t("booking.table.undoLastText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.table.undoLastConfirm"),
      cancelButtonText: t("common.cancel"),
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
      const isOpen =
        roomAvailabilityByDateAndRoom?.[date]?.[room.id]?.isOpen ?? true;
      return !isAlreadyBooked && !isAlreadySelected && isOpen;
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
        <h5>{t("booking.table.selectRoomsDatesTitle")}</h5>
        <div className="bg-light p-2 rounded mb-3">
          <p className="text-muted fw-bold">
            {t("booking.table.selectRoomsDatesHelp1")}
            <span className="text-info">{`"${t(
              "booking.table.activateMultiSelect"
            )}"`}</span>
            {t("booking.table.selectRoomsDatesHelp2")}
          </p>
          <p className="fw-bold text-info">
            {t("booking.table.selectRoomsDatesHelp3")}
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
                ? t("booking.table.cancelMultiSelect")
                : t("booking.table.activateMultiSelect")}
            </button>
            {isMultiSelect &&
              !isCtrlKeyPressed &&
              currentSelection.length > 0 && (
                <Button
                  type="button"
                  color="success"
                  className="ms-2"
                  onClick={toggleModal}>
                  {t("booking.table.finishSelection")}
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
                {t("booking.table.undoLast")}
              </Button>
            )}
            {selectedRoomBookings.length > 0 && (
              <Button
                type="button"
                color="warning"
                className="ms-2"
                onClick={clearSelection}>
                {t("booking.table.clearAll")}
              </Button>
            )}
          </Col>
        </Row>

        <div className="bookings-table-container">
          <Row>
            <Col className="text-center text-dark fw-bold">
              {t("booking.table.reserving", {
                start: dayjs(startDate).format("DD/MM/YYYY"),
                end: dayjs(endDate).format("DD/MM/YYYY"),
                nights: dates.length,
              })}
            </Col>
          </Row>
          <Table bordered className="table-fixed">
            <thead className="sticky-top">
              <tr>
                <th className="date-row-label text-bg-dark">Fecha</th>
                {rooms.map((room) => (
                  <RoomHeader
                    key={room.id}
                    room={room}
                    onRoomHeaderClick={handleRoomHeaderClick}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              <BookingRow
                date={prevAndNextDays.start}
                rooms={rooms}
                getBooking={getBooking}
                currentSelection={currentSelection}
                selectedRoomBookings={selectedRoomBookings}
                onCellClick={handleCellClick}
                disabled={true}
                roomAvailabilityByDateAndRoom={roomAvailabilityByDateAndRoom}
              />
              {dates.map((date) => (
                <BookingRow
                  key={`${date}-date-row`}
                  date={date}
                  rooms={rooms}
                  getBooking={getBooking}
                  currentSelection={currentSelection}
                  selectedRoomBookings={selectedRoomBookings}
                  onCellClick={handleCellClick}
                  roomAvailabilityByDateAndRoom={roomAvailabilityByDateAndRoom}
                />
              ))}
              <BookingRow
                date={prevAndNextDays.end}
                rooms={rooms}
                getBooking={getBooking}
                currentSelection={currentSelection}
                selectedRoomBookings={selectedRoomBookings}
                onCellClick={handleCellClick}
                disabled={true}
                roomAvailabilityByDateAndRoom={roomAvailabilityByDateAndRoom}
              />
            </tbody>
          </Table>
        </div>

        {/* 💬 Modal */}
        <Modal
          isOpen={modalOpen}
          toggle={toggleModal}
          backdrop="static"
          autoFocus={false}>
          <ModalHeader>{t("booking.table.enterPrice")}</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handlePriceSubmit();
              }}>
              <Input
                type="text"
                value={format(price)}
                onChange={handlePriceChange}
                placeholder={t("booking.table.pricePlaceholder")}
                autoFocus={true}
              />
              <div className="d-flex justify-content-end mt-3">
                <Button
                  className="me-2"
                  color="primary"
                  type="submit"
                  disabled={!price}>
                  {t("common.ok")}
                </Button>
                <Button
                  type="button"
                  color="secondary"
                  onClick={handlePriceCancel}>
                  {t("common.cancel")}
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

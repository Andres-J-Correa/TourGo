import React from "react";

const RoomHeader = ({ room, onRoomHeaderClick }) => (
  <th
    key={room.id}
    className="text-center align-middle booking-table-cell-container text-bg-dark"
    role="button"
    onClick={() => onRoomHeaderClick(room)}>
    <span className="booking-table-cell-text">{room.name}</span>
  </th>
);

export default RoomHeader;

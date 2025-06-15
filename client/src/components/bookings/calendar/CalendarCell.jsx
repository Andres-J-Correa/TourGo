import React, { useState, Fragment } from "react";

import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";

import { formatCurrency } from "utils/currencyHelper";

function CalendarCell({ name, price, bookingId, hotelId }) {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false);

  const toggleOffCanvas = () => setOffCanvasOpen((prev) => !prev);

  return (
    <Fragment>
      <BookingViewOffCanvas
        offCanvasOpen={offCanvasOpen}
        handleToggleOffcanvas={toggleOffCanvas}
        bookingId={bookingId}
        hotelId={hotelId}
      />
      <div className="text-center cursor-pointer" onClick={toggleOffCanvas}>
        <p title={name} className="text-truncate m-0" style={{ maxWidth: 110 }}>
          {name}
        </p>
        <span className={`text-center cursor-pointer`}>
          {formatCurrency(price, "COP")}
        </span>
      </div>
    </Fragment>
  );
}

export default CalendarCell;

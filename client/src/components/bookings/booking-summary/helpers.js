import dayjs from "dayjs";

export function groupRoomBookings(roomBookings) {
  const grouped = {};

  roomBookings?.forEach((b) => {
    const roomId = b.room?.id || b.roomId;
    if (!grouped[roomId]) grouped[roomId] = [];
    grouped[roomId].push(b);
  });

  return Object.values(grouped).map((bookings) => {
    const roomName = bookings[0]?.room?.name;
    bookings.sort((a, b) => dayjs(a.date) - dayjs(b.date));
    return {
      roomName,
      segments: bookings.map((b) => ({ date: b.date, price: b.price })),
    };
  });
}

export function calculateRoomCharges(extraCharges, subtotal, nights) {
  return extraCharges?.map((charge) => {
    let amount = 0;
    switch (Number(charge.type.id)) {
      case 1:
        amount = subtotal * charge.amount;
        break;
      case 2:
        amount = charge.amount * nights;
        break;
      case 3:
        amount = charge.amount;
        break;
      default:
        amount = 0;
        break;
    }
    return { ...charge, total: amount };
  });
}

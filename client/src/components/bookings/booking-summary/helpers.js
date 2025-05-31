import dayjs from "dayjs";
import {
  EXTRA_CHARGE_TYPE_IDS,
  GENERAL_CHARGE_TYPES,
} from "components/extra-charges/constants";

export function groupRoomBookings(roomBookings) {
  const grouped = {};

  roomBookings?.forEach((b) => {
    const roomId = b.room?.id || b.roomId;
    if (!grouped[roomId]) grouped[roomId] = [];
    grouped[roomId].push(b);
  });

  return Object.values(grouped).map((bookings) => {
    const roomName = bookings[0]?.room?.name;
    const roomDescription = bookings[0]?.room?.description || "";
    bookings.sort((a, b) => dayjs(a.date) - dayjs(b.date));
    return {
      roomName,
      roomDescription,
      segments: bookings.map((b) => ({ date: b.date, price: b.price })),
    };
  });
}

export function calculateRoomCharges(extraCharges, subtotal, nights) {
  return extraCharges
    ?.filter((charge) => !GENERAL_CHARGE_TYPES.includes(charge.type.id))
    ?.map((charge) => {
      let amount = 0;
      switch (Number(charge.type.id)) {
        case EXTRA_CHARGE_TYPE_IDS.PERCENTAGE:
          amount = subtotal * charge.amount;
          break;
        case EXTRA_CHARGE_TYPE_IDS.DAILY:
          amount = charge.amount * nights;
          break;
        case EXTRA_CHARGE_TYPE_IDS.PER_ROOM:
          amount = charge.amount;
          break;
        default:
          amount = 0;
          break;
      }
      return { ...charge, total: amount };
    });
}

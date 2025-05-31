import { useMemo } from "react";
import { EXTRA_CHARGE_TYPE_IDS } from "components/extra-charges/constants";

export default function useBookingTotals(
  formData,
  selectedRoomBookings,
  selectedCharges,
  personalizedCharges
) {
  const totals = useMemo(() => {
    const subtotal =
      selectedRoomBookings.length > 0
        ? selectedRoomBookings?.reduce((acc, booking) => {
            return acc + (booking?.price || 0);
          }, 0)
        : 0;

    let chargesTotal =
      selectedCharges.length > 0
        ? selectedCharges?.reduce((acc, charge) => {
            switch (charge.type.id) {
              case EXTRA_CHARGE_TYPE_IDS.PERCENTAGE:
                return acc + subtotal * charge.amount;
              case EXTRA_CHARGE_TYPE_IDS.DAILY:
                return acc + charge.amount * selectedRoomBookings.length;
              case EXTRA_CHARGE_TYPE_IDS.PER_ROOM: {
                const selectedRooms = new Set(
                  selectedRoomBookings.map((booking) => booking.roomId)
                );
                return acc + charge.amount * selectedRooms.size;
              }
              case EXTRA_CHARGE_TYPE_IDS.GENERAL:
                return acc + charge.amount;
              case EXTRA_CHARGE_TYPE_IDS.PER_PERSON: {
                return acc + charge.amount * (formData?.adultGuests || 0);
              }
              default:
                return acc;
            }
          }, 0)
        : 0;

    if (personalizedCharges?.length > 0) {
      chargesTotal += personalizedCharges.reduce((acc, charge) => {
        return acc + charge.amount;
      }, 0);
    }

    return {
      subtotal,
      charges: chargesTotal,
      total: subtotal + chargesTotal,
    };
  }, [selectedRoomBookings, selectedCharges, formData, personalizedCharges]);

  return totals;
}

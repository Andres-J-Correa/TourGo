import { useMemo } from "react";

export default function useBookingTotals(
  selectedRoomBookings,
  selectedCharges
) {
  const totals = useMemo(() => {
    const subtotal = selectedRoomBookings.reduce((acc, booking) => {
      return acc + (booking?.price || 0);
    }, 0);

    const chargesTotal = selectedCharges.reduce((acc, charge) => {
      if (charge.type === 1) {
        // Percentage of subtotal
        return acc + subtotal * charge.amount;
      }
      if (charge.type === 2) {
        // Per booking
        return acc + charge.amount * selectedRoomBookings.length;
      }
      // Fixed amount
      return acc + charge.amount;
    }, 0);

    return {
      subtotal,
      charges: chargesTotal,
      total: subtotal + chargesTotal,
    };
  }, [selectedRoomBookings, selectedCharges]);

  return totals;
}

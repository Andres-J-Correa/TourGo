import { useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  updateStatusToCheckedIn,
  updateStatusToCompleted,
} from "services/bookingService";
import { leaveHotel } from "services/staffService";
import { BOOKING_STATUS_IDS } from "components/bookings/constants";
import {
  type HotelDashboardData,
  type BookingArrivalItem,
  type BookingDepartureItem,
} from "../types";

export const useHotelActions = (
  hotelId: string | undefined,
  t: (key: string) => string,
  setData: React.Dispatch<React.SetStateAction<HotelDashboardData>>
) => {
  const navigate = useNavigate();

  const handleLeaveHotel = async () => {
    if (!hotelId) return;

    const result = await Swal.fire({
      title: t("hotels.landing.leaveTitle"),
      text: t("hotels.landing.leaveText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("hotels.landing.leaveConfirm"),
      cancelButtonText: t("hotels.landing.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: t("hotels.landing.processing"),
        text: t("hotels.landing.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await leaveHotel(hotelId);
      if (res.isSuccessful) {
        Swal.fire({
          icon: "success",
          title: t("hotels.landing.leftTitle"),
          text: t("hotels.landing.leftText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
        navigate("/hotels");
      }
    } catch {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("hotels.landing.leaveError"),
      });
    }
  };

  const handleCheckIn = useCallback(
    async (booking: BookingArrivalItem) => {
      if (!hotelId) return;

      let swalText = t("hotels.landing.checkInText");
      let swalTitle = t("hotels.landing.checkInTitle");
      let hasBalanceDue = booking.balanceDue > 0;
      if (hasBalanceDue) {
        swalText = t("hotels.landing.checkInBalanceDueText");
        swalTitle = t("hotels.landing.checkInBalanceDueTitle");
      }

      const result = await Swal.fire({
        title: swalTitle,
        text: swalText,
        icon: hasBalanceDue ? "warning" : "info",
        showCancelButton: true,
        confirmButtonText: t("hotels.landing.confirmYes"),
        cancelButtonText: t("hotels.landing.cancel"),
        reverseButtons: hasBalanceDue,
        confirmButtonColor: hasBalanceDue ? "red" : "#0d6efd",
        didOpen: () => {
          if (hasBalanceDue) {
            const confirmBtn = Swal.getConfirmButton();
            if (confirmBtn) {
              confirmBtn.style.display = "none";
            }
            Swal.showLoading();
            setTimeout(() => {
              if (Swal.isVisible()) {
                const confirmBtn = Swal.getConfirmButton();
                if (confirmBtn) {
                  confirmBtn.style.display = "inline-block";
                }
                Swal.hideLoading();
              }
            }, 2000);
          }
        },
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: t("hotels.landing.loading"),
          text: t("hotels.landing.pleaseWait"),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await updateStatusToCheckedIn(booking.id, hotelId);
        if (res.isSuccessful) {
          setData((prevData) => ({
            ...prevData,
            arrivals: prevData.arrivals.map((arrival) =>
              arrival.id === booking.id
                ? { ...arrival, statusId: BOOKING_STATUS_IDS.ARRIVED }
                : arrival
            ),
          }));

          Swal.fire({
            title: t("hotels.landing.success"),
            text: t("hotels.landing.checkInSuccess"),
            icon: "success",
            confirmButtonText: t("hotels.landing.ok"),
          });
        } else {
          throw new Error("Error al marcar como check-in");
        }
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: t("hotels.landing.checkInError"),
        });
      }
    },
    [hotelId, t, setData]
  );

  const handleComplete = useCallback(
    async (booking: BookingDepartureItem) => {
      if (!hotelId) return;

      const result = await Swal.fire({
        title: t("hotels.landing.completeTitle"),
        text: t("hotels.landing.completeText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("hotels.landing.confirmYes"),
        cancelButtonText: t("hotels.landing.cancel"),
        reverseButtons: true,
        confirmButtonColor: "green",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: t("hotels.landing.loading"),
          text: t("hotels.landing.pleaseWait"),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await updateStatusToCompleted(booking.id, hotelId);
        if (res.isSuccessful) {
          setData((prevData) => ({
            ...prevData,
            departures: prevData.departures.map((departure) =>
              departure.id === booking.id
                ? { ...departure, statusId: BOOKING_STATUS_IDS.COMPLETED }
                : departure
            ),
          }));

          Swal.fire({
            title: t("hotels.landing.success"),
            text: t("hotels.landing.completeSuccess"),
            icon: "success",
            confirmButtonText: t("hotels.landing.ok"),
          });
        } else {
          throw new Error("Error al marcar como completada");
        }
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: t("hotels.landing.completeError"),
        });
      }
    },
    [hotelId, t, setData]
  );

  return {
    handleLeaveHotel,
    handleCheckIn,
    handleComplete,
  };
};

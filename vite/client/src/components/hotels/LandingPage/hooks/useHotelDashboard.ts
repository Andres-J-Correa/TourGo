import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getArrivals,
  getDepartures,
  getArrivingRooms,
  getDepartingRooms,
  getStays,
  getForCleaningRooms,
} from "services/bookingService";
import { getAvailableRoomsByDate } from "services/roomService";
import { type HotelDashboardData } from "../types";

// Helper to handle promise results
const getValueOrNull = <T>(result: PromiseSettledResult<T>): T | null => {
  if (result.status === "fulfilled") {
    // @ts-ignore
    return result.value?.items || [];
  }
  return null;
};

export const useHotelDashboard = (
  hotelId: string | undefined,
  date: string
) => {
  const [data, setData] = useState<HotelDashboardData>({
    arrivals: [],
    departures: [],
    stays: [],
    arrivingRooms: [],
    departingRooms: [],
    forCleaningRooms: [],
    availableRooms: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotelId) return;

    setLoading(true);

    Promise.allSettled([
      getArrivals(hotelId, date),
      getDepartures(hotelId, date),
      getArrivingRooms(hotelId, date),
      getDepartingRooms(hotelId, date),
      getStays(hotelId, date),
      getForCleaningRooms(hotelId, date),
      getAvailableRoomsByDate(hotelId, date),
    ])
      .then(
        ([
          arrivalsResult,
          departuresResult,
          arrivingRoomsResult,
          departingRoomsResult,
          staysResult,
          forCleaningRoomsResult,
          availableRoomsResult,
        ]) => {
          const errors: string[] = [];

          const arrivals = getValueOrNull(arrivalsResult);
          if (
            arrivals === null &&
            arrivalsResult.status === "rejected" &&
            (arrivalsResult as any).reason?.response?.status !== 404
          )
            errors.push("Error loading arrivals");

          const departures = getValueOrNull(departuresResult);
          if (
            departures === null &&
            departuresResult.status === "rejected" &&
            (departuresResult as any).reason?.response?.status !== 404
          )
            errors.push("Error loading departures");

          const arrivingRooms = getValueOrNull(arrivingRoomsResult);
          if (
            arrivingRooms === null &&
            arrivingRoomsResult.status === "rejected" &&
            (arrivingRoomsResult as any).reason?.response?.status !== 404
          )
            errors.push("Error loading arriving rooms");

          const departingRooms = getValueOrNull(departingRoomsResult);
          if (
            departingRooms === null &&
            departingRoomsResult.status === "rejected" &&
            (departingRoomsResult as any).reason?.response?.status !== 404
          )
            errors.push("Error loading departing rooms");

          const stays = getValueOrNull(staysResult);
          if (
            stays === null &&
            staysResult.status === "rejected" &&
            (staysResult as any).reason?.response?.status !== 404
          )
            errors.push("'Error loading stays");

          const forCleaningRooms = getValueOrNull(forCleaningRoomsResult);
          if (
            forCleaningRooms === null &&
            forCleaningRoomsResult.status === "rejected" &&
            (forCleaningRoomsResult as any).reason?.response?.status !== 404
          )
            errors.push("Error loading cleaning rooms");

          const availableRooms = getValueOrNull(availableRoomsResult);
          if (
            availableRooms === null &&
            availableRoomsResult.status === "rejected" &&
            (availableRoomsResult as any).reason?.response?.status !== 404
          )
            errors.push("Error loading available rooms");

          setData({
            arrivals: arrivals || [],

            departures: departures || [],

            arrivingRooms: arrivingRooms || [],

            departingRooms: departingRooms || [],

            stays: stays || [],

            forCleaningRooms: forCleaningRooms || [],

            availableRooms: availableRooms || [],
          });

          if (errors.length > 0) {
            toast.error(errors.join(" | "));
          }
        }
      )
      .finally(() => {
        setLoading(false);
      });
  }, [hotelId, date]);

  return { data, setData, loading };
};

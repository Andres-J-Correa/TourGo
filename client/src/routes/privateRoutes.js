import { lazy } from "react";

const hotelRoutes = [
  {
    name: "hotelAccessRequest",
    path: "/hotels/accept-invite/:token",
    component: lazy(() => import("components/hotels/HotelAcceptInvite")),
  },
  {
    name: "hotelsView",
    path: "/hotels",
    component: lazy(() => import("components/hotels/HotelsView")),
  },
  {
    name: "hotelLandingPage",
    path: "/hotels/:hotelId",
    component: lazy(() => import("components/hotels/HotelLandingPage")),
  },
  {
    name: "hotelEdit",
    path: "/hotels/:hotelId/edit",
    component: lazy(() => import("components/hotels/HotelEdit")),
  },
  {
    name: "hotelAdd",
    path: "/hotels/add",
    component: lazy(() => import("components/hotels/HotelAdd")),
  },
];

const roomRoutes = [
  {
    name: "roomsView",
    path: "/hotels/:hotelId/rooms",
    component: lazy(() => import("components/rooms/RoomsView")),
  },
];

const extraCharges = [
  {
    name: "extraChargesView",
    path: "/hotels/:hotelId/extra-charges",
    component: lazy(() => import("components/extra-charges/ExtraChargesView")),
  },
];

const bookings = [
  {
    name: "bookingsView",
    path: "/hotels/:hotelId/bookings",
    component: lazy(() => import("components/bookings/BookingsView")),
  },
  {
    name: "newBooking",
    path: "/hotels/:hotelId/bookings/new",
    component: lazy(() =>
      import("components/bookings/booking-add-edit-view/BookingAddUpdateView")
    ),
  },
  {
    name: "editBooking",
    path: "/hotels/:hotelId/bookings/:bookingId/edit",
    component: lazy(() =>
      import("components/bookings/booking-add-edit-view/BookingAddUpdateView")
    ),
  },
];

export const privateRoutes = [
  ...hotelRoutes,
  ...roomRoutes,
  ...extraCharges,
  ...bookings,
];

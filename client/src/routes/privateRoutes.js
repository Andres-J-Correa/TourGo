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

export const privateRoutes = [...hotelRoutes, ...roomRoutes, ...extraCharges];

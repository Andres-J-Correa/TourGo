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
];

const roomRoutes = [
  {
    name: "roomsView",
    path: "/hotels/:hotelId/rooms",
    component: lazy(() => import("components/rooms/RoomsView")),
  },
];

export const privateRoutes = [...hotelRoutes, ...roomRoutes];

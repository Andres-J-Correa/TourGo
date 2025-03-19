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
    path: "/hotels/:id",
    component: lazy(() => import("components/hotels/HotelLandingPage")),
  },
];

export const privateRoutes = [...hotelRoutes];

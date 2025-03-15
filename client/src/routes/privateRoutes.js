import { lazy } from "react";

const hotelRoutes = [
  {
    name: "hotelAccessRequest",
    path: "/hotels/access-request",
    component: lazy(() => import("components/hotels/HotelAccessRequest")),
  },
];

export const privateRoutes = [...hotelRoutes];

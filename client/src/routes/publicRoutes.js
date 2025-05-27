import { lazy } from "react";

const generalRoutes = [
  {
    name: "404",
    path: "*",
    component: lazy(() => import("components/commonUI/errors/NoRecords404")),
  },
];

const userRoutes = [
  {
    name: "landingPage",
    path: "/",
    component: lazy(() => import("components/LandingPage")),
  },
  {
    name: "resetPassowrd",
    path: "/users/password/reset",
    component: lazy(() => import("components/users/UserPasswordReset")),
  },
];

export const publicRoutes = [...userRoutes, ...generalRoutes];

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
    name: "usersLandingPage",
    path: "/home",
    component: lazy(() => import("components/users/UsersLandingPage")),
  },
  {
    name: "landingPage",
    path: "/",
    component: lazy(() => import("components/LandingPage")),
  },
  {
    name: "changePassword",
    path: "/users/password/change",
    component: lazy(() => import("components/users/UserPasswordChange")),
  },
];

export const publicRoutes = [...userRoutes, ...generalRoutes];

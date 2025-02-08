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
    path: "/",
    component: lazy(() => import("components/users/UsersLandingPage")),
  },
  {
    name: "home",
    path: "/home",
    component: lazy(() => import("components/Home")),
  },
  {
    name: "changePassword",
    path: "/users/password/change",
    component: lazy(() => import("components/users/UserPasswordChange")),
  },
];

export const publicRoutes = [...userRoutes, ...generalRoutes];

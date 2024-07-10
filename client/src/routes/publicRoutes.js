import { lazy } from "react";

export const publicRoutes = [
  {
    name: "home",
    path: "/",
    component: lazy(() => import("components/Home")),
    exact: true,
  },
  {
    name: "changePassword",
    path: "/changePassword",
    component: lazy(() => import("components/client/users/UserPasswordChange")),
    exact: true,
  },
];

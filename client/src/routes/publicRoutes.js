import { lazy } from "react";

export const publicRoutes = [
  {
    index: true,
    Component: lazy(() => import("components/LandingPage")),
  },
  {
    path: "users/password/reset",
    Component: lazy(() => import("components/users/UserPasswordReset")),
  },
];

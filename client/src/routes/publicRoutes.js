import { lazy } from "react";

export const publicRoutes = [
  {
    name: "home",
    path: "/",
    component: lazy(() => import("components/Home")),
    exact: true,
    isAnonymous: true,
  },
];

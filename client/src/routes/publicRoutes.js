import { lazy } from "react";
import Icon from "@mui/material/Icon";

export const publicRoutes = [
  {
    name: "home",
    icon: <Icon>home</Icon>,
    path: "/",
    component: lazy(() => import("components/Home")),
    exact: true,
    isAnonymous: true,
  },
  {
    name: "account",
    icon: <Icon>account_circle</Icon>,
    columns: 1,
    rowsPerColumn: 2,
    collapse: [
      {
        name: "Get started",
        collapse: [
          {
            name: "login",
          },
          {
            name: "sign up",
          },
        ],
      },
    ],
  },
];

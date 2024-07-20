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
    name: "changePassword",
    path: "/users/password/change",
    component: lazy(() => import("components/users/UserPasswordChange")),
  },
];

const providerRoutes = [
  {
    name: "providersLandingPage",
    path: "/provider",
    component: lazy(() => import("components/providers/ProvidersLandingPage")),
  },
  {
    name: "providerSignUp",
    path: "/provider/signup",
    component: lazy(() => import("components/providers/ProvidersSignUpView")),
  },
];

export const publicRoutes = [
  ...userRoutes,
  ...generalRoutes,
  ...providerRoutes,
];

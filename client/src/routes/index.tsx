import { createBrowserRouter } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";

import App from "../App";
import NoRecords404 from "components/commonUI/errors/NoRecords404";
import { privateRoutes } from "./privateRoutes";
import { publicRoutes } from "./publicRoutes";
import { withFaroRouterInstrumentation } from "@grafana/faro-react";

const browserRouter = createBrowserRouter(
  [
    {
      path: "/",
      Component: App,
      errorElement: <NoRecords404 />,
      children: [
        ...publicRoutes,
        {
          element: <ProtectedRoutes />,
          children: privateRoutes,
        },
      ],
    },
  ],
  {
    basename: "/app",
  }
);

export const router = withFaroRouterInstrumentation(browserRouter);

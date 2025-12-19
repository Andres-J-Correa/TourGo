import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import dayjs from "dayjs";
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import {
  createReactRouterV6Options,
  getWebInstrumentations,
  initializeFaro,
  ReactIntegration,
} from "@grafana/faro-react";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

import App from "./App.tsx";

import { AppProviders } from "./providers/AppProvider.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

require("dayjs/locale/es"); // Import Spanish locale
dayjs.locale("es");
registerLocale("es", es);

const env = import.meta.env.VITE_ENV;

if (env !== "development") {
  initializeFaro({
    url: "https://faro-collector-prod-us-east-2.grafana.net/collect/b7ceccb90a4d2a84d177f764ab670090",
    app: {
      name: "TourGo_Prod",
      version: "0.1.0",
      environment: env,
    },

    instrumentations: [
      // Mandatory, omits default instrumentations otherwise.
      ...getWebInstrumentations(),

      // Tracing package to get end-to-end visibility for HTTP requests.
      new TracingInstrumentation(),

      // React integration for React applications.
      new ReactIntegration({
        router: createReactRouterV6Options({
          createRoutesFromChildren,
          matchRoutes,
          Routes,
          useLocation,
          useNavigationType,
        }),
      }),
    ],
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);

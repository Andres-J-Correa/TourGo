import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./contexts/GlobalAppContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import i18n from "./locales/i18n";

import App from "./App";
import "./index.css";

import * as serviceWorker from "./serviceWorker";
import reportWebVitals from "./reportWebVitals";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";

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

require("dayjs/locale/es"); // Import Spanish locale
dayjs.locale("es");
registerLocale("es", es);

const env = process.env.REACT_APP_ENV;

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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter basename="/app">
    <React.StrictMode>
      <LanguageProvider>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          language={i18n.language}>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </GoogleReCaptchaProvider>
      </LanguageProvider>
    </React.StrictMode>
  </BrowserRouter>
);

serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React, { useState, useEffect, Suspense } from "react";

import { HelmetProvider } from "react-helmet-async";

import NavbarContainer from "components/commonUI/navbars/NavbarContainer";
import GlobalErrorHandler from "components/commonUI/errors/GlobalErrorHandler";

import { AppContextProvider } from "./contexts/GlobalAppContext";

import { Routes, Route } from "react-router-dom";
import { publicFlattenedRoutes } from "./routes";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [routes, setRoutes] = useState([]);

  const mapRoute = (route, idx) => (
    <Route
      key={`route-${idx}`}
      path={route.path}
      element={<route.component />}
    />
  );

  useEffect(() => {
    if (routes.length === 0) {
      const mappedRoutes = publicFlattenedRoutes.map(mapRoute);

      setRoutes(mappedRoutes);
    }
  }, [routes]);

  return (
    <HelmetProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AppContextProvider>
          <GlobalErrorHandler>
            <NavbarContainer />
            <Routes>{routes}</Routes>
          </GlobalErrorHandler>
        </AppContextProvider>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="light"
      />
    </HelmetProvider>
  );
};

export default App;

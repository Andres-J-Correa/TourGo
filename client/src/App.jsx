import React, { useState, useEffect, Suspense } from "react";

import { HelmetProvider } from "react-helmet-async";

import NavbarContainer from "components/commonUI/navbars/NavbarContainer";
import GlobalErrorHandler from "components/commonUI/errors/GlobalErrorHandler";

import { useAppContext } from "./contexts/GlobalAppContext";

import { Routes, Route } from "react-router-dom";
import { publicFlattenedRoutes, privateFlattenedRoutes } from "./routes";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [routes, setRoutes] = useState([]);

  const { user } = useAppContext();

  const mapRoute = (route, idx) => (
    <Route
      key={`route-${idx}`}
      path={route.path}
      element={<route.component />}
    />
  );

  useEffect(() => {
    const publicRoutes = publicFlattenedRoutes.map(mapRoute);
    const privateRoutes = privateFlattenedRoutes.map(mapRoute);

    const mappedRoutes = user.current.isAuthenticated
      ? [...privateRoutes, ...publicRoutes]
      : publicRoutes;

    setRoutes(mappedRoutes);
  }, [user]);

  return (
    <HelmetProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <GlobalErrorHandler>
          <NavbarContainer />
          <Routes>{routes}</Routes>
        </GlobalErrorHandler>
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

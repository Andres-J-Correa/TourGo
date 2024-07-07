import React, { useState, useEffect, Suspense } from "react";

import { HelmetProvider } from "react-helmet-async";

import { AppContextProvider } from "./contexts/GlobalAppContext";

import { Routes, Route } from "react-router-dom";
import { publicFlattenedRoutes } from "./routes";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [routes, setRoutes] = useState([]);

  const mapRoutes = (route, idx) => (
    <Route
      key={`route-${idx}`}
      path={route.path}
      exact={route.exact}
      element={<route.component />}
    />
  );

  useEffect(() => {
    if (routes.length === 0) {
      const mappedRoutes = publicFlattenedRoutes.map(mapRoutes);

      setRoutes(mappedRoutes);
    }
  }, [routes]);

  return (
    <HelmetProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AppContextProvider>
          <Routes>{routes}</Routes>
        </AppContextProvider>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={true}
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

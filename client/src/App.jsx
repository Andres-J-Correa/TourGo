import React, { useState, useEffect, Suspense } from "react";

import { Helmet, HelmetProvider } from "react-helmet-async";

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
    const mappedRoutes = publicFlattenedRoutes.map(mapRoutes);

    setRoutes(mappedRoutes);
  }, []);

  return (
    <HelmetProvider>
      <Helmet>
        <title>Tour Go</title>
      </Helmet>

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>{routes}</Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ToastContainer />
    </HelmetProvider>
  );
};

export default App;

import React, { useState, useEffect, Suspense } from "react";

import { HelmetProvider } from "react-helmet-async";
import { Container } from "reactstrap";

import NavbarContainer from "components/commonUI/navbars/NavbarContainer";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

import { useAppContext } from "./contexts/GlobalAppContext";

import { Routes, Route } from "react-router-dom";
import { publicFlattenedRoutes, privateFlattenedRoutes } from "./routes";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { setDefaultLocale, registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";

import dayjs from "dayjs";
import Footer from "components/commonUI/Footer";

require("dayjs/locale/es"); // Import Spanish locale
dayjs.locale("es");
registerLocale("es", es);
setDefaultLocale("es");

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
      <Suspense
        fallback={<LoadingOverlay isVisible={true} message="cargando" />}>
        <LoadingOverlay isVisible={user.isLoading} message="cargando usuario" />
        <NavbarContainer />
        <Container className="mt-4 main-container">
          <Routes>{routes}</Routes>
          <Footer />
        </Container>
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

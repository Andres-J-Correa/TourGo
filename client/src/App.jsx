import React, { useState, useEffect, Suspense, Fragment } from "react";

import { HelmetProvider } from "react-helmet-async";
import { Container } from "reactstrap";

import NavbarContainer from "components/commonUI/navbars/NavbarContainer";
import SiteUnderMaintenance from "components/commonUI/fallback/SiteUnderMaintenance";
import LoadingScreen from "components/commonUI/fallback/LoadingScreen";
import RouteWrapper from "contexts/RouteWrapper";

import { useAppContext } from "./contexts/GlobalAppContext";

import { Routes, Route } from "react-router-dom";
import { publicFlattenedRoutes, privateFlattenedRoutes } from "./routes";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Footer from "components/commonUI/Footer";

const App = () => {
  const [routes, setRoutes] = useState([]);

  const { user, maintenanceMode, hotel } = useAppContext();

  const mapRoute = (route, idx) => (
    <Route
      key={`route-${idx}`}
      path={route.path}
      element={
        <RouteWrapper>
          <route.component />
        </RouteWrapper>
      }
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

  if (user.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <HelmetProvider>
      <Suspense fallback={<LoadingScreen />}>
        {maintenanceMode ? (
          <SiteUnderMaintenance />
        ) : (
          <Fragment>
            <NavbarContainer />
            <Container className="my-4 main-container" fluid>
              <Routes>{routes}</Routes>
            </Container>
            <Footer hotelId={hotel.current.id} />
          </Fragment>
        )}
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

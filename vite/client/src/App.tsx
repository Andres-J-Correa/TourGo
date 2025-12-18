import {
  useState,
  useEffect,
  Suspense,
  Fragment,
  useMemo,
  type JSX,
} from "react";
import { Route, Routes } from "react-router-dom";
import { FaroRoutes } from "@grafana/faro-react";

import { Container } from "reactstrap";
import { ToastContainer } from "react-toastify";

import LoadingScreen from "components/commonUI/fallback/LoadingScreen";
import NavbarContainer from "components/commonUI/navbars/NavbarContainer";
import SiteUnderMaintenance from "components/commonUI/fallback/SiteUnderMaintenance";
import Footer from "components/commonUI/Footer";
import RouteWrapper from "providers/RouteWrapper";
import TaskRemindersListener from "components/hotels/LandingPage/components/TaskRemindersListener";

import { useAppContext } from "./contexts/GlobalAppContext";
import { publicFlattenedRoutes, privateFlattenedRoutes } from "./routes";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const { user, maintenanceMode, hotel } = useAppContext();

  const [routes, setRoutes] = useState<JSX.Element[]>([]);

  const mapRoute = (route: any, idx: any) => (
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

  const RoutesComp = useMemo(
    () => (import.meta.env.VITE_ENV === "development" ? Routes : FaroRoutes),
    []
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

  if (maintenanceMode) {
    return <SiteUnderMaintenance />;
  }

  return (
    <Fragment>
      <Suspense fallback={<LoadingScreen />}>
        <NavbarContainer />
        <Container className="my-4 main-container" fluid>
          <RoutesComp>{routes}</RoutesComp>
        </Container>
        <Footer hotelId={hotel.current.id} />
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

      <TaskRemindersListener />
    </Fragment>
  );
}

export default App;

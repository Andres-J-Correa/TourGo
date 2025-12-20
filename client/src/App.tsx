import { Suspense, Fragment, useEffect } from "react";
import { Outlet, useParams, useNavigation } from "react-router-dom";

import { Container } from "reactstrap";
import { ToastContainer } from "react-toastify";

import LoadingScreen from "components/commonUI/fallback/LoadingScreen";
import NavbarContainer from "components/commonUI/navbars/NavbarContainer";
import SiteUnderMaintenance from "components/commonUI/fallback/SiteUnderMaintenance";
import Footer from "components/commonUI/Footer";
import TaskRemindersListener from "components/hotels/LandingPage/components/TaskRemindersListener";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

import { useAppContext } from "./contexts/GlobalAppContext";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const { user, maintenanceMode, hotel } = useAppContext();

  const { hotelId } = useParams<string>();

  useEffect(() => {
    if (hotelId) {
      hotel.setHotelId(hotelId);
    }
  }, [hotelId]);

  if (maintenanceMode) {
    return <SiteUnderMaintenance />;
  }

  return (
    <Fragment>
      <Suspense fallback={<LoadingScreen />}>
        <NavbarContainer />
        <LoadingOverlay isVisible={user.isLoading} />
        <Container className="my-4 main-container" fluid>
          <Outlet />
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

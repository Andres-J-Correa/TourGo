import { useState, useEffect, Suspense, Fragment, useMemo } from "react";
import { Container } from "reactstrap";
import LoadingScreen from "components/commonUI/fallback/LoadingScreen";
import NavbarContainer from "components/commonUI/navbars/NavbarContainer";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Fragment>
        <NavbarContainer />
        <Container>my app here</Container>
      </Fragment>
    </Suspense>
  );
}

export default App;

import React, { Fragment } from "react";
import ClientNavbarContainer from "components/client/navbars/ClientNavbarContainer";

function Home() {
  return (
    <Fragment>
      <ClientNavbarContainer />
      <div className="bg-success vh-100"></div>
    </Fragment>
  );
}

export default Home;

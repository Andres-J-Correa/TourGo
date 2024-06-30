import React, { Fragment } from "react";
import Navbar from "components/commonUI/navbars/DefaultNavbar";

function Home() {
  return (
    <Fragment>
      <Navbar />
      <div className="bg-success vh-100"></div>
    </Fragment>
  );
}

export default Home;

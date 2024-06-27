import React from "react";
import ClientNavbar from "./navbars/client/ClientNavbar";
import { publicRoutes } from "routes/publicRoutes";

function Home() {
  return (
    <>
      <ClientNavbar routes={publicRoutes} />
    </>
  );
}

export default Home;

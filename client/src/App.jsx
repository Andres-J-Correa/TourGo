import { useState, useEffect, Suspense } from "react";
import { Helmet } from "react-helmet";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { publicFlattenedRoutes } from "./routes";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "assets/theme";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
};

export default App;

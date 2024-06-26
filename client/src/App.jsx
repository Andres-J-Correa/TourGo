import { useState, useEffect, Suspense } from "react";
import { Helmet } from "react-helmet";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { pageRoutes } from "./routes";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [routes, setRoutes] = useState([]);

  const mapRoutes = (route, idx) => (
    <Route
      key={`route-${idx}`}
      path={route.path}
      element={<route.component />}
    />
  );

  useEffect(() => {
    const mappedRoutes = pageRoutes.map(mapRoutes);

    setRoutes(mappedRoutes);
  }, []);

  return (
    <div id="top" className={`app`}>
      <Helmet>
        <title>Tour Go</title>
      </Helmet>
      <header className="header center">
        <h1>Tour Go</h1>
      </header>

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>{routes}</Routes>
        </Suspense>
      </main>

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
    </div>
  );
};

export default App;

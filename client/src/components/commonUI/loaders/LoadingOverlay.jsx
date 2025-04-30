import React from "react";
import { Spinner } from "reactstrap";
import "./LoadingOverlay.css"; // We'll style it here

const LoadingOverlay = ({ isVisible, message = "Procesando..." }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content text-center">
        <Spinner color="light" />
        <div className="mt-2 text-white">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

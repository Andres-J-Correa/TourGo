import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

function VerifyAccountFallback() {
  const navigate = useNavigate();
  return (
    <div className="text-center mt-5">
      <h2>Verifica tu correo electrónico</h2>
      <p>Es necesario verificar tu cuenta para usar esta funcionalidad.</p>
      <Button
        color="dark"
        onClick={() => navigate("/profile/settings?tab=email")}>
        Verificar Correo
      </Button>
    </div>
  );
}

export default VerifyAccountFallback;

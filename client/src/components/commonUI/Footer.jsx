import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="text-center mt-2">
      <p>
        &copy; 2025 Tourgo. Todos los derechos reservados. <div></div>
        <Link to={`/privacy-policy`} className="footer-link mx-2">
          Política de Privacidad
        </Link>
        <Link to="/investors" className="footer-link mx-2">
          Inversores
        </Link>
        <Link to="/careers" className="footer-link mx-2">
          Trabaja con nosotros
        </Link>
      </p>
    </footer>
  );
}

export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import { Row } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext"; // added

function Footer() {
  const { t } = useLanguage(); // added
  return (
    <Row className="w-100 no-print">
      <footer className="text-center mt-2">
        &copy; 2025 Tourgo. {t("commonUI.footer.rightsReserved")}
        <div></div>
        <Link to={`/privacy-policy`} className="footer-link mx-2">
          {t("commonUI.footer.privacyPolicy")}
        </Link>
        <Link to="/investors" className="footer-link mx-2">
          {t("commonUI.footer.investors")}
        </Link>
        <Link to="/careers" className="footer-link mx-2">
          {t("commonUI.footer.careers")}
        </Link>
      </footer>
    </Row>
  );
}

export default Footer;

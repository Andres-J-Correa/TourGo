import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "contexts/LanguageContext"; // added

function VerifyAccountFallback() {
  const navigate = useNavigate();
  const { t } = useLanguage(); // added
  return (
    <div className="text-center mt-5">
      <h2>{t("commonUI.verifyAccountFallback.title")}</h2>
      <p>{t("commonUI.verifyAccountFallback.message")}</p>
      <Button
        color="dark"
        onClick={() => navigate("/profile/settings?tab=email")}>
        {t("commonUI.verifyAccountFallback.button")}
      </Button>
    </div>
  );
}

export default VerifyAccountFallback;

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import { toast } from "react-toastify";
import axiosClient from "services/axiosClient";
import UserSignInModal from "components/users/UserSignInModal";
import UserPasswordResetModal from "components/users/UserPasswordResetModal";

const defaultModals = {
  login: false,
  reset: false,
};

const GlobalErrorHandler = ({ children }) => {
  const [modals, setModals] = useState({
    ...defaultModals,
  });

  const { user } = useAppContext();
  const { t } = useLanguage();

  const toggle = (key) => () => {
    setModals((prev) => ({ ...defaultModals, [key]: !prev[key] }));
  };

  const handleGlobalError = useCallback(
    (error) => {
      if (error.response.status === 401 && user.current.isAuthenticated) {
        toggle("login")();
        toast.error(t("common.sessionExpired"));
      }
      return Promise.reject(error);
    },
    [user, t]
  );

  useEffect(() => {
    const interceptor = axiosClient.interceptors.response.use(
      (response) => response,
      (error) => handleGlobalError(error)
    );

    return () => {
      axiosClient.interceptors.response.eject(interceptor);
    };
  }, [handleGlobalError]);

  return (
    <React.Fragment>
      <UserSignInModal
        isOpen={modals.login}
        toggle={toggle("login")}
        onPasswordReset={toggle("reset")}
        backdrop="static"
        keyboard={false}
      />
      <UserPasswordResetModal
        isOpen={modals.reset}
        toggle={toggle("reset")}
        onSignIn={toggle("login")}
        backdrop="static"
        keyboard={false}
        redirectToLogin={true}
      />

      {children}
    </React.Fragment>
  );
};

export default GlobalErrorHandler;

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, usersLogout } from "services/userAuthService";
import { getMinimalWithUserRoleById } from "services/hotelService";
import { UserSignInFormModal } from "components/users/UserSignInForm";
import { SignUpFormModal } from "components/users/SignUpForm";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosClient from "services/axiosClient";
import { useLanguage } from "contexts/LanguageContext";

const defaultUser = {
  id: 0,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  roles: [],
  isAuthenticated: false,
  isVerified: false,
  hasFetched: false,
};

const defaultHotel = {
  id: "",
  name: "",
  roleId: 0,
};

const defaultModals = {
  login: {
    isOpen: false,
    options: {
      backdrop: true,
      keyboard: true,
      onSignUp: true,
      redirect: true,
    },
  },
  register: {
    isOpen: false,
    options: {
      backdrop: true,
      keyboard: true,
    },
  },
};

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({ ...defaultUser });
  const [hotel, setHotel] = useState({ ...defaultHotel });
  const [hotelIdParam, setHotelIdParam] = useState(null);
  const [isLoadingHotel, setIsLoadingHotel] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [modals, setModals] = useState({ ...defaultModals });
  const [isAuthError, setIsAuthError] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isResponseIntercepted, setIsResponseIntercepted] = useState(false);

  const { t } = useLanguage();

  const navigate = useNavigate();

  const toggleModal = useCallback(
    (key) =>
      (options = {}) => {
        setModals((prev) => {
          const isOptionsEmpty = Object.keys(options).length === 0;
          return {
            ...defaultModals,
            [key]: {
              ...prev[key],
              isOpen: !prev[key].isOpen,
              options: isOptionsEmpty
                ? { ...prev[key].options }
                : { ...prev[key].options, ...options },
            },
          };
        });
      },
    [setModals]
  );

  const handleLogout = useCallback(async () => {
    const result = await Swal.fire({
      title: t("globalAppContext.logoutTitle"),
      text: t("globalAppContext.logoutText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("globalAppContext.logoutConfirmButton"),
      cancelButtonText: t("globalAppContext.logoutCancelButton"),
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: t("globalAppContext.loggingOutTitle"),
        text: t("globalAppContext.loggingOutText"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await usersLogout();

      Swal.fire({
        title: t("globalAppContext.logoutSuccessTitle"),
        text: t("globalAppContext.logoutSuccessText"),
        icon: "success",
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: false,
        timer: 1500,
      });

      setCurrentUser({ ...defaultUser });
      navigate("/");
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: t("globalAppContext.logoutErrorTitle"),
        text: t("globalAppContext.logoutErrorText"),
        icon: "error",
      });
    }
  }, [navigate, t]);

  const setHotelId = useCallback(
    (hotelId) => {
      if (hotelId && hotelId !== hotelIdParam) {
        setHotelIdParam(hotelId);
      }
    },
    [hotelIdParam]
  );

  const contextValue = {
    user: {
      current: currentUser,
      set: setCurrentUser,
      logout: handleLogout,
      isLoading: isLoadingUser,
    },
    hotel: {
      current: hotel,
      isLoading: isLoadingHotel,
      setHotelId,
    },
    toggleUserSignInModal: toggleModal("login"),
    toggleUserSignUpModal: toggleModal("register"),
    maintenanceMode,
  };

  const handleGlobalError = useCallback(
    (error) => {
      if (
        error.response?.status === 401 &&
        currentUser.isAuthenticated &&
        !isAuthError
      ) {
        setModals((prev) => ({
          ...prev,
          login: {
            ...prev.login,
            isOpen: true,
            options: {
              ...prev.login.options,
              backdrop: "static",
              keyboard: false,
              onSignUp: false,
              redirect: false,
            },
          },
        }));
        setIsAuthError(true);
        toast.error(t("common.sessionExpired"));
      }

      if (error.code === "ERR_NETWORK" || error.response?.status === 503) {
        setMaintenanceMode(true);
      }
      return Promise.reject(error);
    },
    [currentUser, t, isAuthError]
  );

  useEffect(() => {
    if (
      currentUser.id === 0 &&
      !currentUser.hasFetched &&
      isResponseIntercepted
    ) {
      setIsLoadingUser(true);
      getCurrentUser()
        .then((data) => {
          const { item } = data;

          if (!item) {
            throw new Error("User not found");
          }
          setCurrentUser((prev) => ({
            ...prev,
            ...data.item,
            isAuthenticated: true,
            hasFetched: true,
          }));
          setIsAuthError(false);
        })
        .catch(() => {
          setCurrentUser({ ...defaultUser, hasFetched: true });
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
    }
  }, [
    currentUser.id,
    currentUser.isAuthenticated,
    navigate,
    currentUser.hasFetched,
    isResponseIntercepted,
  ]);

  useEffect(() => {
    if (
      hotelIdParam &&
      hotel.id !== hotelIdParam &&
      currentUser.isAuthenticated
    ) {
      setIsLoadingHotel(true);
      getMinimalWithUserRoleById(hotelIdParam)
        .then((res) => {
          if (res.isSuccessful) {
            setHotel(res.item);
          }
        })
        .catch((error) => {
          if (error?.response?.status !== 404) {
            toast.error(t("globalAppContext.hotelLoadError"));
          }
          setHotel({ ...defaultHotel });
        })
        .finally(() => {
          setIsLoadingHotel(false);
        });
    } else if (hotel.id !== 0 && !currentUser.isAuthenticated) {
      setHotel({ ...defaultHotel });
    }
  }, [hotelIdParam, hotel.id, currentUser, t]);

  useEffect(() => {
    const interceptor = axiosClient.interceptors.response.use(
      (response) => {
        if (maintenanceMode) setMaintenanceMode(false);
        return response;
      },
      (error) => {
        if (error.response?.status !== 503 || error.code !== "ERR_NETWORK") {
          setMaintenanceMode(false);
        }
        return handleGlobalError(error);
      }
    );

    setIsResponseIntercepted(true);

    return () => {
      axiosClient.interceptors.response.eject(interceptor);
      setIsResponseIntercepted(false);
    };
  }, [handleGlobalError, maintenanceMode]);

  return (
    <AppContext.Provider value={contextValue}>
      <UserSignInFormModal
        isOpen={modals.login.isOpen}
        toggle={toggleModal("login")}
        onSignUp={
          modals.login.options.onSignUp ? toggleModal("register") : null
        }
        backdrop={modals.login.options.backdrop}
        keyboard={modals.login.options.keyboard}
        redirect={modals.login.options.redirect}
      />
      <SignUpFormModal
        isOpen={modals.register.isOpen}
        toggle={toggleModal("register")}
        onSignIn={toggleModal("login")}
        backdrop={modals.register.options.backdrop}
        keyboard={modals.register.options.keyboard}
      />
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

AppContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
};

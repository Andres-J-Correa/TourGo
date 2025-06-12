import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  id: 0,
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
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({ ...defaultUser });
  const [hotel, setHotel] = useState({ ...defaultHotel });
  const [isLoadingHotel, setIsLoadingHotel] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [modals, setModals] = useState({ ...defaultModals });
  const [isAuthError, setIsAuthError] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isResponseIntercepted, setIsResponseIntercepted] = useState(false);

  const { t } = useLanguage();

  const navigate = useNavigate();

  const toggleModal =
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
              ? { ...defaultModals[key].options, ...prev[key].options }
              : { ...prev[key].options, ...options },
          },
        };
      });
    };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Seguro que quieres cerrar la sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Cerrando sesión...",
        text: "Por favor espera un momento.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await usersLogout();

      Swal.fire({
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
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
        title: "Error",
        text: "Hubo un problema al cerrar la sesión. Por favor, intenta nuevamente.",
        icon: "error",
      });
    }
  };

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

      if (error.code === "ERR_NETWORK" || error.response?.status !== 503) {
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
    const pathRegex = /\/hotels\/([^/]+)/; // Matches /hotel/{hotelId}
    const pathMatch = location.pathname.match(pathRegex);
    const hotelId = pathMatch ? Number(pathMatch[1]) : null;

    if (
      !isNaN(hotelId) &&
      Number(hotelId) !== Number(hotel.id) &&
      currentUser.isAuthenticated
    ) {
      setIsLoadingHotel(true);
      getMinimalWithUserRoleById(hotelId)
        .then((res) => {
          if (res.isSuccessful) {
            setHotel(res.item);
          }
        })
        .catch((error) => {
          if (error?.response?.status !== 404) {
            toast.error("Hubo un error al cargar el hotel");
          }
          setHotel({ ...defaultHotel });
        })
        .finally(() => {
          setIsLoadingHotel(false);
        });
    } else if (hotel.id !== 0 && !currentUser.isAuthenticated) {
      setHotel({ ...defaultHotel });
    }
  }, [location.pathname, hotel.id, currentUser]);

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

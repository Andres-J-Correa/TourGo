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
  roles: [],
  isAuthenticated: false,
  isVerified: false,
};

const defaultHotel = {
  id: 0,
  name: "",
  roleId: 0,
};

const defaultModals = {
  login: false,
  register: false,
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

  const { t } = useLanguage();

  const navigate = useNavigate();

  const toggleModal = (key) => () => {
    setModals((prev) => ({ ...defaultModals, [key]: !prev[key] }));
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
  };

  const handleGlobalError = useCallback(
    (error) => {
      if (
        error.response.status === 401 &&
        currentUser.isAuthenticated &&
        !isAuthError
      ) {
        setModals((prev) => ({
          ...prev,
          login: true,
        }));
        setIsAuthError(true);
        toast.error(t("common.sessionExpired"));
      }
      return Promise.reject(error);
    },
    [currentUser, t, isAuthError]
  );

  useEffect(() => {
    if (currentUser.id === 0) {
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
          }));
          setIsAuthError(false);
        })
        .catch(() => {
          if (currentUser.isAuthenticated) {
            setCurrentUser({ ...defaultUser });
          }
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
    }
  }, [currentUser.id, currentUser.isAuthenticated, navigate]);

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
      (response) => response,
      (error) => handleGlobalError(error)
    );

    return () => {
      axiosClient.interceptors.response.eject(interceptor);
    };
  }, [handleGlobalError]);

  return (
    <AppContext.Provider value={contextValue}>
      <UserSignInFormModal
        isOpen={modals.login}
        toggle={toggleModal("login")}
        onSignUp={!isAuthError && toggleModal("register")}
        backdrop={isAuthError && "static"}
        keyboard={!isAuthError}
      />
      <SignUpFormModal
        isOpen={modals.register}
        toggle={toggleModal("register")}
        onSignIn={toggleModal("login")}
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

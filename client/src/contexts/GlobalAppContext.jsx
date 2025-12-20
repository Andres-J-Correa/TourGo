import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import PropTypes from "prop-types";
import { toast } from "react-toastify";

import { getCurrentUser, usersLogout } from "services/userAuthService";
import { getMinimalWithUserRoleById } from "services/hotelService";
import axiosClient from "services/axiosClient";
import axiosClientV2 from "services/axiosClientV2";
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
};

const defaultHotel = {
  id: "",
  name: "",
  roleId: 0,
};

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({ ...defaultUser });
  const [hotel, setHotel] = useState({ ...defaultHotel });
  const [hotelIdParam, setHotelIdParam] = useState(null);
  const [isLoadingHotel, setIsLoadingHotel] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isResponseIntercepted, setIsResponseIntercepted] = useState(false);

  const { t } = useLanguage();

  const handleLogout = useCallback(async () => {
    const { default: Swal } = await import("sweetalert2");

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
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: t("globalAppContext.logoutErrorTitle"),
        text: t("globalAppContext.logoutErrorText"),
        icon: "error",
      });
    }
  }, [t]);

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
      refresh: () => fetchHotel(hotel.id),
    },
    maintenanceMode,
  };

  const handleGlobalError = useCallback(
    (error) => {
      if (
        error.response?.status === 401 &&
        currentUser.isAuthenticated &&
        !isAuthError
      ) {
        setCurrentUser({ ...defaultUser });
        setIsAuthError(true);
        toast.error(t("common.sessionExpired"), {
          autoClose: 5000,
          theme: "colored",
        });
      }

      if (error.code === "ERR_NETWORK" || error.response?.status === 503) {
        setMaintenanceMode(true);
      }
      return Promise.reject(error);
    },
    [currentUser, t, isAuthError]
  );

  const fetchHotel = useCallback((hotelId) => {
    setIsLoadingHotel(true);
    getMinimalWithUserRoleById(hotelId)
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
  }, []);

  useEffect(() => {
    if (currentUser.id === 0 && isResponseIntercepted) {
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
          setCurrentUser({ ...defaultUser });
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
    }
  }, [currentUser.id, currentUser.isAuthenticated, isResponseIntercepted]);

  useEffect(() => {
    if (
      hotelIdParam &&
      hotel.id !== hotelIdParam &&
      currentUser.isAuthenticated
    ) {
      fetchHotel(hotelIdParam);
    } else if (hotel.id !== 0 && !currentUser.isAuthenticated) {
      setHotel({ ...defaultHotel });
    }
  }, [hotelIdParam, hotel.id, currentUser, t, fetchHotel]);

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

    // Set the axiosClientV2 interceptor
    const interceptorV2 = axiosClientV2.interceptors.response.use(
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
      axiosClientV2.interceptors.response.eject(interceptorV2);
      setIsResponseIntercepted(false);
    };
  }, [handleGlobalError, maintenanceMode]);

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

AppContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
};

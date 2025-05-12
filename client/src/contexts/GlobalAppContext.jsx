import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "services/userAuthService";
import { getMinimalById } from "services/hotelService";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const defaultUser = {
  id: 0,
  firstName: "",
  lastName: "",
  roles: [],
  isAuthenticated: false,
};

const defaultHotel = {
  id: 0,
  name: "",
};

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({ ...defaultUser });
  const [hotel, setHotel] = useState({ ...defaultHotel });
  const [isLoadingHotel, setIsLoadingHotel] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const navigate = useNavigate();

  const logout = () => {
    setCurrentUser({ ...defaultUser });
    navigate("/");
  };

  const contextValue = {
    user: {
      current: currentUser,
      set: setCurrentUser,
      logout,
      isLoading: isLoadingUser,
    },
    hotel: {
      current: hotel,
      isLoading: isLoadingHotel,
    },
  };

  useEffect(() => {
    if (!currentUser.isAuthenticated) {
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
  }, [currentUser.isAuthenticated, navigate]);

  useEffect(() => {
    const pathRegex = /\/hotels\/([^/]+)/; // Matches /hotel/{hotelId}
    const pathMatch = location.pathname.match(pathRegex);
    const hotelId = pathMatch ? pathMatch[1] : null;

    if (hotelId && Number(hotelId) !== Number(hotel.id)) {
      setIsLoadingHotel(true);
      getMinimalById(hotelId)
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
    } else if (!hotelId) {
      setHotel({ ...defaultHotel });
    }
  }, [location.pathname, hotel.id]);

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

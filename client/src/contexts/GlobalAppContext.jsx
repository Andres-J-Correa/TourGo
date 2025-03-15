import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "services/userAuthService";
import { getCurrentHotel } from "services/hotelService";

import PropTypes from "prop-types";

const defaultUser = {
  id: 0,
  firstName: "",
  lastName: "",
  roles: [],
  isAuthenticated: false,
  hotel: null,
};

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({ ...defaultUser });

  const navigate = useNavigate();

  const logout = () => {
    setCurrentUser({ ...defaultUser });
    navigate("/");
  };

  const contextValue = {
    user: { current: currentUser, set: setCurrentUser, logout },
  };

  const fetchUserAndHotel = useCallback(async () => {
    try {
      const [userData, hotelData] = await Promise.all([
        getCurrentUser(),
        getCurrentHotel(),
      ]);

      const { item: user } = userData || {};
      const { item: hotel } = hotelData || {};

      if (!user) {
        throw new Error("User not found");
      }

      setCurrentUser((prev) => ({
        ...prev,
        ...user,
        hotel: hotel || null,
        isAuthenticated: true,
      }));
    } catch (error) {
      setCurrentUser({ ...defaultUser });
    }
  }, []);

  useEffect(() => {
    fetchUserAndHotel();
  }, [fetchUserAndHotel]);

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

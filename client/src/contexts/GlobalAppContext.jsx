import React, { createContext, useState, useEffect, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "services/userAuthService";

import PropTypes from "prop-types";

const defaultUser = {
  id: 0,
  firstName: "",
  lastName: "",
  roles: [],
  isAuthenticated: false,
};

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({ ...defaultUser });

  const navigate = useNavigate();

  const logout = () => {
    setCurrentUser({ ...defaultUser });
  };

  const contextValue = {
    user: { current: currentUser, set: setCurrentUser, logout },
  };

  useEffect(() => {
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

        if (item.roles.includes("TourProvider")) {
          navigate("/provider/dashboard");
        }
      })
      .catch(() => {
        if (currentUser.isAuthenticated) {
          setCurrentUser({ ...defaultUser });
        }
      });
  }, [currentUser.isAuthenticated, navigate]);

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

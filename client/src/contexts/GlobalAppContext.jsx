import React, { createContext, useState, useEffect, useContext } from "react";

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

  const logout = () => {
    setCurrentUser({ ...defaultUser });
  };

  const contextValue = {
    user: { current: currentUser, set: setCurrentUser, logout },
  };

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        if (!Boolean(data?.item)) {
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
      });
  }, [currentUser.isAuthenticated]);

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

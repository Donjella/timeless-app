// src/contexts/AuthProvider.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext'; // Import the context
import { isTokenExpired } from '../utils/tokenUtils'; // Import utility function

const defaultAuthData = {
  isAuthenticated: false,
  user: null,
  token: null,
};

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(defaultAuthData);

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);

        if (parsedAuth.token && isTokenExpired(parsedAuth.token)) {
          console.warn('Token expired, logging out');
          localStorage.removeItem('auth');
          setAuthData(defaultAuthData);
        } else {
          setAuthData(parsedAuth);
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  useEffect(() => {
    if (authData.isAuthenticated) {
      localStorage.setItem('auth', JSON.stringify(authData));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authData]);

  const login = (userData) => {
    const authPayload = {
      isAuthenticated: true,
      user: {
        id: userData._id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone_number: userData.phone_number,
        role: userData.role,
      },
      token: userData.token,
    };

    setAuthData(authPayload);
    return true;
  };

  const logout = () => {
    setAuthData(defaultAuthData);
  };

  const isAdmin = () => {
    return authData.user?.role === 'admin';
  };

  const isTokenValid = () => {
    return authData.token && !isTokenExpired(authData.token);
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        setAuthData,
        login,
        logout,
        isAdmin,
        isTokenValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

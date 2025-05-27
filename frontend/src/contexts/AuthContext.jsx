// src/contexts/AuthContext.js

import { createContext } from 'react';

// Default auth state
const defaultAuthData = {
  isAuthenticated: false,
  user: null,
  token: null,
};

// Create and export the AuthContext
export const AuthContext = createContext({
  authData: defaultAuthData,
  setAuthData: () => {},
  login: () => {},
  logout: () => {},
  isAdmin: () => false,
  isTokenValid: () => false,
});

// src/hooks/useAuthData.js

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Import the context

export const useAuthData = () => useContext(AuthContext);

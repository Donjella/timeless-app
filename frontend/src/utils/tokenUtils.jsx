// src/utils/tokenUtils.js

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);

    return exp * 1000 < Date.now();
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true;
  }
};

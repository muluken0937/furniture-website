/**
 * JWT Token Utilities
 * Functions for decoding and validating JWT tokens
 */

/**
 * Decode JWT token without verification (client-side only)
 * Returns the payload or null if invalid
 */
export const decodeToken = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * Returns true if expired, false if valid, null if invalid token
 */
export const isTokenExpired = (token: string | null): boolean | null => {
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (token: string | null): number | null => {
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return decoded.exp * 1000;
};

/**
 * Get time until token expires in milliseconds
 */
export const getTimeUntilExpiration = (token: string | null): number | null => {
  const expirationTime = getTokenExpirationTime(token);
  if (expirationTime === null) return null;
  
  return expirationTime - Date.now();
};


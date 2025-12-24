'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getApiUrl } from '@/config/api';
import { isTokenExpired } from '@/utils/tokenUtils';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  loading: boolean;
  apiUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState<string>('');
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = (showMessage = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh');
    
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }
    
    if (showMessage) {
      toast.error('Your session has expired. Please log in again.');
    }
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  };

  const checkTokenExpiration = () => {
    const currentToken = token || localStorage.getItem('token');
    
    if (!currentToken) {
      if (user || token) {
        handleLogout(false);
      }
      return;
    }

    const expired = isTokenExpired(currentToken);
    
    if (expired === true) {
      // Token is expired, logout
      handleLogout();
    } else if (expired === null) {
      // Invalid token, logout
      handleLogout();
    }
  };

  const setupTokenExpirationCheck = (currentToken: string | null) => {
    // Clear existing interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    if (!currentToken) return;

    // Check token expiration every 30 seconds
    tokenCheckIntervalRef.current = setInterval(() => {
      checkTokenExpiration();
    }, 30000); // Check every 30 seconds

    // Also check immediately
    checkTokenExpiration();
  };

  useEffect(() => {
    // Get API URL dynamically
    const currentApiUrl = getApiUrl();
    setApiUrl(currentApiUrl);
    
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      // Check if token is expired before setting it
      const expired = isTokenExpired(storedToken);
      
      if (expired === true || expired === null) {
        // Token is expired or invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh');
        setLoading(false);
        return;
      }
      
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setupTokenExpirationCheck(storedToken);
    }
    setLoading(false);

    // Cleanup interval on unmount
    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, []);

  // Update token expiration check when token changes
  useEffect(() => {
    if (token) {
      setupTokenExpirationCheck(token);
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const currentApiUrl = getApiUrl();
      const response = await fetch(`${currentApiUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access);
        setUser(data.user);
        
        // Store in localStorage
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.refresh) {
          localStorage.setItem('refresh', data.refresh);
        }
        
        // Setup token expiration checking
        setupTokenExpirationCheck(data.access);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    handleLogout(false);
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isStaff,
    isCustomer,
    loading,
    apiUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const { authAPI } = apiService;

// Helper function to update localStorage and state
const updateAuthState = (user, isAuthenticated, setUser, setIsAuthenticated) => {
  if (isAuthenticated && user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    console.log('Auth state saved to localStorage:', { user: user.firstName + ' ' + user.lastName, userType: user.userType });
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    console.log('Auth state cleared from localStorage');
  }
  
  setUser(user);
  setIsAuthenticated(isAuthenticated);
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize auth state from localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.log('User not authenticated:', error);
      
      // Clear localStorage on auth failure
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Save user to localStorage on successful login
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      // Clear localStorage on login failure
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage on logout
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Don't automatically log in after registration
      // User needs to verify email first
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
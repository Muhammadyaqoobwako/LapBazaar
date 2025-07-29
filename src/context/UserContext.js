// client/src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const userData = response.data.user;
      const token = response.data.token;
      const userWithToken = { ...userData, token };

      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(userWithToken));
      return response;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- MODIFIED register function to accept 'role' ---
  const register = async (username, email, password, role) => {
  // ---------------------------------------------------
    setLoading(true);
    try {
      // --- Pass 'role' to authService.register ---
      const response = await authService.register(username, email, password, role);
      // ------------------------------------------
      return response;
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
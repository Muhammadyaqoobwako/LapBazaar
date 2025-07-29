// src/services/authService.js
import axios from 'axios';

// Determine API base URL from environment variable or default to localhost:5000
// IMPORTANT: Ensure you have a .env file in your frontend root (e.g., client/.env)
// with the line: REACT_APP_API_BASE_URL=http://localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const authService = {
  // Method for user registration
  register: async (username, email, password, role = 'user') => {
    try {
      // Corrected endpoint to match your backend: /api/v1/register
      const response = await axios.post(`${API_BASE_URL}/api/v1/register`, {
        username,
        email,
        password,
        role // Include the role in the registration data
      });
      return response.data; // Return the data from the successful response
    } catch (error) {
      // Centralized error handling for registration
      console.error('authService.js (register):', error);
      throw error; // Re-throw to be caught by the component (e.g., Signup.js)
    }
  },

  // Method for user login
  login: async (email, password) => {
    try {
      // Corrected endpoint to match your backend: /api/v1/login
      const response = await axios.post(`${API_BASE_URL}/api/v1/login`, {
        email,
        password
      });
      return response.data; // Return the data from the successful response
    } catch (error) {
      // Centralized error handling for login
      console.error('authService.js (login):', error);
      throw error; // Re-throw to be caught by the component (e.g., Login.js)
    }
  },

  // You can add other authentication related methods here, e.g., logout, getCurrentUser, etc.
  logout: () => {
    // Implement client-side logout (e.g., remove token from localStorage)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // You might also want to invalidate the token on the server if necessary
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
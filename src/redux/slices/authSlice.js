// src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the API URL for login
// IMPORTANT:
// If your 'setupProxy.js' is active and correctly configured (which it should be),
// use the relative path '/api/v1/login'. The proxy will forward it to 'http://localhost:5000/api/v1/login'.
// If your proxy is NOT working for some reason, or you prefer absolute paths,
// then change this to: 'http://localhost:5000/api/v1/login'
const LOGIN_API_URL = '/api/v1/login';

const initialState = {
  user: null,
  token: localStorage.getItem('userToken') || null, // Try to load token from localStorage on app start
  isAuthenticated: !!localStorage.getItem('userToken'), // Set isAuthenticated based on token existence
  isLoading: false,
  error: null,
};

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  'auth/loginUser', // Action type prefix
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST', // Ensure this is a POST request
        headers: {
          'Content-Type': 'application/json', // Backend expects JSON
        },
        body: JSON.stringify({ email, password }), // Send credentials as JSON
      });

      const data = await response.json(); // Parse the JSON response

      if (!response.ok) {
        // If the HTTP status is not 2xx (e.g., 400, 401, 500)
        // Your backend sends { success: false, error: 'message' }
        return rejectWithValue(data.error || 'Something went wrong');
      }

      // If login is successful, your backend sends { success: true, token: '...', user: {...} }
      return data; // This data will be the payload for 'fulfilled' state
    } catch (error) {
      // Catch network errors or issues with fetch/parsing
      console.error('Login API call error:', error);
      return rejectWithValue('Network error. Please check your connection.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducers to directly modify state (e.g., after successful login from another source)
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('userToken', action.payload.token); // Store token in localStorage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userToken'); // Remove token from localStorage on logout
      // Optionally clear other related data here
    },
  },
  // extraReducers handle actions dispatched by createAsyncThunk
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null; // Clear errors on success
        localStorage.setItem('userToken', action.payload.token); // Store token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // action.payload contains the error message from rejectWithValue
        state.error = action.payload || 'Login failed. Please try again.';
        localStorage.removeItem('userToken'); // Ensure token is cleared on failed login
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;

// Selectors (optional, but good practice for accessing state)
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
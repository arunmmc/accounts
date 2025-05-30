// src/redux/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducers for handling login/logout status
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      // You might store the token in localStorage here for persistence
      localStorage.setItem('authToken', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('authToken');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('authToken');
    },
    // A reducer to check token on app load (e.g., from localStorage)
    setAuthFromLocalStorage: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user; // You might get user info from token or another API call
    }
  },
  // You can add extraReducers here for async actions (like Thunks for API calls)
});

export const { loginStart, loginSuccess, loginFailure, logout, setAuthFromLocalStorage } = authSlice.actions;
export default authSlice.reducer;
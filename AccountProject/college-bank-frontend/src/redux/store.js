import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
// import transactionsReducer from './features/transactions/transactionsSlice'; // Will add later

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // transactions: transactionsReducer, // Will add later
    // Add other reducers here
  },
});
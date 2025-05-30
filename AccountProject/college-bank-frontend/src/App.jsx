// src/App.jsx
import React, { useEffect } from 'react'; // <--- Import useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setAuthFromLocalStorage, logout } from './redux/features/auth/authSlice';

import { useSelector, useDispatch } from 'react-redux'; // <--- Import useDispatch


// Import the Layout component
import Layout from './components/Layout';
import LoginForm from './redux/features/auth/LoginForm'; // Import the new component
import BankAccountsPage from './components/BankAccountsPage';
import TransactionsPage from './components/TransactionsPage';
import CashbookPage from './components/CashbookPage'; 

// --- Placeholder components (you'll replace these with actual components) ---
const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div data-aos="flip-up" className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Login Page</h2>
       
          <LoginForm />
        
       
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="p-8">
      <h1 data-aos="fade-right" className="text-3xl font-bold mb-6">Dashboard</h1>
      <p data-aos="fade-left" data-aos-delay="200">Overview of bank accounts and key metrics.</p>
      {/* Your Dashboard content */}
    </div>
  );
};



const BudgetPage = () => {
  return (
    <div className="p-8">
      <h1 data-aos="fade-right" className="text-3xl font-bold mb-6">Budget Preparation</h1>
      <p data-aos="fade-left" data-aos-delay="200">Manage budget planning and allocation.</p>
      {/* Your Budget content */}
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
    </div>
  );
};

// PrivateRoute component as defined before
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch(); // <--- Get the dispatch function

  // Effect to initialize authentication state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
      // Dispatch the action to set authentication state in Redux
      // You can add user info here if you decode the token or fetch user profile
      dispatch(setAuthFromLocalStorage({ token: storedToken, isAuthenticated: true, user: null /* or decoded user */ }));
    }
    // Set loading to false once the initial check is done (if you added it to authSlice)
    // If you have a 'loading' state in authSlice, you might dispatch a 'loadingComplete' action here
    // or set initial loading state to true and handle its completion.
  }, [dispatch]); // Dependency array: dispatch is stable

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes, wrapped by Layout */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout><DashboardPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/accounts" // New path for bank accounts
          element={
           
              <Layout><BankAccountsPage /></Layout>
           
          }
        />
      
         <Route
          path="/transactions"
          element={
            <PrivateRoute>
              {/* Use the imported TransactionsPage, not the placeholder */}
              <Layout><TransactionsPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cashbook" // <--- NEW: Route for CashbookPage
          element={
            <PrivateRoute>
              <Layout><CashbookPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <PrivateRoute>
              <Layout><BudgetPage /></Layout>
            </PrivateRoute>
          }
        />

        {/* Redirect root to dashboard if authenticated, else to login */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navigate to="/dashboard" replace />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
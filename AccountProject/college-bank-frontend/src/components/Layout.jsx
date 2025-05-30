// src/components/Layout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/features/auth/authSlice'; // Import your logout action

const Layout = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow-md" data-aos="fade-down">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">College Bank App</h1>
          <nav>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar / Navigation (for authenticated users) */}
        {isAuthenticated && (
          <aside className="w-64 bg-blue-900 text-white p-4 shadow-lg" data-aos="fade-right">
            <nav className="space-y-4">
              <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                Dashboard
              </Link>
               <Link to="/accounts" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                Bank Accounts
              </Link>
              <Link to="/transactions" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                Transactions
              </Link>
              <Link to="/cashbook" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                Cashbooks
              </Link>
              <Link to="/budget" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                Budget
              </Link>
              {/* Add more links as you build out features */}
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children} {/* This is where the routed components will render */}
        </main>
      </div>

      {/* Footer (Optional) */}
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} College Bank Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from './authSlice';
import axiosInstance from "../../../utils/axiosInstance"; // Correct for going up 3 levels then into utils


const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart()); // Indicate login process has started

    try {
      const response = await axiosInstance.post('auth/token/', { // **IMPORTANT: Adjust this API endpoint**
        username,
        password,
      });

      // Assuming your DRF Simple JWT setup returns 'access' and 'refresh' tokens
      const { access, refresh } = response.data;

      // Store the access token in localStorage (Axios interceptor will pick it up)
      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh); // Optional: Store refresh token for later use

      // Dispatch success action with user data and token
      // You might need an API endpoint to get user details from the token or after login
      // For now, let's just use a placeholder user object
      dispatch(loginSuccess({ user: { username }, token: access }));

      navigate('/dashboard'); // Redirect to dashboard on successful login
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      dispatch(loginFailure(err.response?.data?.detail || 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div data-aos="flip-up" className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
     
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition duration-200"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline transition duration-200"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
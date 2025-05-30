// src/components/forms/BankAccountForm.jsx
import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const BankAccountForm = ({ onAccountCreated, onCancel }) => {
  // Removed accountName state
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [balance, setBalance] = useState('');
  const [name, setName] = useState(''); // This will now serve as the "Account Name" in your UI
  const [ifscCode, setIfscCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post('bank-accounts/', {
        // Removed account_name from the payload
        account_number: accountNumber,
        bank_name: bankName,
        current_balance: parseFloat(balance),
        name: name, // Sending 'name' as the account name/holder name
        ifsc_code: ifscCode,
      });
      setSuccess('Bank account created successfully!');
      setLoading(false);
      if (onAccountCreated) {
        onAccountCreated(response.data);
      }
      // Clear form fields
      // Removed setAccountName('')
      setAccountNumber('');
      setBankName('');
      setBalance('');
      setName('');
      setIfscCode('');
      if (onCancel) {
        setTimeout(() => onCancel(), 1500);
      }

    } catch (err) {
      console.error('Error creating bank account:', err.response?.data || err.message);
      if (err.response?.data) {
        const errors = err.response.data;
        let errorMessage = 'Failed to create account:';
        for (const key in errors) {
           if (Array.isArray(errors[key])) {
            errorMessage += ` ${key}: ${errors[key].join(', ')}`;
          } else {
            errorMessage += ` ${key}: ${errors[key]}`; // Handle as a single string
          }
        }
        setError(errorMessage);
      } else {
        setError('Failed to create bank account. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8" data-aos="fade-up">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Create New Bank Account</h2>
      <form onSubmit={handleSubmit}>
        {/*
          Removed the previous 'accountName' input field.
          The 'name' field below will now serve this purpose in the UI.
        */}

        {/* Using 'name' field for Account Holder Name/Account Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Account Name</label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Full name of account holder (e.g., My Savings Account)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="accountNumber" className="block text-gray-700 text-sm font-bold mb-2">Account Number</label>
          <input
            type="text"
            id="accountNumber"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 1234567890"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bankName" className="block text-gray-700 text-sm font-bold mb-2">Bank Name</label>
          <input
            type="text"
            id="bankName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., State Bank of India"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="balance" className="block text-gray-700 text-sm font-bold mb-2">Initial Balance</label>
          <input
            type="number"
            id="balance"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 1000.00"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Existing 'ifscCode' field */}
        <div className="mb-6">
          <label htmlFor="ifscCode" className="block text-gray-700 text-sm font-bold mb-2">IFSC Code</label>
          <input
            type="text"
            id="ifscCode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., SBIN0001234"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-xs italic mb-4 text-center">{success}</p>
        )}

        <div className="flex items-center justify-end gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BankAccountForm;
// src/components/BankAccountsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import BankAccountForm from './forms/BankAccountForm';
import BankAccountEditForm from './forms/BankAccountEditForm'; // Import the new edit form

const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null); // State to hold account being edited

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('bank-accounts/');
      setAccounts(response.data);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Failed to load bank accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAccountCreated = (newAccount) => {
    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
    setShowForm(false); // Hide the create form
  };

  const handleAccountUpdated = (updatedAccount) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
    setEditingAccount(null); // Hide the edit form
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`bank-accounts/${accountId}/`);
        setAccounts((prevAccounts) => prevAccounts.filter((acc) => acc.id !== accountId));
        alert('Bank account deleted successfully!');
      } catch (err) {
        console.error('Error deleting bank account:', err);
        setError('Failed to delete bank account. Please try again.');
      _error_('Failed to delete bank account. Please try again.'); // Display error message
      }
    }
  };

  const handleEditClick = (account) => {
    setEditingAccount(account); // Set the account to be edited
    setShowForm(false); // Hide the create form if it's open
  };

  const handleCancelEdit = () => {
    setEditingAccount(null); // Clear the editing state
  };


  if (loading && accounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600" data-aos="fade-up">Loading bank accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-100 rounded-md" data-aos="fade-in">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-800 mb-6" data-aos="fade-down">Bank Accounts</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAccount(null); // Close edit form if create is toggled
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          {showForm ? 'Cancel Add' : 'Add New Account'}
        </button>
      </div>

      {showForm && (
        <BankAccountForm
          onAccountCreated={handleAccountCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingAccount && ( // Conditionally render the edit form
        <BankAccountEditForm
          account={editingAccount}
          onAccountUpdated={handleAccountUpdated}
          onCancel={handleCancelEdit}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto" data-aos="fade-up">
        {accounts.length === 0 && !loading ? (
          <p className="text-gray-600">No bank accounts found. Click "Add New Account" to create one!</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{account.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{account.name}</td> {/* Display 'name' here */}
                  <td className="px-6 py-4 whitespace-nowrap">{account.account_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{account.bank_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{(typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0).toFixed(2)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(account)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit Account"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Account"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BankAccountsPage;
// src/components/TransactionsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import axiosInstance from '../utils/axiosInstance';
import TransactionForm from './forms/TransactionForm'; // Import create form
import TransactionEditForm from './forms/TransactionEditForm'; // Import edit form

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  //const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB').format(date); // Or 'en-GB' depending on desired output.
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to control create form visibility
  const [editingTransaction, setEditingTransaction] = useState(null); // State to hold transaction being edited

  const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR', // Adjust currency code as needed (e.g., 'USD', 'EUR')
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('transactions/');
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionCreated = (newTransaction) => {
    // Add the new transaction and re-sort to maintain order (by transaction_date, then id)
    setTransactions((prevTransactions) =>
      [...prevTransactions, newTransaction].sort((a, b) => {
        const dateA = new Date(a.transaction_date);
        const dateB = new Date(b.transaction_date);
        return dateB - dateA || b.id - a.id; // Sort by date descending, then ID descending
      })
    );
    setShowForm(false); // Hide create form after creation
  };

  const handleTransactionUpdated = (updatedTransaction) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((tx) => (tx.id === updatedTransaction.id ? updatedTransaction : tx))
      .sort((a, b) => {
        const dateA = new Date(a.transaction_date);
        const dateB = new Date(b.transaction_date);
        return dateB - dateA || b.id - a.id; // Re-sort after update
      })
    );
    setEditingTransaction(null); // Hide edit form after update
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`transactions/${transactionId}/`);
        setTransactions((prevTransactions) => prevTransactions.filter((tx) => tx.id !== transactionId));
        alert('Transaction deleted successfully!');
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setError('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction); // Set the transaction to be edited
    setShowForm(false); // Hide create form if it's open
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null); // Clear the editing state
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600" data-aos="fade-up">Loading transactions...</p>
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
      <h1 className="text-4xl font-bold text-blue-800 mb-6" data-aos="fade-down">Transactions</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingTransaction(null); // Close edit form if create is toggled
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          {showForm ? 'Cancel Add' : 'Add New Transaction'}
        </button>
      </div>

      {showForm && (
        <TransactionForm
          onTransactionCreated={handleTransactionCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTransaction && (
        <TransactionEditForm
          transaction={editingTransaction}
          onTransactionUpdated={handleTransactionUpdated}
          onCancel={handleCancelEdit}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md " data-aos="fade-up">
        {transactions.length === 0 && !loading ? (
          <p className="text-gray-600">No transactions found. Click "Add New Transaction" to create one!</p>
        ) : (
           <div className="max-h-96 overflow-y-auto overflow-x-auto" data-aos="fade-up"> {/* max-h-96 sets a max height (384px) and enables vertical scroll */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx,index) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{index+1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.account_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{tx.transaction_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.transaction_head}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.transaction_mode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.cheque_no || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(tx.transaction_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">{tx.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.created_by_username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(tx)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit Transaction"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Transaction"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
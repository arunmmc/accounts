import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

// Define your backend base URL here.
// It's good practice to put this in a .env file (e.g., VITE_API_BASE_URL=http://localhost:8000)
// and access it as import.meta.env.VITE_API_BASE_URL
// For now, we'll keep it directly for clarity, but consider moving it.
const BASE_URL = 'http://localhost:8000';

const CashbookPage = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedAccountBalance, setSelectedAccountBalance] = useState(0);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [debitTransactions, setDebitTransactions] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true); // Separate loading state for accounts
  const [loadingTransactions, setLoadingTransactions] = useState(false); // Loading state for transactions
  const [error, setError] = useState(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Effect to fetch bank accounts on initial component mount
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setLoadingAccounts(true);
        setError(null); // Clear previous errors
        const response = await axios.get(`${BASE_URL}/api/bank-accounts/`, {
          headers: getAuthHeaders(),
        });
        setBankAccounts(response.data);
        if (response.data.length > 0) {
          // Set the first account as selected by default if accounts exist
          setSelectedAccountId(response.data[0].id);
          setSelectedAccountBalance(response.data[0].current_balance);
        } else {
          // If no accounts, ensure states are reset
          setSelectedAccountId('');
          setSelectedAccountBalance(0);
        }
      } catch (err) {
        console.error('Error fetching bank accounts:', err);
        setError('Failed to load bank accounts. Please try again.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchBankAccounts();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch transactions when selectedAccountId changes
  useEffect(() => {
    const fetchTransactionsForAccount = async () => {
      // Only fetch if an account is actually selected
      if (!selectedAccountId) {
        setCreditTransactions([]);
        setDebitTransactions([]);
        // Balance might already be set from initial account fetch,
        // but ensure it's 0 if nothing is selected or if the selectedAccount
        // was just cleared because no accounts exist.
        if (bankAccounts.length === 0) {
            setSelectedAccountBalance(0);
        }
        return;
      }

      try {
        setLoadingTransactions(true); // Indicate transactions are loading
        setError(null); // Clear previous errors
        
        // Corrected template literals here:
        const transactionsResponse = await axios.get(
          `${BASE_URL}/api/transactions/?account=${selectedAccountId}`,
          { headers: getAuthHeaders() }
        );

        // Fetch the selected account's details to get its current balance
        const accountDetailsResponse = await axios.get(
          `${BASE_URL}/api/bank-accounts/${selectedAccountId}/`,
          { headers: getAuthHeaders() }
        );
        setSelectedAccountBalance(accountDetailsResponse.data.current_balance);

        const credits = transactionsResponse.data.filter(
          (t) => t.transaction_type === 'CREDIT'
        );
        const debits = transactionsResponse.data.filter(
          (t) => t.transaction_type === 'DEBIT'
        );
        setCreditTransactions(credits);
        setDebitTransactions(debits);

      } catch (err) {
        console.error('Error fetching transactions for account:', err);
        setError('Failed to load transactions for the selected account.');
        // If an error occurs, clear transactions
        setCreditTransactions([]);
        setDebitTransactions([]);
        setSelectedAccountBalance(0); // Reset balance on error
      } finally {
        setLoadingTransactions(false); // Finished loading transactions
      }
    };

    // Call the fetch function only if selectedAccountId is not null/empty and bankAccounts have been loaded
    if (!loadingAccounts && (selectedAccountId || bankAccounts.length === 0)) {
        fetchTransactionsForAccount();
    }
  }, [selectedAccountId, bankAccounts, loadingAccounts]); // Add bankAccounts and loadingAccounts to dependencies

  const handleAccountChange = (e) => {
    const newAccountId = e.target.value;
    setSelectedAccountId(newAccountId);
    const selectedAccount = bankAccounts.find(acc => String(acc.id) === newAccountId); // Compare as strings
    if (selectedAccount) {
      setSelectedAccountBalance(selectedAccount.current_balance);
    } else {
      setSelectedAccountBalance(0); // Reset balance if no account selected or found
    }
  };

  // --- Render Logic ---

  if (loadingAccounts) {
    return <div className="p-8 text-center text-gray-600">Loading bank accounts...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  // Display message if no bank accounts exist
  if (bankAccounts.length === 0) {
    return (
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Bank Cashbook</h1>
        <p className="text-xl text-gray-700">
          No bank accounts found. Please go to the{' '}
          <a href="/accounts" className="text-blue-600 hover:underline">Bank Accounts</a> page to create your first account.
        </p>
      </div>
    );
  }

  // Main content once accounts are loaded and at least one exists
  return (
    <div className="p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bank Cashbook</h1>

      <div className="mb-6 flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-4">
        <label htmlFor="bankAccountSelect" className="font-semibold text-lg text-gray-700 min-w-[150px]">
          Select Bank Account:
        </label>
        <select
          id="bankAccountSelect"
          value={selectedAccountId}
          onChange={handleAccountChange}
          className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base flex-grow md:flex-grow-0"
        >
          {/* Ensure an option is selected if selectedAccountId is not yet set */}
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.account_number})
            </option>
          ))}
        </select>
        <div className="md:ml-auto text-xl font-bold text-gray-800">
            Current Balance: <span className="text-blue-600">₹{selectedAccountBalance.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {loadingTransactions ? (
        <div className="text-center text-gray-600 py-8">Loading transactions...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Credit Transactions (Left Pan) */}
          <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Credits (Income)</h2>
            {creditTransactions.length === 0 ? (
              <p className="text-gray-500">No credit transactions for this account.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-green-300 rounded-md">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Head</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Desc.</th>
                      <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-green-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-800">
                          {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                        </td>
                        <td className="py-2 px-4 border-b text-sm text-gray-800">{transaction.transaction_head}</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-800 max-w-xs truncate">{transaction.description || '-'}</td>
                        <td className="py-2 px-4 border-b text-right text-sm font-semibold text-green-600">
                          ₹{transaction.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Debit Transactions (Right Pan) */}
          <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
            <h2 className="text-2xl font-bold mb-4 text-red-700">Debits (Expenses)</h2>
            {debitTransactions.length === 0 ? (
              <p className="text-gray-500">No debit transactions for this account.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-red-300 rounded-md">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Head</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">Desc.</th>
                      <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-red-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-800">
                          {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                        </td>
                        <td className="py-2 px-4 border-b text-sm text-gray-800">{transaction.transaction_head}</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-800 max-w-xs truncate">{transaction.description || '-'}</td>
                        <td className="py-2 px-4 border-b text-right text-sm font-semibold text-red-600">
                          ₹{transaction.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CashbookPage;
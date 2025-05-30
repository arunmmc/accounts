// src/components/forms/TransactionEditForm.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

// Hardcoded choices from your Django model (same as TransactionForm)
const TRANSACTION_TYPES = [
  { value: 'DEBIT', label: 'Debit' },
  { value: 'CREDIT', label: 'Credit' },
];

const TRANSACTION_MODES = [
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'CHEQUE', label: 'CHEQUE' },
  { value: 'CASH', label: 'CASH' },
  { value: 'OTHER', label: 'OTHER' },
];

const TRANSACTION_HEADS = [
  { value: 'ADVANCE', label: 'ADVANCE' },
  { value: 'REIMBURSEMENT', label: 'REIMBURSEMENT' },
  { value: 'ELECTRICITY', label: 'Electricity Bill' },
  { value: 'REMUNERATION_TEACHERS', label: 'Teachers Remuneration' },
  { value: 'SALARIES_STAFF', label: 'Staff Salaries' },
  { value: 'MAINTENANCE_BUILDING', label: 'Building Maintenance' },
  { value: 'LIBRARY_BOOKS', label: 'Library Books/Resources' },
  { value: 'LAB_EQUIPMENT', label: 'Lab Equipment Purchase' },
  { value: 'SPORTS_EQUIPMENT', label: 'Sports Equipment' },
  { value: 'HOSTEL_EXPENSES', label: 'Hostel Operations/Maintenance' },
  { value: 'ADVERTISING_MARKETING', label: 'Advertising & Marketing' },
  { value: 'STUDENT_WELFARE', label: 'Student Welfare Activities' },
  { value: 'UTILITIES_WATER', label: 'Water Bill' },
  { value: 'TELEPHONE_INTERNET', label: 'Telephone & Internet Bills' },
  { value: 'TRANSPORTATION', label: 'Transportation Costs' },
  { value: 'EXAM_FEES_COLLECTION', label: 'Exam Fees Collection' },
  { value: 'ADMISSION_FEES_COLLECTION', label: 'Admission Fees Collection' },
  { value: 'DONATIONS_RECEIVED', label: 'Donations Received' },
  { value: 'BANK_INTEREST_EARNED', label: 'Bank Interest Earned' },
  { value: 'VENDOR_PAYMENT_SUPPLIES', label: 'Vendor Payment - Office Supplies' },
  { value: 'SECURITY_SERVICES', label: 'Security Services' },
  { value: 'AUDIT_FEES', label: 'Audit Fees' },
  { value: 'SCHOLARSHIPS_DISBURSED', label: 'Scholarships Disbursed' },
  { value: 'CULTURAL_EVENTS', label: 'Cultural Event Expenses' },
  { value: 'SPORTS_EVENTS', label: 'Sports Event Expenses' },
  { value: 'RENT_RECEIVED', label: 'Rent Received (Property/Facilities)' },
  { value: 'SEMINARS_WORKSHOPS', label: 'Seminars & Workshops Expenses' },
  { value: 'RESEARCH_GRANTS_RECEIVED', label: 'Research Grants Received' },
  { value: 'BANK_CHARGES', label: 'Bank Charges/Fees' },
  { value: 'STUDENT_FEES_TUITION', label: 'Student Tuition Fees' },
  { value: 'EQUIPMENT_REPAIR', label: 'Equipment Repair & Servicing' },
  { value: 'UNIFORM_PURCHASE', label: 'Uniform Purchase' },
  { value: 'PRINTING_STATIONERY', label: 'Printing & Stationery' },
  { value: 'GOVT_GRANTS_RECEIVED', label: 'Government Grants Received' },
  { value: 'TAX_PAYMENTS', label: 'Tax Payments' },
  { value: 'LOAN_REPAYMENT', label: 'Loan Repayment (Principal & Interest)' },
  { value: 'CONSTRUCTION_EXPENSES', label: 'New Construction/Renovation' },
  { value: 'OTHERS', label: 'OTHERS' },
];


const TransactionEditForm = ({ transaction, onTransactionUpdated, onCancel }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [transactionHead, setTransactionHead] = useState('');
  const [transactionMode, setTransactionMode] = useState('');
  const [amount, setAmount] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch bank accounts for the dropdown
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await axiosInstance.get('bank-accounts/');
        setBankAccounts(response.data);
        // If selectedAccount is still empty (e.g., no account was pre-selected or transaction.account was null)
        // and there are accounts available, default to the first one.
        if (selectedAccount === '' && response.data.length > 0) {
            setSelectedAccount(response.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching bank accounts for transaction form:', err);
        setFormError('Failed to load bank accounts.');
      }
    };
    fetchBankAccounts();
  }, [selectedAccount]); // Keep selectedAccount here for re-evaluation if it changes after accounts are fetched

  // Populate form fields when the transaction prop changes
  useEffect(() => {
    if (transaction) {
      setSelectedAccount(transaction.account ? transaction.account : '');
      setTransactionType(transaction.transaction_type);
      setTransactionHead(transaction.transaction_head); // Corrected this line earlier, ensure it's `transaction.transaction_head`
      setTransactionMode(transaction.transaction_mode);
      setAmount(transaction.amount.toString());
      setChequeNo(transaction.cheque_no || '');
      setTransactionDate(transaction.transaction_date);
      setDescription(transaction.description || '');
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setLoading(true);

    // Frontend validation: Ensure selectedAccount is a valid number ID
    const accountId = parseInt(selectedAccount);
    if (isNaN(accountId) || !selectedAccount) {
      setFormError('Please select a valid bank account.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        // *** CRITICAL FIX 1: Change account_id to account ***
        account: accountId, // Send 'account' as expected by serializer
        transaction_type: transactionType,
        transaction_head: transactionHead,
        transaction_mode: transactionMode,
        amount: parseFloat(amount),
        cheque_no: chequeNo || null,
        description: description,
        transaction_date: transactionDate,
      };

      const response = await axiosInstance.put(`transactions/${transaction.id}/`, payload);
      setSuccess('Transaction updated successfully!');
      setLoading(false);
      if (onTransactionUpdated) {
        // Give a brief moment for success message to show before closing
        setTimeout(() => onTransactionUpdated(response.data), 1000);
      }
      if (onCancel) {
        setTimeout(() => onCancel(), 1000); // Close form after a delay
      }

    } catch (err) {
      console.error('Error updating transaction:', err.response?.data || err.message);
      if (err.response?.data) {
        const errors = err.response.data;
        let errorMessage = 'Failed to update transaction:';
        for (const key in errors) {
          if (Array.isArray(errors[key])) { // Ensure errors[key] is treated as an array for join()
            errorMessage += ` ${key}: ${errors[key].join(', ')}`;
          } else {
            errorMessage += ` ${key}: ${errors[key]}`; // Handle non-array errors
          }
        }
        setFormError(errorMessage);
      } else {
        setFormError('Failed to update transaction. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8" data-aos="fade-up">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="bankAccount" className="block text-gray-700 text-sm font-bold mb-2">Bank Account</label>
          <select
            id="bankAccount"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedAccount}
            // *** CRITICAL FIX 2: Add parseInt() here ***
            onChange={(e) => setSelectedAccount(parseInt(e.target.value))}
            required
            disabled={loading || bankAccounts.length === 0}
          >
            {bankAccounts.length === 0 ? (
              <option value="">No accounts available</option>
            ) : (
              <>
                {/* Optional: Add a "Select an account" option if selectedAccount is not set */}
                {selectedAccount === '' && <option value="">-- Select an account --</option>}
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.account_number})
                  </option>
                ))}
              </>
            )}
          </select>
          {bankAccounts.length === 0 && (
            <p className="text-red-500 text-xs italic mt-2">Please create a bank account first.</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="transactionType" className="block text-gray-700 text-sm font-bold mb-2">Transaction Type</label>
          <select
            id="transactionType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            required
            disabled={loading}
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="transactionHead" className="block text-gray-700 text-sm font-bold mb-2">Transaction Head</label>
          <select
            id="transactionHead"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionHead}
            onChange={(e) => setTransactionHead(e.target.value)}
            required
            disabled={loading}
          >
            {TRANSACTION_HEADS.map((head) => (
              <option key={head.value} value={head.value}>{head.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="transactionMode" className="block text-gray-700 text-sm font-bold mb-2">Transaction Mode</label>
          <select
            id="transactionMode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionMode}
            onChange={(e) => setTransactionMode(e.target.value)}
            required
            disabled={loading}
          >
            {TRANSACTION_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
          <input
            type="number"
            id="amount"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 500.00"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="chequeNo" className="block text-gray-700 text-sm font-bold mb-2">Cheque No. (Optional)</label>
          <input
            type="text"
            id="chequeNo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 000123"
            value={chequeNo}
            onChange={(e) => setChequeNo(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="transactionDate" className="block text-gray-700 text-sm font-bold mb-2">Transaction Date</label>
          <input
            type="date"
            id="transactionDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description (Optional)</label>
          <textarea
            id="description"
            rows="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Details about this transaction"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          ></textarea>
        </div>

        {formError && (
          <p className="text-red-500 text-xs italic mb-4 text-center">{formError}</p>
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
            {loading ? 'Updating...' : 'Update Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionEditForm;
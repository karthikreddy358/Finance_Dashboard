import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { transactionAPI } from '../services';
import { useAuth } from '../context/AuthContext';

const Records = () => {
  const { user } = useAuth();
  const role = user?.role || 'viewer';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: '',
    notes: '',
  });

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await transactionAPI.getAll({ limit: 50 });
      setRecords(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (!window.confirm('Delete this transaction?')) return;

    try {
      setError('');
      setSuccess('');
      await transactionAPI.delete(id);
      setSuccess('Transaction deleted successfully.');
      await loadRecords();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete transaction.');
    }
  };

  const openEditModal = (tx) => {
    setEditingRecord(tx);
    setSuccess('');
    setError('');
    setEditForm({
      amount: tx.amount,
      type: tx.type,
      category: tx.category || '',
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '',
      notes: tx.notes || '',
    });
  };

  const closeEditModal = () => {
    setEditingRecord(null);
    setEditForm({
      amount: '',
      type: 'expense',
      category: '',
      date: '',
      notes: '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (role !== 'admin' || !editingRecord) return;

    try {
      setError('');
      setSuccess('');
      await transactionAPI.update(editingRecord._id, {
        amount: Number(editForm.amount),
        type: editForm.type,
        category: editForm.category.trim(),
        date: editForm.date,
        notes: editForm.notes.trim(),
      });
      setSuccess('Transaction updated successfully.');
      closeEditModal();
      await loadRecords();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update transaction.');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Records</h1>
          <p className="text-gray-600 mt-1">All transaction entries stored in the system.</p>
        </div>
        <button
          onClick={loadRecords}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Notes</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  {role === 'admin' && (
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {records.map((tx) => (
                  <tr key={tx._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{tx.notes || 'No description'}</td>
                    <td className="py-3 px-4 text-gray-700">{tx.category}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                    {role === 'admin' && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L12 18H9v-3l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(tx._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {role === 'admin' && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Transaction</h2>
                <p className="text-sm text-gray-500">Update the record and save changes.</p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Amount</span>
                  <input
                    type="number"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Type</span>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Category</span>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Date</span>
                <input
                  type="date"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Notes</span>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Records;

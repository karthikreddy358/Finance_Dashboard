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
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Records;

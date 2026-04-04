import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, transactionAPI } from '../services';
import DashboardLayout from '../components/layout/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'analyst';

  // State
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [createForm, setCreateForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const fetchDashboardData = useCallback(async (withLoader = false) => {
    try {
      if (withLoader) {
        setLoading(true);
      }
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsRes, categoriesRes, trendsRes, transactionsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCategories(),
        dashboardAPI.getTrends(),
        transactionAPI.getAll({ limit: 10 }),
      ]);

      setStats(statsRes.data);
      setCategories(categoriesRes.data);

      // Transform monthly trends data for chart display
      const trends = trendsRes.data;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = trends.map((t, index) => ({
        month: monthNames[index],
        value: t.income + t.expenses,
        income: t.income,
        expenses: t.expenses,
      }));
      setMonthlyData(chartData);

      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      if (withLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const maxValue = monthlyData.length > 0
    ? Math.max(...monthlyData.map(d => d.value))
    : 0;
  const chartDenominator = maxValue > 0 ? maxValue : 1;

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    if (actionError) setActionError('');
    if (actionSuccess) setActionSuccess('');
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();

    if (role !== 'admin') {
      setActionError('Only admin users can add transactions from this dashboard section.');
      return;
    }

    setIsSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      await transactionAPI.create({
        amount: Number(createForm.amount),
        type: createForm.type,
        category: createForm.category.trim(),
        date: createForm.date,
        notes: createForm.notes.trim(),
      });

      setActionSuccess('Transaction added successfully.');
      setCreateForm({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
      });

      await fetchDashboardData(false);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to add transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await transactionAPI.delete(id);
      setActionSuccess('Transaction deleted successfully.');
      await fetchDashboardData(false);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to delete transaction.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name}! Here's your financial overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats?.totalIncome || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Expense</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(stats?.totalExpenses || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Net Balance</p>
                <p className={`text-3xl font-bold ${(stats?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.netBalance || 0)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Monthly Trends Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Monthly Trends
        </h3>
        {monthlyData.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 rounded-t-md transition-all hover:bg-green-600"
                  style={{
                    height: `${(data.value / chartDenominator) * 200}px`,
                    minHeight: '20px',
                  }}
                  title={`Income: ${formatCurrency(data.income)}\nExpenses: ${formatCurrency(data.expenses)}`}
                ></div>

                <p className="text-sm text-gray-600 mt-2">{data.month}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No transaction data available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Category Breakdown
          </h3>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {cat.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-500"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {formatCurrency(cat.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data to display</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold text-gray-900">
                {stats?.transactionCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">
                {transactions.filter(t => {
                  const txDate = new Date(t.date);
                  const now = new Date();
                  return txDate.getMonth() === now.getMonth() &&
                         txDate.getFullYear() === now.getFullYear();
                }).length}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Categories Used</span>
              <span className="font-semibold text-gray-900">
                {categories.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Your Role</span>
              <span className={`font-semibold ${role === 'admin' ? 'text-green-600' : role === 'analyst' ? 'text-blue-600' : 'text-purple-600'}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">User</span>
              <span className="font-semibold text-gray-900">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Create Transaction */}
      {role === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Admin Transaction Entry</h3>
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              {showCreateForm ? 'Hide Form' : 'Add Transaction'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="amount"
                  value={createForm.amount}
                  onChange={handleCreateChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={createForm.type}
                  onChange={handleCreateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={createForm.category}
                  onChange={handleCreateChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={createForm.date}
                  onChange={handleCreateChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={createForm.notes}
                  onChange={handleCreateChange}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {(actionError || actionSuccess) && (
        <div className={`mb-6 p-4 border rounded-lg ${actionError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {actionError || actionSuccess}
        </div>
      )}

      {role !== 'viewer' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            <span className="text-sm text-gray-500">Latest 10 records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  {role === 'admin' && (
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{tx.notes || 'No description'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tx.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
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
                      <td
                        className={`py-3 px-4 text-right font-semibold ${
                          tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>
                      {role === 'admin' && (
                        <td className="py-3 px-4">
                          <div className="flex justify-center space-x-2">
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={role === 'admin' ? 6 : 5} className="py-12 text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No transactions yet</p>
                      <p className="text-sm mt-1">Start by adding your first income or expense</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;

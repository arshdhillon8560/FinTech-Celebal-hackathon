import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { transactionAPI, alertAPI } from '../services/api.js';
import { geminiAPI } from '../services/geminiAPI.js';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

type Stats = {
  categoryBreakdown: { [key: string]: number };
  monthlyTrends: { month: string; amount: number }[];
  thisMonth: number;
  lastMonth: number;
  monthlyChange: number;
};

type Transaction = {
  _id: string;
  description: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
};

type Alert = {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [geminiAnalysis, setGeminiAnalysis] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, transactionsRes, alertsRes] = await Promise.all([
        transactionAPI.getSpendingStats(),
        transactionAPI.getTransactions(),
        alertAPI.getAlerts()
      ]);

      setStats(statsRes.data);
      setRecentTransactions(transactionsRes.data.slice(0, 5));
      setAlerts(alertsRes.data.filter((alert: any) => !alert.isRead).slice(0, 3));

      // ======= GEMINI AI ANALYSIS =======
      const summaryText = transactionsRes.data
        .map(t => `${t.type} of $${t.amount} for ${t.category}`)
        .join('; ');

      const geminiRes = await geminiAPI.analyzeExpenses(summaryText);
      setGeminiAnalysis(geminiRes.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categoryColors = {
    food: '#10B981',
    transport: '#3B82F6',
    shopping: '#F59E0B',
    entertainment: '#8B5CF6',
    utilities: '#EF4444',
    healthcare: '#06B6D4',
    other: '#6B7280'
  };

  const categoryData = {
    labels: Object.keys(stats?.categoryBreakdown || {}),
    datasets: [
      {
        data: Object.values(stats?.categoryBreakdown || {}),
        backgroundColor: Object.keys(stats?.categoryBreakdown || {}).map(
          category => categoryColors[category as keyof typeof categoryColors] || '#6B7280'
        ),
        borderWidth: 0
      }
    ]
  };

  const monthlyData = {
    labels: stats?.monthlyTrends?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Spending',
        data: stats?.monthlyTrends?.map(item => item.amount) || [],
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="text-blue-600">{user?.name}</span>
        </h1>
        <p className="text-gray-600 mt-1">Here’s your financial overview</p>
      </div>

      {/* Gemini AI Analysis */}
      {geminiAnalysis && (
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis of Expenses</h3>
          <p className="text-gray-700">{geminiAnalysis}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Current Balance',
            value: `$${user?.balance?.toFixed(2)}`,
            icon: <CreditCard className="h-6 w-6 text-blue-600" />,
            bg: 'bg-blue-100'
          },
          {
            title: 'This Month',
            value: `$${stats?.thisMonth?.toFixed(2) || '0.00'}`,
            icon: <TrendingUp className="h-6 w-6 text-red-600" />,
            bg: 'bg-red-100',
            change: stats?.monthlyChange
          },
          {
            title: 'Last Month',
            value: `$${stats?.lastMonth?.toFixed(2) || '0.00'}`,
            icon: <TrendingDown className="h-6 w-6 text-green-600" />,
            bg: 'bg-green-100'
          },
          {
            title: 'Active Alerts',
            value: alerts.length,
            icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
            bg: alerts.length > 0 ? 'bg-amber-100' : 'bg-gray-100'
          }
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
                {card.change !== undefined && (
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500 ml-1">
                      {card.change > 0 ? '+' : ''}{(card.change ?? 0).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="h-72 sm:h-80">
            {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 ? (
              <Doughnut data={categoryData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No spending data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="h-72 sm:h-80">
            {stats?.monthlyTrends && stats.monthlyTrends.length > 0 ? (
              <Bar data={monthlyData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map(transaction => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}`}
                  >
                    {transaction.type === 'expense' ? (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500 capitalize">{transaction.category}</p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}
                >
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert._id}
                className="p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800 capitalize">
                    {alert.type} Alert
                  </span>
                </div>
                <p className="text-sm text-amber-700">{alert.message}</p>
                <p className="text-xs text-amber-600 mt-1">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Settings, Check, Bell } from 'lucide-react';
import { alertAPI } from '../services/api.js';

type Alert = {
  _id: string;
  id?: string;
  type: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
};

type Settings = {
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  largeTransactionThreshold: number;
  enableEmailNotifications: boolean;
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<Settings>({
    dailyLimit: 100,
    weeklyLimit: 500,
    monthlyLimit: 2000,
    largeTransactionThreshold: 200,
    enableEmailNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertsRes, settingsRes] = await Promise.all([
        alertAPI.getAlerts(),
        alertAPI.getSettings(),
      ]);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch alerts or settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await alertAPI.markAsRead(alertId);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert._id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }));
  };

  const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await alertAPI.updateSettings(settings);
      setShowSettings(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spending_limit':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'large_transaction':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'unusual_activity':
        return <AlertTriangle className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    switch (type) {
      case 'spending_limit':
        return 'bg-amber-50 border-amber-200';
      case 'large_transaction':
        return 'bg-red-50 border-red-200';
      case 'unusual_activity':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600 mt-1">Manage your fraud alerts and spending limits</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      {/* Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Daily Limit', value: settings.dailyLimit, color: 'blue' },
          { label: 'Weekly Limit', value: settings.weeklyLimit, color: 'amber' },
          { label: 'Monthly Limit', value: settings.monthlyLimit, color: 'green' },
          { label: 'Large Transaction', value: settings.largeTransactionThreshold, color: 'red' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">${item.value}</p>
              </div>
              <div className={`bg-${item.color}-100 p-3 rounded-xl`}>
                <AlertTriangle className={`h-6 w-6 text-${item.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Recent Alerts</h3>
        </div>

        {alerts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-6 border-l-4 ${getAlertColor(alert.type || 'general', !!alert.isRead)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{getAlertIcon(alert.type || 'general')}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 capitalize">
                        {(alert.type || 'general').replace('_', ' ')} Alert
                      </h4>
                      <p className="text-gray-700 mt-1">{alert.message || 'No details available.'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                        <span>{alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : ''}</span>
                        {alert.isRead && (
                          <span className="flex items-center space-x-1 text-green-600">
                            <Check className="h-3 w-3" />
                            <span>Read</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert._id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
            <p className="text-gray-500">You're all caught up! No fraud alerts at this time.</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Alert Settings</h2>

            <form onSubmit={handleUpdateSettings} className="space-y-6">
              {['dailyLimit', 'weeklyLimit', 'monthlyLimit', 'largeTransactionThreshold'].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')} ($)
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={settings[field as keyof Settings]}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={0}
                    step={0.01}
                    required
                  />
                </div>
              ))}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="enableEmailNotifications"
                  checked={settings.enableEmailNotifications}
                  onChange={handleSettingsChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Enable email notifications for alerts
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;

import React, { useState, useEffect } from 'react';
import { Send, ArrowRightLeft, User, Search } from 'lucide-react';
import { transferAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';

const Transfers = () => {
  const { user, updateBalance } = useAuth();

  type UserType = {
    _id: string;
    name: string;
    email: string;
    // add other user properties if needed
  };

  type Transfer = {
    _id: string;
    sender: UserType | null;
    recipient: UserType | null;
    amount: number;
    description?: string;
    createdAt: string;
    status: string;
    // add other transfer properties if needed
  };

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);

  const [formData, setFormData] = useState({
    recipientId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchData = async () => {
    try {
      const [transfersRes, usersRes] = await Promise.all([
        transferAPI.getTransfers(),
        transferAPI.getUsers(),
      ]);

      setTransfers(transfersRes.data);
      const currentUserId = user?.id;
      setUsers(
        usersRes.data.filter((u: UserType) =>
          currentUserId ? u._id !== currentUserId : true
        )
      );
      setFilteredUsers(
        usersRes.data.filter((u: UserType) =>
          currentUserId ? u._id !== currentUserId : true
        )
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await transferAPI.sendTransfer(formData);
      updateBalance(response.data.newBalance);
      await fetchData();
      setShowSendModal(false);
      resetForm();
    } catch (error) {
      console.error('Error sending transfer:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // @ts-expect-error: error may be axios error
        alert(error.response?.data?.message || 'Error sending transfer');
      } else {
        alert('Error sending transfer');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recipientId: '',
      amount: '',
      description: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectRecipient = (userId: string) => {
    setFormData({
      ...formData,
      recipientId: userId,
    });
  };

  const getSelectedUser = () => {
    return users.find((u) => u._id === formData.recipientId);
  };

  if (loading && transfers.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600 mt-1">Send money to other users</p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Send className="h-5 w-5" />
          <span>Send Money</span>
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <h2 className="text-lg font-semibold mb-2">Available Balance</h2>
        <p className="text-4xl font-bold">${user?.balance?.toFixed(2)}</p>
      </div>

      {/* Transfer History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Transfer History</h3>
        </div>

        {transfers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {transfers.map((transfer) => (
              <div key={transfer._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        transfer.sender?._id === user?.id
                          ? 'bg-red-100'
                          : 'bg-green-100'
                      }`}
                    >
                      <ArrowRightLeft
                        className={`h-6 w-6 ${
                          transfer.sender?._id === user?.id
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {transfer.sender?._id === user?.id
                          ? 'Sent to'
                          : 'Received from'}{' '}
                        {transfer.sender?._id === user?.id
                          ? transfer.recipient?.name || 'Unknown User'
                          : transfer.sender?.name || 'Unknown User'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {transfer.description || 'No description'} •{' '}
                        {transfer.createdAt
                          ? new Date(transfer.createdAt).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-bold ${
                        transfer.sender?._id === user?.id
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {transfer.sender?._id === user?.id ? '-' : '+'}$
                      {transfer.amount?.toFixed(2)}
                    </span>
                    <p className="text-sm text-gray-500 capitalize">
                      {transfer.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
              <ArrowRightLeft className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transfers yet
            </h3>
            <p className="text-gray-500">Start sending money to other users</p>
          </div>
        )}
      </div>

      {/* Send Money Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Money</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient
                </label>
                {formData.recipientId ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getSelectedUser()?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getSelectedUser()?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, recipientId: '' })
                      }
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      {filteredUsers.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => selectRecipient(u._id)}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <p className="text-gray-500 text-center py-2 text-sm">
                          No users found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  max={user?.balance}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${user?.balance?.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's this for?"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSendModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.recipientId || !formData.amount}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;

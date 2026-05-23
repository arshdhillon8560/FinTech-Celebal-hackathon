import { AxiosInstance, AxiosResponse } from 'axios';

export const api: AxiosInstance;

export type Transaction = {
  _id: string;
  description: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
};

export type Transfer = {
  _id: string;
  from: string;
  to: string;
  amount: number;
  status: string;
};

export type Alert = {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
};

export type AlertSettings = {
  enabled: boolean;
  threshold?: number;
};

export const transactionAPI: {
  getTransactions: () => Promise<AxiosResponse<Transaction[]>>;
  addTransaction: (transaction: Partial<Transaction>) => Promise<AxiosResponse>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<AxiosResponse>;
  deleteTransaction: (id: string) => Promise<AxiosResponse>;
  getSpendingStats: (period?: string) => Promise<AxiosResponse>;
};

export const transferAPI: {
  getTransfers: () => Promise<AxiosResponse<Transfer[]>>;
  sendTransfer: (transfer: Partial<Transfer>) => Promise<AxiosResponse>;
  getUsers: () => Promise<AxiosResponse>;
};

export const alertAPI: {
  getAlerts: () => Promise<AxiosResponse<Alert[]>>;
  markAsRead: (id: string) => Promise<AxiosResponse>;
  updateSettings: (settings: AlertSettings) => Promise<AxiosResponse>;
  getSettings: () => Promise<AxiosResponse<AlertSettings>>;
};

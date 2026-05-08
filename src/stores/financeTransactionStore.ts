import { create } from 'zustand';
import type { FinanceTransaction, FinanceTransactionFormData } from '@/types';
import { financeTransactionApi } from '@/lib/finance';

interface FinanceTransactionState {
  transactions: FinanceTransaction[];
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;
  filters: {
    transactionType?: string;
    direction?: string;
  };

  fetchTransactions: () => Promise<void>;
  createTransaction: (data: FinanceTransactionFormData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: any) => void;
  resetFilters: () => void;
}

export const useFinanceTransactionStore = create<FinanceTransactionState>((set, get) => ({
  transactions: [],
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,
  filters: {},

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const { page, pageSize, filters } = get();
      const response = await financeTransactionApi.getTransactions({ page, pageSize, ...filters });
      set({
        transactions: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取财务流水失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createTransaction: async (data: FinanceTransactionFormData) => {
    set({ submitting: true });
    try {
      await financeTransactionApi.createTransaction(data);
      set({ submitting: false });
      await get().fetchTransactions();
    } catch (error) {
      console.error('创建财务流水失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  deleteTransaction: async (id: string) => {
    set({ loading: true });
    try {
      await financeTransactionApi.deleteTransaction(id);
      set({ loading: false });
      await get().fetchTransactions();
    } catch (error) {
      console.error('删除财务流水失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchTransactions();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchTransactions();
  },

  setFilters: (filters: any) => {
    set({ filters: { ...get().filters, ...filters }, page: 1 });
    get().fetchTransactions();
  },

  resetFilters: () => {
    set({ filters: {}, page: 1 });
    get().fetchTransactions();
  },
}));

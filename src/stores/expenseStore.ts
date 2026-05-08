import { create } from 'zustand';
import type { ExpenseRecord, ExpenseRecordFormData } from '@/types';
import { expenseApi } from '@/lib/finance';

interface ExpenseState {
  expenses: ExpenseRecord[];
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;

  fetchExpenses: () => Promise<void>;
  createExpense: (data: ExpenseRecordFormData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,

  fetchExpenses: async () => {
    set({ loading: true });
    try {
      const { page, pageSize } = get();
      const response = await expenseApi.getExpenses({ page, pageSize });
      set({
        expenses: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取费用记录失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createExpense: async (data: ExpenseRecordFormData) => {
    set({ submitting: true });
    try {
      await expenseApi.createExpense(data);
      set({ submitting: false });
      await get().fetchExpenses();
    } catch (error) {
      console.error('创建费用记录失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    set({ loading: true });
    try {
      await expenseApi.deleteExpense(id);
      set({ loading: false });
      await get().fetchExpenses();
    } catch (error) {
      console.error('删除费用记录失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchExpenses();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchExpenses();
  },
}));

import { create } from 'zustand';
import type { PaymentRecord, PaymentRecordFormData } from '@/types';
import { paymentApi } from '@/lib/sales';

interface PaymentState {
  records: PaymentRecord[];
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;

  fetchRecords: () => Promise<void>;
  createPayment: (data: PaymentRecordFormData) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  records: [],
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,

  fetchRecords: async () => {
    set({ loading: true });
    try {
      const { page, pageSize } = get();
      const response = await paymentApi.getPaymentRecords({ page, pageSize });
      set({
        records: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取收款记录失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createPayment: async (data: PaymentRecordFormData) => {
    set({ submitting: true });
    try {
      await paymentApi.createPaymentRecord(data);
      set({ submitting: false });
      await get().fetchRecords();
    } catch (error) {
      console.error('创建收款记录失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchRecords();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchRecords();
  },
}));

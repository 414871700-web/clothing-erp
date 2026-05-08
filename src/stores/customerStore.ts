import { create } from 'zustand';
import type { Customer, CustomerFormData } from '@/types';
import { customerApi } from '@/lib/sales';

interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  total: number;
  loading: boolean;
  submitting: boolean;

  fetchCustomers: () => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  createCustomer: (data: CustomerFormData) => Promise<void>;
  updateCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  clearCurrentCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  currentCustomer: null,
  total: 0,
  loading: false,
  submitting: false,

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const customers = await customerApi.getCustomers();
      set({ customers, total: customers.length, loading: false });
    } catch (error) {
      console.error('获取客户列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchCustomer: async (id: string) => {
    set({ loading: true });
    try {
      const customer = await customerApi.getCustomer(id);
      set({ currentCustomer: customer, loading: false });
    } catch (error) {
      console.error('获取客户详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createCustomer: async (data: CustomerFormData) => {
    set({ submitting: true });
    try {
      await customerApi.createCustomer(data);
      set({ submitting: false });
      await get().fetchCustomers();
    } catch (error) {
      console.error('创建客户失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  updateCustomer: async (id: string, data: Partial<CustomerFormData>) => {
    set({ submitting: true });
    try {
      await customerApi.updateCustomer(id, data);
      set({ submitting: false });
      await get().fetchCustomers();
      if (get().currentCustomer?.id === id) {
        await get().fetchCustomer(id);
      }
    } catch (error) {
      console.error('更新客户失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    set({ loading: true });
    try {
      await customerApi.deleteCustomer(id);
      set({ loading: false });
      await get().fetchCustomers();
    } catch (error) {
      console.error('删除客户失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  clearCurrentCustomer: () => {
    set({ currentCustomer: null });
  },
}));

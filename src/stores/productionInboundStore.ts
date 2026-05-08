import { create } from 'zustand';
import type { ProductionInboundOrder, ProductionInboundFormData } from '@/types';
import { productionInboundApi } from '@/lib/finance';

interface ProductionInboundState {
  inboundOrders: ProductionInboundOrder[];
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;

  fetchInboundOrders: () => Promise<void>;
  createInboundOrder: (data: ProductionInboundFormData) => Promise<void>;
  deleteInboundOrder: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export const useProductionInboundStore = create<ProductionInboundState>((set, get) => ({
  inboundOrders: [],
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,

  fetchInboundOrders: async () => {
    set({ loading: true });
    try {
      const { page, pageSize } = get();
      const response = await productionInboundApi.getInboundOrders({ page, pageSize });
      set({
        inboundOrders: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取生产入库单失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createInboundOrder: async (data: ProductionInboundFormData) => {
    set({ submitting: true });
    try {
      await productionInboundApi.createInboundOrder(data);
      set({ submitting: false });
      await get().fetchInboundOrders();
    } catch (error) {
      console.error('创建生产入库单失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  deleteInboundOrder: async (id: string) => {
    set({ loading: true });
    try {
      await productionInboundApi.deleteInboundOrder(id);
      set({ loading: false });
      await get().fetchInboundOrders();
    } catch (error) {
      console.error('删除生产入库单失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchInboundOrders();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchInboundOrders();
  },
}));

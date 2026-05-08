import { create } from 'zustand';
import type { ProductionCost, ProductionCostFormData } from '@/types';
import { productionCostApi } from '@/lib/finance';

interface ProductionCostState {
  costs: ProductionCost[];
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;

  fetchCosts: () => Promise<void>;
  createCost: (data: ProductionCostFormData) => Promise<void>;
  updateCost: (id: string, data: Partial<ProductionCostFormData>) => Promise<void>;
  deleteCost: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export const useProductionCostStore = create<ProductionCostState>((set, get) => ({
  costs: [],
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,

  fetchCosts: async () => {
    set({ loading: true });
    try {
      const { page, pageSize } = get();
      const response = await productionCostApi.getCosts({ page, pageSize });
      set({
        costs: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取生产成本失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createCost: async (data: ProductionCostFormData) => {
    set({ submitting: true });
    try {
      await productionCostApi.createCost(data);
      set({ submitting: false });
      await get().fetchCosts();
    } catch (error) {
      console.error('创建生产成本失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  updateCost: async (id: string, data: Partial<ProductionCostFormData>) => {
    set({ submitting: true });
    try {
      await productionCostApi.updateCost(id, data);
      set({ submitting: false });
      await get().fetchCosts();
    } catch (error) {
      console.error('更新生产成本失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  deleteCost: async (id: string) => {
    set({ loading: true });
    try {
      await productionCostApi.deleteCost(id);
      set({ loading: false });
      await get().fetchCosts();
    } catch (error) {
      console.error('删除生产成本失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchCosts();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchCosts();
  },
}));

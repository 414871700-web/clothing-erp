import { create } from 'zustand';
import type { InventoryWithDetails, InventoryQueryParams } from '@/types';
import { inventoryApi } from '@/lib/inventory';

interface InventoryState {
  inventories: InventoryWithDetails[];
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;
  filters: InventoryQueryParams;

  fetchInventories: (params?: InventoryQueryParams) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: Partial<InventoryQueryParams>) => void;
  resetFilters: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventories: [],
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,
  filters: {},

  fetchInventories: async (params?: InventoryQueryParams) => {
    set({ loading: true });
    try {
      const { page, pageSize, ...filters } = { ...get().filters, ...params };
      const response = await inventoryApi.getInventories({
        page,
        pageSize,
        ...filters,
      });
      set({
        inventories: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取库存列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchInventories();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchInventories();
  },

  setFilters: (filters: Partial<InventoryQueryParams>) => {
    set({ filters: { ...get().filters, ...filters }, page: 1 });
    get().fetchInventories();
  },

  resetFilters: () => {
    set({ filters: {}, page: 1 });
    get().fetchInventories();
  },
}));

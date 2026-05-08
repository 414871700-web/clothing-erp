import { create } from 'zustand';
import type { InventoryLogWithDetails, InventoryLogQueryParams } from '@/types';
import { inventoryLogApi } from '@/lib/inventory';

interface InventoryLogState {
  logs: InventoryLogWithDetails[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  filters: InventoryLogQueryParams;

  fetchLogs: (params?: InventoryLogQueryParams) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: Partial<InventoryLogQueryParams>) => void;
  resetFilters: () => void;
}

export const useInventoryLogStore = create<InventoryLogState>((set, get) => ({
  logs: [],
  total: 0,
  loading: false,
  page: 1,
  pageSize: 10,
  filters: {},

  fetchLogs: async (params?: InventoryLogQueryParams) => {
    set({ loading: true });
    try {
      const { page, pageSize, ...filters } = { ...get().filters, ...params };
      const response = await inventoryLogApi.getInventoryLogs({
        page,
        pageSize,
        ...filters,
      });
      set({
        logs: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取库存流水失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchLogs();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchLogs();
  },

  setFilters: (filters: Partial<InventoryLogQueryParams>) => {
    set({ filters: { ...get().filters, ...filters }, page: 1 });
    get().fetchLogs();
  },

  resetFilters: () => {
    set({ filters: {}, page: 1 });
    get().fetchLogs();
  },
}));

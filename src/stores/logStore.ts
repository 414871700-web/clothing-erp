import { create } from 'zustand';
import type { OperationLog, OperationType, ModuleType } from '@/types/logs';
import { logsApi } from '@/lib/logs';

interface LogState {
  logs: OperationLog[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  filters: {
    userId?: string;
    operationType?: OperationType;
    module?: ModuleType;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  };

  fetchLogs: () => Promise<void>;
  setFilters: (filters: Partial<LogState['filters']>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  total: 0,
  loading: false,
  page: 1,
  pageSize: 20,
  filters: {},

  fetchLogs: async () => {
    set({ loading: true });
    try {
      const { logs, filters, page, pageSize } = get();
      const result = await logsApi.getLogs({
        ...filters,
        page,
        pageSize,
      });
      set({ logs: result.logs, total: result.total, loading: false });
    } catch (error) {
      console.error('获取操作日志失败:', error);
      set({ loading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1,
    }));
  },

  setPage: (page) => {
    set({ page });
  },

  setPageSize: (pageSize) => {
    set({ pageSize, page: 1 });
  },

  resetFilters: () => {
    set({ filters: {}, page: 1 });
  },
}));

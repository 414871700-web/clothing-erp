import { create } from 'zustand';
import type { InboundOrder, InboundOrderFormData, InboundItemFormData } from '@/types';
import { inboundApi } from '@/lib/inventory';

interface InboundState {
  orders: InboundOrder[];
  currentOrder: InboundOrder | null;
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;
  warehouseId: string;
  search: string;

  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (order: InboundOrderFormData, items: InboundItemFormData[]) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setWarehouseId: (warehouseId: string) => void;
  setSearch: (search: string) => void;
  clearCurrentOrder: () => void;
}

export const useInboundStore = create<InboundState>((set, get) => ({
  orders: [],
  currentOrder: null,
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,
  warehouseId: '',
  search: '',

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const { page, pageSize, warehouseId, search } = get();
      const response = await inboundApi.getInboundOrders({
        page,
        pageSize,
        warehouseId: warehouseId || undefined,
        search: search || undefined,
      });
      set({
        orders: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取入库单列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchOrder: async (id: string) => {
    set({ loading: true });
    try {
      const order = await inboundApi.getInboundOrder(id);
      set({ currentOrder: order, loading: false });
    } catch (error) {
      console.error('获取入库单详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createOrder: async (order: InboundOrderFormData, items: InboundItemFormData[]) => {
    set({ submitting: true });
    try {
      await inboundApi.createInboundOrder(order, items);
      set({ submitting: false });
      await get().fetchOrders();
    } catch (error) {
      console.error('创建入库单失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchOrders();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchOrders();
  },

  setWarehouseId: (warehouseId: string) => {
    set({ warehouseId, page: 1 });
    get().fetchOrders();
  },

  setSearch: (search: string) => {
    set({ search, page: 1 });
    get().fetchOrders();
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));

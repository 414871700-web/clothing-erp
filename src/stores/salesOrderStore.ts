import { create } from 'zustand';
import type { SalesOrder, SalesOrderFormData } from '@/types';
import { salesApi } from '@/lib/sales';
import { logsApi } from '@/lib/logs';

interface SalesOrderState {
  orders: SalesOrder[];
  currentOrder: SalesOrder | null;
  total: number;
  loading: boolean;
  submitting: boolean;
  page: number;
  pageSize: number;
  filters: {
    customerId?: string;
    status?: string;
    paymentStatus?: string;
  };

  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (data: SalesOrderFormData) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: any) => void;
  resetFilters: () => void;
  clearCurrentOrder: () => void;
}

export const useSalesOrderStore = create<SalesOrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,
  filters: {},

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const { page, pageSize, ...filters } = get();
      const response = await salesApi.getSalesOrders({
        page,
        pageSize,
        ...filters,
      });
      set({
        orders: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取销售订单列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchOrder: async (id: string) => {
    set({ loading: true });
    try {
      const order = await salesApi.getSalesOrder(id);
      set({ currentOrder: order, loading: false });
    } catch (error) {
      console.error('获取销售订单详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createOrder: async (data: SalesOrderFormData) => {
    set({ submitting: true });
    try {
      const order = await salesApi.createSalesOrder(data);
      set({ submitting: false });
      
      await logsApi.createLog({
        operationType: '新增',
        module: '销售',
        recordId: order.id,
        recordName: order.order_no,
        description: `创建销售订单：${order.order_no}，客户：${order.customer?.name || '未知'}`,
        newValue: data,
      });
      
      await get().fetchOrders();
    } catch (error) {
      console.error('创建销售订单失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    set({ submitting: true });
    try {
      const oldOrder = get().currentOrder;
      await salesApi.updateSalesOrderStatus(id, status);
      set({ submitting: false });
      
      await logsApi.createLog({
        operationType: '修改',
        module: '销售',
        recordId: id,
        recordName: oldOrder?.order_no,
        description: `更新订单状态：${oldOrder?.order_no} -> ${status}`,
        oldValue: oldOrder ? { status: oldOrder.status } : undefined,
        newValue: { status },
      });
      
      await get().fetchOrders();
      if (get().currentOrder?.id === id) {
        await get().fetchOrder(id);
      }
    } catch (error) {
      console.error('更新订单状态失败:', error);
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

  setFilters: (filters: any) => {
    set({ filters: { ...get().filters, ...filters }, page: 1 });
    get().fetchOrders();
  },

  resetFilters: () => {
    set({ filters: {}, page: 1 });
    get().fetchOrders();
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));

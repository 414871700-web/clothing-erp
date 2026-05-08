import { create } from 'zustand';
import type { Warehouse, WarehouseFormData } from '@/types';
import { warehouseApi } from '@/lib/inventory';
import { logsApi } from '@/lib/logs';

interface WarehouseState {
  warehouses: Warehouse[];
  currentWarehouse: Warehouse | null;
  total: number;
  loading: boolean;
  submitting: boolean;
  
  fetchWarehouses: () => Promise<void>;
  fetchWarehouse: (id: string) => Promise<void>;
  createWarehouse: (data: WarehouseFormData) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<WarehouseFormData>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  clearCurrentWarehouse: () => void;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  warehouses: [],
  currentWarehouse: null,
  total: 0,
  loading: false,
  submitting: false,

  fetchWarehouses: async () => {
    set({ loading: true });
    try {
      const warehouses = await warehouseApi.getWarehouses();
      set({ warehouses, total: warehouses.length, loading: false });
    } catch (error) {
      console.error('获取仓库列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchWarehouse: async (id: string) => {
    set({ loading: true });
    try {
      const warehouse = await warehouseApi.getWarehouse(id);
      set({ currentWarehouse: warehouse, loading: false });
    } catch (error) {
      console.error('获取仓库详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  createWarehouse: async (data: WarehouseFormData) => {
    set({ submitting: true });
    try {
      const warehouse = await warehouseApi.createWarehouse(data);
      set({ submitting: false });
      
      await logsApi.createLog({
        operationType: '新增',
        module: '仓库',
        recordId: warehouse.id,
        recordName: data.name,
        description: `新增仓库：${data.name}`,
        newValue: data,
      });
      
      await get().fetchWarehouses();
    } catch (error) {
      console.error('创建仓库失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  updateWarehouse: async (id: string, data: Partial<WarehouseFormData>) => {
    set({ submitting: true });
    try {
      const oldWarehouse = get().currentWarehouse;
      await warehouseApi.updateWarehouse(id, data);
      set({ submitting: false });
      
      await logsApi.createLog({
        operationType: '修改',
        module: '仓库',
        recordId: id,
        recordName: data.name || oldWarehouse?.name,
        description: `修改仓库：${data.name || oldWarehouse?.name}`,
        oldValue: oldWarehouse || undefined,
        newValue: data,
      });
      
      await get().fetchWarehouses();
      if (get().currentWarehouse?.id === id) {
        await get().fetchWarehouse(id);
      }
    } catch (error) {
      console.error('更新仓库失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  deleteWarehouse: async (id: string) => {
    set({ loading: true });
    try {
      const warehouseToDelete = get().warehouses.find(w => w.id === id);
      await warehouseApi.deleteWarehouse(id);
      
      await logsApi.createLog({
        operationType: '删除',
        module: '仓库',
        recordId: id,
        recordName: warehouseToDelete?.name,
        description: `删除仓库：${warehouseToDelete?.name}`,
        oldValue: warehouseToDelete || undefined,
      });
      
      set({ loading: false });
      await get().fetchWarehouses();
    } catch (error) {
      console.error('删除仓库失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  clearCurrentWarehouse: () => {
    set({ currentWarehouse: null });
  },
}));

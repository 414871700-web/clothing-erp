import { create } from 'zustand';
import type { ProductSku, SkuFormData, Product } from '@/types';
import { skuApi, productApi } from '@/lib/supabase';

interface SkuState {
  // 数据
  skus: ProductSku[];
  currentSku: ProductSku | null;
  skusByProduct: ProductSku[];
  total: number;
  
  // 加载状态
  loading: boolean;
  submitting: boolean;
  
  // 筛选条件
  page: number;
  pageSize: number;
  productId: string;
  color: string;
  size: string;
  
  // 选项数据
  colors: string[];
  sizes: string[];
  products: Product[];
  
  // 操作方法
  fetchSkus: () => Promise<void>;
  fetchSku: (id: string) => Promise<void>;
  fetchSkusByProduct: (productId: string) => Promise<void>;
  createSku: (data: SkuFormData) => Promise<void>;
  updateSku: (id: string, data: Partial<SkuFormData>) => Promise<void>;
  deleteSku: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setProductId: (productId: string) => void;
  setColor: (color: string) => void;
  setSize: (size: string) => void;
  resetFilters: () => void;
  fetchOptions: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  clearCurrentSku: () => void;
}

export const useSkuStore = create<SkuState>((set, get) => ({
  // 初始状态
  skus: [],
  currentSku: null,
  skusByProduct: [],
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,
  productId: '',
  color: '',
  size: '',
  colors: [],
  sizes: [],
  products: [],

  // 获取SKU列表
  fetchSkus: async () => {
    set({ loading: true });
    try {
      const { page, pageSize, productId, color, size } = get();
      const response = await skuApi.getSkus({
        page,
        pageSize,
        productId: productId || undefined,
        color: color || undefined,
        size: size || undefined,
      });
      set({
        skus: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取SKU列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 获取单个SKU
  fetchSku: async (id: string) => {
    set({ loading: true });
    try {
      const sku = await skuApi.getSku(id);
      set({ currentSku: sku, loading: false });
    } catch (error) {
      console.error('获取SKU详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 获取商品的SKU列表
  fetchSkusByProduct: async (productId: string) => {
    set({ loading: true });
    try {
      const skus = await skuApi.getSkusByProduct(productId);
      set({ skusByProduct: skus, loading: false });
    } catch (error) {
      console.error('获取商品SKU列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 创建SKU
  createSku: async (data: SkuFormData) => {
    set({ submitting: true });
    try {
      await skuApi.createSku(data);
      set({ submitting: false });
      // 刷新列表
      await get().fetchSkus();
    } catch (error) {
      console.error('创建SKU失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  // 更新SKU
  updateSku: async (id: string, data: Partial<SkuFormData>) => {
    set({ submitting: true });
    try {
      await skuApi.updateSku(id, data);
      set({ submitting: false });
      // 刷新列表和当前SKU
      await get().fetchSkus();
      if (get().currentSku?.id === id) {
        await get().fetchSku(id);
      }
    } catch (error) {
      console.error('更新SKU失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  // 删除SKU
  deleteSku: async (id: string) => {
    set({ loading: true });
    try {
      await skuApi.deleteSku(id);
      set({ loading: false });
      // 刷新列表
      await get().fetchSkus();
    } catch (error) {
      console.error('删除SKU失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 设置分页
  setPage: (page: number) => {
    set({ page });
    get().fetchSkus();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchSkus();
  },

  // 设置筛选条件
  setProductId: (productId: string) => {
    set({ productId, page: 1 });
    get().fetchSkus();
  },

  setColor: (color: string) => {
    set({ color, page: 1 });
    get().fetchSkus();
  },

  setSize: (size: string) => {
    set({ size, page: 1 });
    get().fetchSkus();
  },

  // 重置筛选
  resetFilters: () => {
    set({
      page: 1,
      productId: '',
      color: '',
      size: '',
    });
    get().fetchSkus();
  },

  // 获取选项数据
  fetchOptions: async () => {
    try {
      const [colors, sizes] = await Promise.all([
        skuApi.getColors(),
        skuApi.getSizes(),
      ]);
      set({ colors, sizes });
    } catch (error) {
      console.error('获取选项数据失败:', error);
    }
  },

  // 获取商品列表（用于SKU表单选择）
  fetchProducts: async () => {
    try {
      const response = await productApi.getProducts({
        page: 1,
        pageSize: 1000,
        status: '上架',
      });
      set({ products: response.data });
    } catch (error) {
      console.error('获取商品列表失败:', error);
    }
  },

  // 清除当前SKU
  clearCurrentSku: () => {
    set({ currentSku: null });
  },
}));

import { create } from 'zustand';
import type { Product, ProductFormData, PaginatedResponse } from '@/types';
import { productApi } from '@/lib/supabase';
import { logsApi } from '@/lib/logs';

interface ProductState {
  // 数据
  products: Product[];
  currentProduct: Product | null;
  total: number;
  
  // 加载状态
  loading: boolean;
  submitting: boolean;
  
  // 筛选条件
  page: number;
  pageSize: number;
  search: string;
  category: string;
  brand: string;
  status: string;
  
  // 选项数据
  categories: string[];
  brands: string[];
  
  // 操作方法
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: ProductFormData) => Promise<void>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setBrand: (brand: string) => void;
  setStatus: (status: string) => void;
  resetFilters: () => void;
  fetchOptions: () => Promise<void>;
  clearCurrentProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // 初始状态
  products: [],
  currentProduct: null,
  total: 0,
  loading: false,
  submitting: false,
  page: 1,
  pageSize: 10,
  search: '',
  category: '',
  brand: '',
  status: '',
  categories: [],
  brands: [],

  // 获取商品列表
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const { page, pageSize, search, category, brand, status } = get();
      const response = await productApi.getProducts({
        page,
        pageSize,
        search,
        category,
        brand,
        status,
      });
      set({
        products: response.data,
        total: response.total,
        loading: false,
      });
    } catch (error) {
      console.error('获取商品列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 获取单个商品
  fetchProduct: async (id: string) => {
    set({ loading: true });
    try {
      const product = await productApi.getProduct(id);
      set({ currentProduct: product, loading: false });
    } catch (error) {
      console.error('获取商品详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 创建商品
  createProduct: async (data: ProductFormData) => {
    set({ submitting: true });
    try {
      const product = await productApi.createProduct(data);
      set({ submitting: false });
      
      await logsApi.createLog({
        operationType: '新增',
        module: '商品',
        recordId: product.id,
        recordName: data.name,
        description: `新增商品：${data.name}（款号：${data.product_code}）`,
        newValue: data,
      });
      
      await get().fetchProducts();
    } catch (error) {
      console.error('创建商品失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  // 更新商品
  updateProduct: async (id: string, data: Partial<ProductFormData>) => {
    set({ submitting: true });
    try {
      const oldProduct = get().currentProduct;
      await productApi.updateProduct(id, data);
      set({ submitting: false });
      
      await logsApi.createLog({
        operationType: '修改',
        module: '商品',
        recordId: id,
        recordName: data.name || oldProduct?.name,
        description: `修改商品：${data.name || oldProduct?.name}`,
        oldValue: oldProduct || undefined,
        newValue: data,
      });
      
      await get().fetchProducts();
      if (get().currentProduct?.id === id) {
        await get().fetchProduct(id);
      }
    } catch (error) {
      console.error('更新商品失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  // 删除商品
  deleteProduct: async (id: string) => {
    set({ loading: true });
    try {
      const productToDelete = get().products.find(p => p.id === id);
      await productApi.deleteProduct(id);
      
      await logsApi.createLog({
        operationType: '删除',
        module: '商品',
        recordId: id,
        recordName: productToDelete?.name,
        description: `删除商品：${productToDelete?.name}（款号：${productToDelete?.product_code}）`,
        oldValue: productToDelete || undefined,
      });
      
      set({ loading: false });
      await get().fetchProducts();
    } catch (error) {
      console.error('删除商品失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  // 设置分页
  setPage: (page: number) => {
    set({ page });
    get().fetchProducts();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchProducts();
  },

  // 设置筛选条件
  setSearch: (search: string) => {
    set({ search, page: 1 });
    get().fetchProducts();
  },

  setCategory: (category: string) => {
    set({ category, page: 1 });
    get().fetchProducts();
  },

  setBrand: (brand: string) => {
    set({ brand, page: 1 });
    get().fetchProducts();
  },

  setStatus: (status: string) => {
    set({ status, page: 1 });
    get().fetchProducts();
  },

  // 重置筛选
  resetFilters: () => {
    set({
      page: 1,
      search: '',
      category: '',
      brand: '',
      status: '',
    });
    get().fetchProducts();
  },

  // 获取选项数据
  fetchOptions: async () => {
    try {
      const [categories, brands] = await Promise.all([
        productApi.getCategories(),
        productApi.getBrands(),
      ]);
      set({ categories, brands });
    } catch (error) {
      console.error('获取选项数据失败:', error);
    }
  },

  // 清除当前商品
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },
}));

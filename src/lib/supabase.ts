import { createClient } from '@supabase/supabase-js';
import type { Product, ProductSku } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase 配置未设置，请检查环境变量');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 商品相关操作
export const productApi = {
  // 获取商品列表
  async getProducts(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    brand?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 10, search, category, brand, status } = params;
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,product_code.ilike.%${search}%`);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (brand) {
      query = query.eq('brand', brand);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      data: data as Product[],
      total: count || 0,
      page,
      pageSize,
    };
  },

  // 获取单个商品
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Product;
  },

  // 创建商品
  async createProduct(product: Omit<Product, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data as Product;
  },

  // 更新商品
  async updateProduct(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Product;
  },

  // 删除商品
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 获取所有分类
  async getCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    if (error) throw error;
    
    const categories = [...new Set(data.map(item => item.category))];
    return categories.filter(Boolean) as string[];
  },

  // 获取所有品牌
  async getBrands() {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .not('brand', 'is', null);
    
    if (error) throw error;
    
    const brands = [...new Set(data.map(item => item.brand))];
    return brands.filter(Boolean) as string[];
  },
};

// SKU相关操作
export const skuApi = {
  // 获取SKU列表
  async getSkus(params: {
    page?: number;
    pageSize?: number;
    productId?: string;
    color?: string;
    size?: string;
  }) {
    const { page = 1, pageSize = 10, productId, color, size } = params;
    
    let query = supabase
      .from('product_skus')
      .select(`
        *,
        product:products(*)
      `, { count: 'exact' });
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    if (color) {
      query = query.eq('color', color);
    }
    
    if (size) {
      query = query.eq('size', size);
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      data: data as ProductSku[],
      total: count || 0,
      page,
      pageSize,
    };
  },

  // 获取单个SKU
  async getSku(id: string) {
    const { data, error } = await supabase
      .from('product_skus')
      .select(`
        *,
        product:products(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ProductSku;
  },

  // 获取商品的SKU列表
  async getSkusByProduct(productId: string) {
    const { data, error } = await supabase
      .from('product_skus')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ProductSku[];
  },

  // 创建SKU
  async createSku(sku: Omit<ProductSku, 'id' | 'created_at' | 'product'>) {
    const { data, error } = await supabase
      .from('product_skus')
      .insert(sku)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProductSku;
  },

  // 更新SKU
  async updateSku(id: string, sku: Partial<ProductSku>) {
    const { data, error } = await supabase
      .from('product_skus')
      .update(sku)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProductSku;
  },

  // 删除SKU
  async deleteSku(id: string) {
    const { error } = await supabase
      .from('product_skus')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 获取所有颜色
  async getColors() {
    const { data, error } = await supabase
      .from('product_skus')
      .select('color')
      .not('color', 'is', null);
    
    if (error) throw error;
    
    const colors = [...new Set(data.map(item => item.color))];
    return colors.filter(Boolean) as string[];
  },

  // 获取所有尺码
  async getSizes() {
    const { data, error } = await supabase
      .from('product_skus')
      .select('size')
      .not('size', 'is', null);
    
    if (error) throw error;
    
    const sizes = [...new Set(data.map(item => item.size))];
    return sizes.filter(Boolean) as string[];
  },
};

// 图片上传
export const storageApi = {
  async uploadImage(file: File, path: string) {
    const { data, error } = await supabase
      .storage
      .from('products')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase
      .storage
      .from('products')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },
};

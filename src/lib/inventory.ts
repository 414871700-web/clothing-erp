import { supabase } from './supabase';
import type { InventoryWithDetails, InventoryQueryParams, PaginatedResponse } from '@/types';

export const inventoryApi = {
  async getInventories(params: InventoryQueryParams = {}) {
    const { page = 1, pageSize = 10, skuId, productId, warehouseId } = params;

    let query = supabase
      .from('inventory')
      .select(`
        *,
        sku:product_skus(
          *,
          product:products(*)
        ),
        warehouse:warehouses(*)
      `, { count: 'exact' });

    if (skuId) {
      query = query.eq('sku_id', skuId);
    }

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    const inventories: InventoryWithDetails[] = (data || []).map((item: any) => ({
      id: item.id,
      sku_id: item.sku_id,
      warehouse_id: item.warehouse_id,
      quantity: item.quantity,
      locked_quantity: item.locked_quantity,
      updated_at: item.updated_at,
      sku_color: item.sku?.color || '',
      sku_size: item.sku?.size || '',
      sku_barcode: item.sku?.barcode || null,
      sku_cost_price: item.sku?.cost_price || 0,
      sku_sale_price: item.sku?.sale_price || 0,
      product_name: item.sku?.product?.name || '',
      product_code: item.sku?.product?.product_code || '',
      warehouse_name: item.warehouse?.name || '',
      warehouse_code: item.warehouse?.code || '',
    }));

    return {
      data: inventories,
      total: count || 0,
      page,
      pageSize,
    } as PaginatedResponse<InventoryWithDetails>;
  },

  async updateInventory(skuId: string, warehouseId: string, quantityChange: number) {
    const { data: existing, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('sku_id', skuId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          quantity: existing.quantity + quantityChange,
          updated_at: new Date().toISOString(),
        })
        .eq('sku_id', skuId)
        .eq('warehouse_id', warehouseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          sku_id: skuId,
          warehouse_id: warehouseId,
          quantity: quantityChange,
          locked_quantity: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },
};

export const warehouseApi = {
  async getWarehouses() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getWarehouse(id: string) {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createWarehouse(warehouse: any) {
    const { data, error } = await supabase
      .from('warehouses')
      .insert(warehouse)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWarehouse(id: string, warehouse: any) {
    const { data, error } = await supabase
      .from('warehouses')
      .update(warehouse)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteWarehouse(id: string) {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const inboundApi = {
  async getInboundOrders(params: any = {}) {
    const { page = 1, pageSize = 10, warehouseId } = params;

    let query = supabase
      .from('inbound_orders')
      .select(`
        *,
        warehouse:warehouses(*)
      `, { count: 'exact' });

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    for (const order of (data || [])) {
      const { data: items } = await supabase
        .from('inbound_items')
        .select(`
          *,
          sku:product_skus(*)
        `)
        .eq('inbound_order_id', order.id);
      
      order.items = items || [];
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async getInboundOrder(id: string) {
    const { data, error } = await supabase
      .from('inbound_orders')
      .select(`
        *,
        warehouse:warehouses(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;

    const { data: items } = await supabase
      .from('inbound_items')
      .select(`
        *,
        sku:product_skus(*)
      `)
      .eq('inbound_order_id', id);
    
    data.items = items || [];
    return data;
  },

  async createInboundOrder(order: any, items: any[]) {
    const orderNo = `IN${Date.now()}`;
    
    const { data: newOrder, error: orderError } = await supabase
      .from('inbound_orders')
      .insert({
        order_no: orderNo,
        warehouse_id: order.warehouse_id,
        remark: order.remark,
      })
      .select()
      .single();
    
    if (orderError) throw orderError;

    for (const item of items) {
      const { error: itemError } = await supabase
        .from('inbound_items')
        .insert({
          inbound_order_id: newOrder.id,
          sku_id: item.sku_id,
          quantity: item.quantity,
        });
      
      if (itemError) throw itemError;

      await inventoryApi.updateInventory(item.sku_id, order.warehouse_id, item.quantity);

      const { data: inventory } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('sku_id', item.sku_id)
        .eq('warehouse_id', order.warehouse_id)
        .single();

      await supabase
        .from('inventory_logs')
        .insert({
          sku_id: item.sku_id,
          warehouse_id: order.warehouse_id,
          change_type: '入库',
          quantity_change: item.quantity,
          before_quantity: (inventory?.quantity || 0) - item.quantity,
          after_quantity: inventory?.quantity || item.quantity,
          reference_no: orderNo,
        });
    }

    return newOrder;
  },
};

export const inventoryLogApi = {
  async getInventoryLogs(params: any = {}) {
    const { page = 1, pageSize = 10, skuId, warehouseId, changeType } = params;

    let query = supabase
      .from('inventory_logs')
      .select(`
        *,
        sku:product_skus(*),
        warehouse:warehouses(*)
      `, { count: 'exact' });

    if (skuId) {
      query = query.eq('sku_id', skuId);
    }

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    if (changeType) {
      query = query.eq('change_type', changeType);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const logs = (data || []).map((item: any) => ({
      ...item,
      sku_color: item.sku?.color || '',
      sku_size: item.sku?.size || '',
      product_name: item.sku?.product?.name || '',
      warehouse_name: item.warehouse?.name || '',
    }));

    return {
      data: logs,
      total: count || 0,
      page,
      pageSize,
    };
  },
};

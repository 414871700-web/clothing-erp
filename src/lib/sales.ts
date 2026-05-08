import { supabase } from './supabase';
import type { PaginatedResponse } from '@/types';

export const customerApi = {
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getCustomer(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createCustomer(customer: any) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, customer: any) {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const salesApi = {
  async getSalesOrders(params: any = {}) {
    const { page = 1, pageSize = 10, customerId, status, paymentStatus } = params;

    let query = supabase
      .from('sales_orders')
      .select(`
        *,
        customer:customers(*)
      `, { count: 'exact' });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    for (const order of (data || [])) {
      const { data: items } = await supabase
        .from('sales_order_items')
        .select(`
          *,
          sku:product_skus(*)
        `)
        .eq('sales_order_id', order.id);
      
      order.items = items || [];
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async getSalesOrder(id: string) {
    const { data, error } = await supabase
      .from('sales_orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;

    const { data: items } = await supabase
      .from('sales_order_items')
      .select(`
        *,
        sku:product_skus(*)
      `)
      .eq('sales_order_id', id);
    
    data.items = items || [];
    return data;
  },

  async createSalesOrder(orderData: any) {
    const orderNo = `SO${Date.now()}`;
    
    const orderItems = orderData.items || [];
    const totalAmount = orderItems.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unit_price), 0
    );

    const { data: newOrder, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        order_no: orderNo,
        customer_id: orderData.customer_id,
        total_amount: totalAmount,
        paid_amount: 0,
        unpaid_amount: totalAmount,
        status: '待发货',
        payment_status: '未付款',
      })
      .select()
      .single();
    
    if (orderError) throw orderError;

    for (const item of orderItems) {
      const { error: itemError } = await supabase
        .from('sales_order_items')
        .insert({
          sales_order_id: newOrder.id,
          sku_id: item.sku_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        });
      
      if (itemError) throw itemError;

      const { data: inventory } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('sku_id', item.sku_id)
        .eq('warehouse_id', orderData.warehouse_id)
        .single();

      const beforeQuantity = inventory?.quantity || 0;
      const afterQuantity = beforeQuantity - item.quantity;

      if (inventory) {
        await supabase
          .from('inventory')
          .update({
            quantity: afterQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq('sku_id', item.sku_id)
          .eq('warehouse_id', orderData.warehouse_id);
      } else {
        await supabase
          .from('inventory')
          .insert({
            sku_id: item.sku_id,
            warehouse_id: orderData.warehouse_id,
            quantity: afterQuantity,
            locked_quantity: 0,
            updated_at: new Date().toISOString(),
          });
      }

      await supabase
        .from('inventory_logs')
        .insert({
          sku_id: item.sku_id,
          warehouse_id: orderData.warehouse_id,
          change_type: '出库',
          quantity_change: -item.quantity,
          before_quantity: beforeQuantity,
          after_quantity: afterQuantity,
          reference_no: orderNo,
        });
    }

    await supabase
      .from('customers')
      .update({
        current_balance: totalAmount,
      })
      .eq('id', orderData.customer_id);

    return newOrder;
  },

  async updateSalesOrderStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('sales_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

export const paymentApi = {
  async getPaymentRecords(params: any = {}) {
    const { page = 1, pageSize = 10 } = params;

    let query = supabase
      .from('payment_records')
      .select(`
        *,
        sales_order:sales_orders(
          *,
          customer:customers(*)
        )
      `, { count: 'exact' });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('payment_time', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async createPaymentRecord(payment: any) {
    const paymentTime = payment.payment_time || new Date().toISOString();
    
    const { data: newPayment, error } = await supabase
      .from('payment_records')
      .insert({
        sales_order_id: payment.sales_order_id,
        payment_method: payment.payment_method,
        amount: payment.amount,
        payment_time: paymentTime,
        remark: payment.remark || null,
      })
      .select()
      .single();
    
    if (error) throw error;

    const { data: order } = await supabase
      .from('sales_orders')
      .select('*')
      .eq('id', payment.sales_order_id)
      .single();

    if (order) {
      const newPaidAmount = (order.paid_amount || 0) + payment.amount;
      const newUnpaidAmount = (order.total_amount || 0) - newPaidAmount;
      
      let paymentStatus = '未付款';
      if (newPaidAmount >= order.total_amount) {
        paymentStatus = '已付清';
      } else if (newPaidAmount > 0) {
        paymentStatus = '部分付款';
      }

      await supabase
        .from('sales_orders')
        .update({
          paid_amount: newPaidAmount,
          unpaid_amount: Math.max(0, newUnpaidAmount),
          payment_status: paymentStatus,
        })
        .eq('id', payment.sales_order_id);

      const { data: customer } = await supabase
        .from('customers')
        .select('current_balance')
        .eq('id', order.customer_id)
        .single();

      if (customer) {
        await supabase
          .from('customers')
          .update({
            current_balance: Math.max(0, (customer.current_balance || 0) - payment.amount),
          })
          .eq('id', order.customer_id);
      }
    }

    return newPayment;
  },
};

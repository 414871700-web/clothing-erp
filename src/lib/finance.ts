import { supabase } from './supabase';
import type { 
  ProductionInboundOrder, 
  ProductionInboundFormData,
  ProductionCost,
  ProductionCostFormData,
  FinanceTransaction,
  FinanceTransactionFormData,
  ExpenseRecord,
  ExpenseRecordFormData,
  FinanceReport,
  PaginatedResponse
} from '@/types';

export const productionInboundApi = {
  async getInboundOrders(params: any = {}) {
    const { page = 1, pageSize = 10, skuId } = params;

    let query = supabase
      .from('production_inbound_orders')
      .select(`
        *,
        sku:product_skus(*)
      `, { count: 'exact' });

    if (skuId) {
      query = query.eq('sku_id', skuId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async createInboundOrder(data: ProductionInboundFormData) {
    const orderNo = `PI${Date.now()}`;

    const { data: newOrder, error } = await supabase
      .from('production_inbound_orders')
      .insert({
        order_no: orderNo,
        sku_id: data.sku_id,
        quantity: data.quantity,
        production_batch_no: data.production_batch_no || null,
        remark: data.remark || null,
      })
      .select()
      .single();
    
    if (error) throw error;

    const { data: inventory } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('sku_id', data.sku_id)
      .eq('warehouse_id', data.warehouse_id)
      .single();

    const beforeQuantity = inventory?.quantity || 0;
    const afterQuantity = beforeQuantity + data.quantity;

    if (inventory) {
      await supabase
        .from('inventory')
        .update({
          quantity: afterQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('sku_id', data.sku_id)
        .eq('warehouse_id', data.warehouse_id);
    } else {
      await supabase
        .from('inventory')
        .insert({
          sku_id: data.sku_id,
          warehouse_id: data.warehouse_id,
          quantity: afterQuantity,
          locked_quantity: 0,
          updated_at: new Date().toISOString(),
        });
    }

    await supabase
      .from('inventory_logs')
      .insert({
        sku_id: data.sku_id,
        warehouse_id: data.warehouse_id,
        change_type: '入库',
        quantity_change: data.quantity,
        before_quantity: beforeQuantity,
        after_quantity: afterQuantity,
        reference_no: orderNo,
      });

    return newOrder;
  },

  async deleteInboundOrder(id: string) {
    const { error } = await supabase
      .from('production_inbound_orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const productionCostApi = {
  async getCosts(params: any = {}) {
    const { page = 1, pageSize = 10, skuId } = params;

    let query = supabase
      .from('production_costs')
      .select(`
        *,
        sku:product_skus(*)
      `, { count: 'exact' });

    if (skuId) {
      query = query.eq('sku_id', skuId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async createCost(data: ProductionCostFormData) {
    const { data: newCost, error } = await supabase
      .from('production_costs')
      .insert({
        sku_id: data.sku_id,
        batch_no: data.batch_no || null,
        material_cost: data.material_cost,
        labor_cost: data.labor_cost,
        other_cost: data.other_cost,
      })
      .select()
      .single();
    
    if (error) throw error;
    return newCost;
  },

  async updateCost(id: string, data: Partial<ProductionCostFormData>) {
    const { data: updatedCost, error } = await supabase
      .from('production_costs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedCost;
  },

  async deleteCost(id: string) {
    const { error } = await supabase
      .from('production_costs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const financeTransactionApi = {
  async getTransactions(params: any = {}) {
    const { page = 1, pageSize = 10, transactionType, direction, startDate, endDate } = params;

    let query = supabase
      .from('finance_transactions')
      .select('*', { count: 'exact' });

    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }

    if (direction) {
      query = query.eq('direction', direction);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async createTransaction(data: FinanceTransactionFormData) {
    const { data: newTransaction, error } = await supabase
      .from('finance_transactions')
      .insert({
        transaction_type: data.transaction_type,
        related_order_no: data.related_order_no || null,
        amount: data.amount,
        payment_method: data.payment_method || null,
        direction: data.direction,
        remark: data.remark || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return newTransaction;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const expenseApi = {
  async getExpenses(params: any = {}) {
    const { page = 1, pageSize = 10, expenseType } = params;

    let query = supabase
      .from('expense_records')
      .select('*', { count: 'exact' });

    if (expenseType) {
      query = query.eq('expense_type', expenseType);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async createExpense(data: ExpenseRecordFormData) {
    const { data: newExpense, error } = await supabase
      .from('expense_records')
      .insert({
        expense_type: data.expense_type,
        amount: data.amount,
        remark: data.remark || null,
      })
      .select()
      .single();
    
    if (error) throw error;

    await supabase
      .from('finance_transactions')
      .insert({
        transaction_type: '运营支出',
        amount: data.amount,
        direction: '支出',
        remark: `${data.expense_type}: ${data.remark || ''}`,
      });

    return newExpense;
  },

  async deleteExpense(id: string) {
    const { error } = await supabase
      .from('expense_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const financeReportApi = {
  async getReport(params: any = {}) {
    const { startDate, endDate } = params;

    let salesQuery = supabase
      .from('sales_orders')
      .select('total_amount, paid_amount, unpaid_amount');

    if (startDate) {
      salesQuery = salesQuery.gte('created_at', startDate);
    }
    if (endDate) {
      salesQuery = salesQuery.lte('created_at', endDate);
    }

    const { data: salesData } = await salesQuery;
    
    const totalSalesRevenue = salesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const paidAmount = salesData?.reduce((sum, order) => sum + (order.paid_amount || 0), 0) || 0;
    const unpaidAmount = salesData?.reduce((sum, order) => sum + (order.unpaid_amount || 0), 0) || 0;

    let costQuery = supabase
      .from('production_costs')
      .select('total_cost');

    const { data: costData } = await costQuery;
    const totalProductionCost = costData?.reduce((sum, cost) => sum + (cost.total_cost || 0), 0) || 0;

    let expenseQuery = supabase
      .from('expense_records')
      .select('amount');

    if (startDate) {
      expenseQuery = expenseQuery.gte('created_at', startDate);
    }
    if (endDate) {
      expenseQuery = expenseQuery.lte('created_at', endDate);
    }

    const { data: expenseData } = await expenseQuery;
    const totalExpenses = expenseData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

    const profit = totalSalesRevenue - totalProductionCost - totalExpenses;

    return {
      totalSalesRevenue,
      totalProductionCost,
      totalExpenses,
      profit,
      totalReceivable: unpaidAmount,
      salesOrdersCount: salesData?.length || 0,
      paidAmount,
      unpaidAmount,
    };
  },

  async getReceivables(dateRange?: { startDate?: string; endDate?: string }) {
    let query = supabase
      .from('sales_orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .neq('unpaid_amount', 0);

    if (dateRange?.startDate) {
      query = query.gte('created_at', dateRange.startDate);
    }
    if (dateRange?.endDate) {
      query = query.lte('created_at', dateRange.endDate);
    }

    const { data: salesData } = await query.order('created_at', { ascending: false });
    return salesData || [];
  },
};

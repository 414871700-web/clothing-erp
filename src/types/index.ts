// 商品类型
export interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  brand: string;
  season: string;
  image_url: string | null;
  status: '上架' | '下架';
  created_at: string;
}

// SKU类型
export interface ProductSku {
  id: string;
  product_id: string;
  color: string;
  size: string;
  barcode: string | null;
  cost_price: number;
  sale_price: number;
  warning_stock: number;
  current_stock: number;
  created_at: string;
  // 关联商品信息（查询时展开）
  product?: Product;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 商品查询参数
export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
}

// SKU查询参数
export interface SkuQueryParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  color?: string;
  size?: string;
}

// 商品表单数据
export interface ProductFormData {
  product_code: string;
  name: string;
  category: string;
  brand: string;
  season: string;
  image_url: string | null;
  status: '上架' | '下架';
}

// SKU表单数据
export interface SkuFormData {
  product_id: string;
  color: string;
  size: string;
  barcode: string | null;
  cost_price: number;
  sale_price: number;
  warning_stock: number;
  current_stock: number;
}

// ============================================
// 仓库相关类型
// ============================================
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string | null;
  status: '启用' | '停用';
  created_at: string;
}

export interface WarehouseFormData {
  name: string;
  code: string;
  location: string | null;
  status: '启用' | '停用';
}

// ============================================
// 库存相关类型
// ============================================
export interface Inventory {
  id: string;
  sku_id: string;
  warehouse_id: string;
  quantity: number;
  locked_quantity: number;
  updated_at: string;
  // 关联信息
  sku?: ProductSku;
  warehouse?: Warehouse;
}

export interface InventoryWithDetails extends Inventory {
  sku_color: string;
  sku_size: string;
  sku_barcode: string | null;
  sku_cost_price: number;
  sku_sale_price: number;
  product_name: string;
  product_code: string;
  warehouse_name: string;
  warehouse_code: string;
}

export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  skuId?: string;
  productId?: string;
  warehouseId?: string;
}

// ============================================
// 入库单相关类型
// ============================================
export interface InboundOrder {
  id: string;
  order_no: string;
  warehouse_id: string;
  remark: string | null;
  created_at: string;
  // 关联信息
  warehouse?: Warehouse;
  items?: InboundItem[];
}

export interface InboundItem {
  id: string;
  inbound_order_id: string;
  sku_id: string;
  quantity: number;
  created_at: string;
  // 关联信息
  sku?: ProductSku;
}

export interface InboundOrderFormData {
  warehouse_id: string;
  remark: string | null;
}

export interface InboundItemFormData {
  sku_id: string;
  quantity: number;
}

export interface InboundOrderQueryParams {
  page?: number;
  pageSize?: number;
  warehouseId?: string;
  search?: string;
}

// ============================================
// 库存流水相关类型
// ============================================
export interface InventoryLog {
  id: string;
  sku_id: string;
  warehouse_id: string;
  change_type: '入库' | '出库' | '调整';
  quantity_change: number;
  before_quantity: number;
  after_quantity: number;
  reference_no: string | null;
  created_at: string;
  // 关联信息
  sku?: ProductSku;
  warehouse?: Warehouse;
}

export interface InventoryLogWithDetails extends InventoryLog {
  sku_color: string;
  sku_size: string;
  product_name: string;
  warehouse_name: string;
}

export interface InventoryLogQueryParams {
  page?: number;
  pageSize?: number;
  skuId?: string;
  warehouseId?: string;
  changeType?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// 客户相关类型
// ============================================
export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  customer_type: '普通客户' | 'VIP客户' | '批发商';
  credit_limit: number;
  current_balance: number;
  created_at: string;
}

export interface CustomerFormData {
  name: string;
  phone: string | null;
  address: string | null;
  customer_type: '普通客户' | 'VIP客户' | '批发商';
  credit_limit: number;
}

// ============================================
// 销售订单相关类型
// ============================================
export interface SalesOrder {
  id: string;
  order_no: string;
  customer_id: string;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  status: '待发货' | '已发货' | '已完成' | '已取消';
  payment_status: '未付款' | '部分付款' | '已付清';
  created_at: string;
  // 关联信息
  customer?: Customer;
  items?: SalesOrderItem[];
}

export interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  sku_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // 关联信息
  sku?: ProductSku;
}

export interface SalesOrderFormData {
  customer_id: string;
  warehouse_id: string;
  items: Array<{
    sku_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface SalesOrderQueryParams {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  paymentStatus?: string;
}

// ============================================
// 收款记录相关类型
// ============================================
export interface PaymentRecord {
  id: string;
  sales_order_id: string;
  payment_method: '现金' | '银行转账' | '微信' | '支付宝' | '其他';
  amount: number;
  payment_time: string;
  remark: string | null;
  created_at: string;
  // 关联信息
  sales_order?: SalesOrder;
}

export interface PaymentRecordFormData {
  sales_order_id: string;
  payment_method: '现金' | '银行转账' | '微信' | '支付宝' | '其他';
  amount: number;
  payment_time?: string;
  remark?: string | null;
}

export interface PaymentRecordQueryParams {
  page?: number;
  pageSize?: number;
  salesOrderId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// 生产入库相关类型
// ============================================
export interface ProductionInboundOrder {
  id: string;
  order_no: string;
  sku_id: string;
  quantity: number;
  production_batch_no: string | null;
  remark: string | null;
  created_at: string;
  // 关联信息
  sku?: ProductSku;
}

export interface ProductionInboundFormData {
  sku_id: string;
  quantity: number;
  warehouse_id: string;
  production_batch_no?: string;
  remark?: string;
}

// ============================================
// 生产成本相关类型
// ============================================
export interface ProductionCost {
  id: string;
  sku_id: string;
  batch_no: string | null;
  material_cost: number;
  labor_cost: number;
  other_cost: number;
  total_cost: number;
  created_at: string;
  // 关联信息
  sku?: ProductSku;
}

export interface ProductionCostFormData {
  sku_id: string;
  batch_no?: string;
  material_cost: number;
  labor_cost: number;
  other_cost: number;
}

// ============================================
// 财务流水相关类型
// ============================================
export interface FinanceTransaction {
  id: string;
  transaction_type: '销售收入' | '退款' | '运营支出';
  related_order_no: string | null;
  amount: number;
  payment_method: '现金' | '银行转账' | '微信' | '支付宝' | '其他' | null;
  direction: '收入' | '支出';
  remark: string | null;
  created_at: string;
}

export interface FinanceTransactionFormData {
  transaction_type: '销售收入' | '退款' | '运营支出';
  related_order_no?: string;
  amount: number;
  payment_method?: '现金' | '银行转账' | '微信' | '支付宝' | '其他';
  direction: '收入' | '支出';
  remark?: string;
}

// ============================================
// 费用记录相关类型
// ============================================
export interface ExpenseRecord {
  id: string;
  expense_type: string;
  amount: number;
  remark: string | null;
  created_at: string;
}

export interface ExpenseRecordFormData {
  expense_type: string;
  amount: number;
  remark?: string;
}

// ============================================
// 财务报表类型
// ============================================
export interface FinanceReport {
  totalSalesRevenue: number;
  totalProductionCost: number;
  totalExpenses: number;
  profit: number;
  totalReceivable: number;
  salesOrdersCount: number;
  paidAmount: number;
  unpaidAmount: number;
}

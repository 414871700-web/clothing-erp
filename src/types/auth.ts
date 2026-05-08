// ============================================
// 用户和权限相关类型
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: '老板' | '管理员' | '仓库' | '销售' | '财务';
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  full_name: string | null;
  role: '老板' | '管理员' | '仓库' | '销售' | '财务';
  phone: string | null;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  permission?: Permission;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name: string;
}

// 权限代码常量
export const PERMISSION_CODES = {
  // 产品
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_MANAGE: 'products:manage',
  
  // SKU
  SKUS_VIEW: 'skus:view',
  SKUS_MANAGE: 'skus:manage',
  
  // 仓库
  WAREHOUSES_VIEW: 'warehouses:view',
  WAREHOUSES_MANAGE: 'warehouses:manage',
  
  // 库存
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  
  // 生产入库
  PRODUCTION_INBOUND_VIEW: 'production_inbound:view',
  PRODUCTION_INBOUND_MANAGE: 'production_inbound:manage',
  
  // 生产成本
  PRODUCTION_COST_VIEW: 'production_cost:view',
  PRODUCTION_COST_MANAGE: 'production_cost:manage',
  
  // 入库
  INBOUND_VIEW: 'inbound:view',
  INBOUND_MANAGE: 'inbound:manage',
  
  // 库存流水
  INVENTORY_LOGS_VIEW: 'inventory_logs:view',
  INVENTORY_LOGS_MANAGE: 'inventory_logs:manage',
  
  // 客户
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_MANAGE: 'customers:manage',
  
  // 销售
  SALES_VIEW: 'sales:view',
  SALES_MANAGE: 'sales:manage',
  SALES_DELETE: 'sales:delete',
  
  // 收款
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_MANAGE: 'payments:manage',
  
  // 财务
  FINANCE_TRANSACTIONS_VIEW: 'finance_transactions:view',
  FINANCE_TRANSACTIONS_MANAGE: 'finance_transactions:manage',
  
  // 费用
  EXPENSES_VIEW: 'expenses:view',
  EXPENSES_MANAGE: 'expenses:manage',
  
  // 报表
  REPORTS_VIEW: 'reports:view',
  REPORTS_MANAGE: 'reports:manage',
  
  // 应收
  RECEIVABLES_VIEW: 'receivables:view',
  RECEIVABLES_MANAGE: 'receivables:manage',
  
  // 用户管理
  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',
  
  // 日志
  LOGS_VIEW: 'logs:view',
  LOGS_MANAGE: 'logs:manage',
  
  // 系统
  SYSTEM_SETTINGS: 'system:settings',
} as const;

// 菜单权限映射
export const MENU_PERMISSIONS = [
  { path: '/products', permission: PERMISSION_CODES.PRODUCTS_VIEW },
  { path: '/skus', permission: PERMISSION_CODES.SKUS_VIEW },
  { path: '/warehouses', permission: PERMISSION_CODES.WAREHOUSES_VIEW },
  { path: '/inventory', permission: PERMISSION_CODES.INVENTORY_VIEW },
  { path: '/production-inbound', permission: PERMISSION_CODES.PRODUCTION_INBOUND_VIEW },
  { path: '/production-costs', permission: PERMISSION_CODES.PRODUCTION_COST_VIEW },
  { path: '/inbound', permission: PERMISSION_CODES.INBOUND_VIEW },
  { path: '/inventory-logs', permission: PERMISSION_CODES.INVENTORY_LOGS_VIEW },
  { path: '/customers', permission: PERMISSION_CODES.CUSTOMERS_VIEW },
  { path: '/sales', permission: PERMISSION_CODES.SALES_VIEW },
  { path: '/payments', permission: PERMISSION_CODES.PAYMENTS_VIEW },
  { path: '/finance-transactions', permission: PERMISSION_CODES.FINANCE_TRANSACTIONS_VIEW },
  { path: '/expenses', permission: PERMISSION_CODES.EXPENSES_VIEW },
  { path: '/finance-report', permission: PERMISSION_CODES.REPORTS_VIEW },
  { path: '/receivables', permission: PERMISSION_CODES.RECEIVABLES_VIEW },
  { path: '/users', permission: PERMISSION_CODES.USERS_VIEW },
  { path: '/logs', permission: PERMISSION_CODES.LOGS_VIEW },
] as const;

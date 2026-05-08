export interface OperationLog {
  id: string;
  user_id: string;
  user_name: string;
  operation_type: OperationType;
  module: ModuleType;
  record_id?: string;
  record_name?: string;
  description?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type OperationType = '新增' | '修改' | '删除' | '审核' | '财务修改' | '库存修改';

export type ModuleType = 
  | '商品管理'
  | 'SKU管理'
  | '仓库管理'
  | '库存管理'
  | '生产入库'
  | '生产成本'
  | '入库管理'
  | '库存流水'
  | '客户管理'
  | '销售订单'
  | '收款记录'
  | '财务流水'
  | '费用管理'
  | '财务报表'
  | '应收账款'
  | '用户管理'
  | '角色权限';

export interface CreateLogParams {
  operationType: OperationType;
  module: ModuleType;
  recordId?: string;
  recordName?: string;
  description?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}

export const OPERATION_TYPES: OperationType[] = ['新增', '修改', '删除', '审核', '财务修改', '库存修改'];

export const MODULE_TYPES: ModuleType[] = [
  '商品管理',
  'SKU管理',
  '仓库管理',
  '库存管理',
  '生产入库',
  '生产成本',
  '入库管理',
  '库存流水',
  '客户管理',
  '销售订单',
  '收款记录',
  '财务流水',
  '费用管理',
  '财务报表',
  '应收账款',
  '用户管理',
  '角色权限',
];

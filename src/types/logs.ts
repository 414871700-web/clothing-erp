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

export type ModuleType = 
  | "商品"
  | "销售"
  | "仓库"
  | "用户"
  | "财务"
  | "系统"
  | "生产"
  | "成本"
  | "费用";

export type OperationType = 
  | "新增"
  | "修改"
  | "删除"
  | "审核"
  | "导入"
  | "导出"
  | "测试";

export interface CreateLogParams {
  operationType: OperationType;
  module: ModuleType;
  recordId?: string;
  recordName?: string;
  description?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}

export const OPERATION_TYPES: OperationType[] = ['新增', '修改', '删除', '审核', '导入', '导出', '测试'];

export const MODULE_TYPES: ModuleType[] = [
  '商品',
  '销售',
  '仓库',
  '用户',
  '财务',
  '系统',
  '生产',
  '成本',
  '费用',
];

import { useEffect, useState } from 'react';
import { Shield, Check, X, Save } from 'lucide-react';
import { permissionApi } from '@/lib/auth';
import type { Permission, RolePermission } from '@/types/auth';

const roles = ['老板', '管理员', '仓库', '销售', '财务'];

const roleDescriptions: Record<string, string> = {
  '老板': '拥有系统全部权限，可管理所有模块',
  '管理员': '系统管理员，可管理用户和分配权限',
  '仓库': '仓库管理人员，可管理库存和入库',
  '销售': '销售人员，可管理客户和销售订单',
  '财务': '财务人员，可管理财务和报表',
};

export function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<string>('仓库');
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const permissions = await permissionApi.getAllPermissions();
      setAllPermissions(permissions);
    } catch (error) {
      console.error('获取权限列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (role: string) => {
    setLoading(true);
    try {
      const permissions = await permissionApi.getRolePermissions(role);
      setRolePermissions(permissions);
      setHasChanges(false);
    } catch (error) {
      console.error('获取角色权限失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    const exists = rolePermissions.some(rp => rp.permission_id === permissionId);
    
    if (exists) {
      setRolePermissions(rolePermissions.filter(rp => rp.permission_id !== permissionId));
    } else {
      setRolePermissions([
        ...rolePermissions,
        { id: '', role: selectedRole, permission_id: permissionId } as RolePermission
      ]);
    }
    
    setHasChanges(true);
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      const permissionIds = rolePermissions.map(rp => rp.permission_id);
      await permissionApi.assignPermissions(selectedRole, permissionIds);
      setHasChanges(false);
      alert('权限保存成功！');
    } catch (error) {
      console.error('保存权限失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const grantAllPermissions = () => {
    setRolePermissions(
      allPermissions.map(p => ({
        id: '',
        role: selectedRole,
        permission_id: p.id,
      } as RolePermission))
    );
    setHasChanges(true);
  };

  const revokeAllPermissions = () => {
    setRolePermissions([]);
    setHasChanges(true);
  };

  const hasPermission = (permissionId: string) => {
    return rolePermissions.some(rp => rp.permission_id === permissionId);
  };

  const groupedPermissions = allPermissions.reduce((groups, permission) => {
    const category = permission.code.split(':')[0];
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  const categoryNames: Record<string, string> = {
    'products': '商品管理',
    'skus': 'SKU管理',
    'warehouses': '仓库管理',
    'inventory': '库存管理',
    'production_inbound': '生产入库',
    'production_cost': '生产成本',
    'inbound': '入库管理',
    'inventory_logs': '库存流水',
    'customers': '客户管理',
    'sales': '销售管理',
    'payments': '收款管理',
    'finance_transactions': '财务流水',
    'expenses': '费用管理',
    'reports': '报表管理',
    'receivables': '应收账款',
    'users': '用户管理',
    'system': '系统设置',
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">角色权限管理</h1>
          <p className="text-slate-500 mt-1">为不同角色分配系统权限</p>
        </div>
        {hasChanges && (
          <button
            onClick={savePermissions}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存修改'}
          </button>
        )}
      </div>

      {/* 角色选择 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRole === role
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-5 h-5 ${selectedRole === role ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-semibold text-slate-900">{role}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">
                {roleDescriptions[role]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 权限列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            {selectedRole} 的权限
          </h3>
          <div className="flex gap-2">
            <button
              onClick={grantAllPermissions}
              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              授予全部
            </button>
            <button
              onClick={revokeAllPermissions}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              撤销全部
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category} className="p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  {categoryNames[category] || category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissions.map((permission) => (
                    <button
                      key={permission.id}
                      onClick={() => togglePermission(permission.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                        hasPermission(permission.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        hasPermission(permission.id)
                          ? 'bg-green-500 text-white'
                          : 'border border-slate-300'
                      }`}>
                        {hasPermission(permission.id) && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                        <p className="text-xs text-slate-500">{permission.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

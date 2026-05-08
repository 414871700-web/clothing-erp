import { X } from 'lucide-react';
import { useState } from 'react';
import type { User } from '@/types/auth';

interface RoleEditDialogProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (userId: string, role: string) => void;
}

const roles = ['老板', '管理员', '仓库', '销售', '财务'];

export function RoleEditDialog({ isOpen, user, onClose, onConfirm }: RoleEditDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || '仓库');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(user.id, selectedRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">修改用户角色</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">用户</p>
            <p className="font-medium text-slate-900">{user.full_name || '-'}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择新角色
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>老板：拥有全部权限</li>
              <li>管理员：系统管理权限</li>
              <li>仓库：库存相关权限</li>
              <li>销售：销售相关权限</li>
              <li>财务：财务相关权限</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              确认修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

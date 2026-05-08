import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Edit2, 
  Trash2, 
  Shield, 
  ToggleLeft,
  ToggleRight,
  Search,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RoleEditDialog } from './RoleEditDialog';
import type { User } from '@/types/auth';

const roles = ['老板', '管理员', '仓库', '销售', '财务'];

export function UserList() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const {
    users,
    loading,
    submitting,
    page,
    pageSize,
    fetchUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    setPage,
    setPageSize,
  } = useUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert('更新角色失败');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user.id, !user.is_active);
    } catch (error) {
      alert('切换状态失败');
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        alert('删除用户失败');
      }
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case '老板':
        return 'bg-purple-100 text-purple-700';
      case '管理员':
        return 'bg-red-100 text-red-700';
      case '仓库':
        return 'bg-blue-100 text-blue-700';
      case '销售':
        return 'bg-green-100 text-green-700';
      case '财务':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const canManageUser = (user: User) => {
    if (currentUser?.role === '老板') return true;
    if (currentUser?.role === '管理员' && user.role !== '老板' && user.role !== '管理员') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
        <p className="text-slate-500 mt-1">管理系统用户和角色</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索用户邮箱或姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部角色</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Users className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无用户</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">用户</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">角色</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">状态</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">最后登录</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{user.full_name || '-'}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getRoleStyle(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={!canManageUser(user)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-600'
                          } ${canManageUser(user) ? 'cursor-pointer hover:opacity-80' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          {user.is_active ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              启用
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              停用
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString('zh-CN')
                          : '从未登录'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canManageUser(user) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setRoleDialogOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="修改角色"
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="删除用户"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-600">共 {filteredUsers.length} 个用户</p>
            </div>
          </>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除用户"
        message={`确定要删除用户"${userToDelete?.full_name || userToDelete?.email}"吗？此操作不可恢复。`}
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
      />

      {/* 角色修改对话框 */}
      <RoleEditDialog
        isOpen={roleDialogOpen}
        user={selectedUser}
        onClose={() => {
          setRoleDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleRoleChange}
      />
    </div>
  );
}

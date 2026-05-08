import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Users, X } from 'lucide-react';
import { useCustomerStore } from '@/stores/customerStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Customer } from '@/types';

export function CustomerList() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    customers,
    loading,
    fetchCustomers,
    deleteCustomer,
  } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer(customerToDelete.id);
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } catch (error) {
        alert('删除失败，请重试');
      }
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'VIP客户':
        return 'bg-purple-100 text-purple-700';
      case '批发商':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">客户管理</h1>
          <p className="text-slate-500 mt-1">管理客户信息</p>
        </div>
        <button
          onClick={() => navigate('/customers/new')}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增客户
        </button>
      </div>

      {/* 搜索 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索客户名称或电话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 客户列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Users className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无客户</p>
            <p className="text-sm mt-1">点击上方"新增客户"按钮添加</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">客户名称</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">联系电话</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">客户类型</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">信用额度</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">当前欠款</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{customer.name}</p>
                          <p className="text-sm text-slate-500">{customer.address || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{customer.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTypeStyle(customer.customer_type)}`}>
                          {customer.customer_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">
                        ¥{customer.credit_limit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-medium ${customer.current_balance > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          ¥{customer.current_balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/customers/${customer.id}/edit`)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 统计信息 */}
            <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-600">
              共 {filteredCustomers.length} 个客户
            </div>
          </>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除客户"
        message={`确定要删除客户"${customerToDelete?.name}"吗？此操作不可恢复。`}
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
      />
    </div>
  );
}

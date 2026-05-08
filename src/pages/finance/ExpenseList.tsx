import { useEffect, useState } from 'react';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { useExpenseStore } from '@/stores/expenseStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { ExpenseRecord } from '@/types';

const commonExpenseTypes = ['租金', '水电费', '工资', '营销费', '运输费', '包装费', '办公费', '其他'];

export function ExpenseList() {
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);
  const [formData, setFormData] = useState({
    expense_type: '',
    amount: 0,
    remark: '',
  });

  const {
    expenses,
    total,
    loading,
    submitting,
    page,
    pageSize,
    fetchExpenses,
    createExpense,
    deleteExpense,
    setPage,
    setPageSize,
  } = useExpenseStore();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expense_type || !formData.amount || formData.amount <= 0) {
      alert('请填写完整信息');
      return;
    }

    try {
      await createExpense(formData);
      setShowForm(false);
      setFormData({
        expense_type: '',
        amount: 0,
        remark: '',
      });
    } catch (error) {
      alert('创建失败，请重试');
    }
  };

  const handleDelete = (expense: ExpenseRecord) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete.id);
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
      } catch (error) {
        alert('删除失败，请重试');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">费用管理</h1>
          <p className="text-slate-500 mt-1">管理日常运营费用</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增费用
        </button>
      </div>

      {/* 费用表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">新增费用记录</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                费用类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.expense_type}
                onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择费用类型</option>
                {commonExpenseTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                金额 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="可选备注信息"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '保存'}
            </button>
          </div>
        </form>
      )}

      {/* 费用列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Receipt className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无费用记录</p>
            <p className="text-sm mt-1">点击"新增费用"按钮添加</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">时间</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">费用类型</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">金额</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">备注</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(expense.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{expense.expense_type}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">
                        -¥{expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{expense.remark || '-'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(expense)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-6">
              <Pagination
                currentPage={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除费用记录"
        message="确定要删除这条费用记录吗？"
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setExpenseToDelete(null);
        }}
      />
    </div>
  );
}

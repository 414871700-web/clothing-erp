import { useEffect, useState } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Download, Calendar } from 'lucide-react';
import { useFinanceTransactionStore } from '@/stores/financeTransactionStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { FinanceTransaction } from '@/types';
import { exportToExcel, formatCurrency, formatDateOnly } from '@/utils/export';

export function FinanceTransactionList() {
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<FinanceTransaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    transaction_type: '销售收入' as const,
    related_order_no: '',
    amount: 0,
    payment_method: '现金' as const,
    direction: '收入' as const,
    remark: '',
  });

  const {
    transactions,
    total,
    loading,
    submitting,
    page,
    pageSize,
    filters,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  } = useFinanceTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      alert('请输入正确的金额');
      return;
    }

    try {
      await createTransaction(formData);
      setShowForm(false);
      setFormData({
        transaction_type: '销售收入',
        related_order_no: '',
        amount: 0,
        payment_method: '现金',
        direction: '收入',
        remark: '',
      });
    } catch (error) {
      alert('创建失败，请重试');
    }
  };

  const handleDelete = (transaction: FinanceTransaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete.id);
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        alert('删除失败，请重试');
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await fetchTransactions();
      
      const columns = [
        { header: '时间', key: 'created_at', width: 18, formatter: (val: string) => formatDateOnly(val) },
        { header: '类型', key: 'transaction_type', width: 15 },
        { header: '方向', key: 'direction', width: 10 },
        { header: '金额', key: 'amount', width: 12, formatter: (val: number) => formatCurrency(val) },
        { header: '付款方式', key: 'payment_method', width: 12 },
        { header: '关联单号', key: 'related_order_no', width: 20 },
        { header: '备注', key: 'remark', width: 30 },
      ];

      exportToExcel({
        filename: '财务流水',
        sheetName: '财务流水',
        columns,
        data: transactions,
        dateRange,
      });

      alert('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const getDirectionStyle = (direction: string) => {
    return direction === '收入' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">财务流水</h1>
          <p className="text-slate-500 mt-1">管理所有收支记录</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg
              hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? '导出中...' : '导出Excel'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增流水
          </button>
        </div>
      </div>

      {/* 日期筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              开始日期
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              结束日期
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {dateRange.startDate || dateRange.endDate ? (
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              清除日期
            </button>
          ) : null}
        </div>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <select
              value={filters.transactionType || ''}
              onChange={(e) => setFilters({ transactionType: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部类型</option>
              <option value="销售收入">销售收入</option>
              <option value="退款">退款</option>
              <option value="运营支出">运营支出</option>
            </select>
          </div>

          <div className="flex-1">
            <select
              value={filters.direction || ''}
              onChange={(e) => setFilters({ direction: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部方向</option>
              <option value="收入">收入</option>
              <option value="支出">支出</option>
            </select>
          </div>

          {(filters.transactionType || filters.direction) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900"
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* 流水表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">新增财务流水</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                交易类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="销售收入">销售收入</option>
                <option value="退款">退款</option>
                <option value="运营支出">运营支出</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                方向 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="收入">收入</option>
                <option value="支出">支出</option>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">付款方式</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="现金">现金</option>
                <option value="银行转账">银行转账</option>
                <option value="微信">微信</option>
                <option value="支付宝">支付宝</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">关联单号</label>
              <input
                type="text"
                value={formData.related_order_no}
                onChange={(e) => setFormData({ ...formData, related_order_no: e.target.value })}
                placeholder="例如：SO123456"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

      {/* 流水列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <DollarSign className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无流水记录</p>
            <p className="text-sm mt-1">点击"新增流水"按钮添加</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">时间</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">类型</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">方向</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">金额</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">付款方式</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">关联单号</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(transaction.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{transaction.transaction_type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getDirectionStyle(transaction.direction)}`}>
                          {transaction.direction === '收入' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                          {transaction.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${transaction.direction === '收入' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.direction === '收入' ? '+' : '-'}¥{transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{transaction.payment_method || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{transaction.related_order_no || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(transaction)}
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

            <div className="border-t border-slate-200 px-6 py-4">
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
        title="删除流水"
        message={`确定要删除这条流水记录吗？`}
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setTransactionToDelete(null);
        }}
      />
    </div>
  );
}

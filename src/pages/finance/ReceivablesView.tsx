import { useEffect, useState } from 'react';
import { Users, AlertCircle, Download, Calendar } from 'lucide-react';
import { financeReportApi } from '@/lib/finance';
import type { SalesOrder } from '@/types';
import { exportToExcel, formatCurrency, formatDateOnly } from '@/utils/export';

export function ReceivablesView() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchReceivables();
  }, [dateRange]);

  const fetchReceivables = async () => {
    setLoading(true);
    try {
      const data = await financeReportApi.getReceivables(dateRange);
      setOrders(data);
    } catch (error) {
      console.error('获取应收账款失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const columns = [
        { key: 'order_no', header: '订单号' },
        { key: 'customer_name', header: '客户名称', formatter: (row: SalesOrder) => row.customer?.name || '-' },
        { key: 'total_amount', header: '订单金额', formatter: (row: SalesOrder) => formatCurrency(row.total_amount) },
        { key: 'paid_amount', header: '已付金额', formatter: (row: SalesOrder) => formatCurrency(row.paid_amount) },
        { key: 'unpaid_amount', header: '欠款金额', formatter: (row: SalesOrder) => formatCurrency(row.unpaid_amount) },
        { key: 'created_at', header: '订单日期', formatter: (row: SalesOrder) => formatDateOnly(row.created_at) },
      ];

      exportToExcel({
        filename: '应收账款',
        sheetName: '应收账款',
        columns,
        data: orders,
        dateRange: dateRange.startDate || dateRange.endDate ? dateRange : undefined,
      });
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalReceivable = orders.reduce((sum, order) => sum + (order.unpaid_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">应收账款</h1>
          <p className="text-slate-500 mt-1">查看所有客户欠款</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-600 mb-1">总欠款金额</p>
            <p className="text-2xl font-bold text-red-600">¥{totalReceivable.toFixed(2)}</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || orders.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isExporting ? '导出中...' : '导出Excel'}
          </button>
        </div>
      </div>

      {/* 日期筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">订单日期:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 客户欠款列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Users className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无应收账款</p>
            <p className="text-sm mt-1">所有客户款项已结清</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">订单号</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">客户</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">订单金额</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">已付金额</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">欠款金额</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">订单日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.order_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.customer?.name || '-'}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-900">
                      ¥{order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-green-600">
                      ¥{order.paid_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-red-600">
                        ¥{order.unpaid_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 提示 */}
      {orders.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">催款提示</p>
            <p className="text-sm text-amber-700 mt-1">
              以上客户存在未结清款项，请及时跟进催款。可以通过"销售订单"页面的收款功能进行收款登记。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

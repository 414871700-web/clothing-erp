import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Eye,
  Receipt,
  Filter,
  X,
  Download,
  Calendar
} from 'lucide-react';
import { useSalesOrderStore } from '@/stores/salesOrderStore';
import { useCustomerStore } from '@/stores/customerStore';
import { Pagination } from '@/components/Pagination';
import { PaymentDialog } from '@/pages/sales/PaymentDialog';
import type { SalesOrder } from '@/types';
import { exportToExcel, formatCurrency, formatDateOnly } from '@/utils/export';

export function SalesOrderList() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const {
    orders,
    total,
    loading,
    page,
    pageSize,
    filters,
    fetchOrders,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  } = useSalesOrderStore();

  const { customers, fetchCustomers } = useCustomerStore();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await fetchOrders();
      
      const columns = [
        { header: '订单号', key: 'order_no', width: 20 },
        { header: '客户名称', key: 'customer_name', width: 20 },
        { header: '订单金额', key: 'total_amount', width: 12, formatter: (val: number) => formatCurrency(val) },
        { header: '已付金额', key: 'paid_amount', width: 12, formatter: (val: number) => formatCurrency(val) },
        { header: '未付金额', key: 'unpaid_amount', width: 12, formatter: (val: number) => formatCurrency(val) },
        { header: '订单状态', key: 'status', width: 10 },
        { header: '付款状态', key: 'payment_status', width: 10 },
        { header: '创建时间', key: 'created_at', width: 18, formatter: (val: string) => formatDateOnly(val) },
      ];

      const exportData = orders.map(order => ({
        ...order,
        customer_name: order.customer?.name || '-'
      }));

      exportToExcel({
        filename: '销售订单',
        sheetName: '销售订单',
        columns,
        data: exportData,
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

  const hasActiveFilters = filters.customerId || filters.status || filters.paymentStatus || dateRange.startDate || dateRange.endDate;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '待发货':
        return 'bg-yellow-100 text-yellow-700';
      case '已发货':
        return 'bg-blue-100 text-blue-700';
      case '已完成':
        return 'bg-green-100 text-green-700';
      case '已取消':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case '未付款':
        return 'bg-red-100 text-red-700';
      case '部分付款':
        return 'bg-orange-100 text-orange-700';
      case '已付清':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handlePayment = (order: SalesOrder) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">销售订单</h1>
          <p className="text-slate-500 mt-1">管理销售订单</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting || orders.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg
              hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? '导出中...' : '导出Excel'}
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
          {/* 客户筛选 */}
          <div className="flex-1">
            <select
              value={filters.customerId || ''}
              onChange={(e) => setFilters({ customerId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部客户</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>

          {/* 订单状态筛选 */}
          <div className="flex-1">
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              <option value="待发货">待发货</option>
              <option value="已发货">已发货</option>
              <option value="已完成">已完成</option>
              <option value="已取消">已取消</option>
            </select>
          </div>

          {/* 付款状态筛选 */}
          <div className="flex-1">
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => setFilters({ paymentStatus: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部付款状态</option>
              <option value="未付款">未付款</option>
              <option value="部分付款">部分付款</option>
              <option value="已付清">已付清</option>
            </select>
          </div>

          {/* 重置筛选 */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                resetFilters();
                setDateRange({ startDate: '', endDate: '' });
              }}
              className="flex items-center px-4 py-2.5 text-slate-600 hover:text-slate-900"
            >
              <X className="w-4 h-4 mr-1" />
              重置
            </button>
          )}
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无销售订单</p>
            <p className="text-sm mt-1">点击左侧"销售开单"创建订单</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">订单号</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">客户</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">订单金额</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">已付金额</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">未付金额</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">订单状态</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">付款状态</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">创建时间</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.order_no}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.customer?.name || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                        ¥{order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-green-600">
                        ¥{order.paid_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-medium ${order.unpaid_amount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          ¥{order.unpaid_amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/sales/${order.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.unpaid_amount > 0 && (
                            <button
                              onClick={() => handlePayment(order)}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="收款"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
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

      {/* 收款对话框 */}
      <PaymentDialog
        isOpen={paymentDialogOpen}
        order={selectedOrder}
        onClose={() => {
          setPaymentDialogOpen(false);
          setSelectedOrder(null);
        }}
        onSuccess={() => {
          setPaymentDialogOpen(false);
          setSelectedOrder(null);
          fetchOrders();
        }}
      />
    </div>
  );
}

import { useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import { Pagination } from '@/components/Pagination';

export function PaymentList() {
  const {
    records,
    total,
    loading,
    page,
    pageSize,
    fetchRecords,
    setPage,
    setPageSize,
  } = usePaymentStore();

  useEffect(() => {
    fetchRecords();
  }, []);

  const getMethodStyle = (method: string) => {
    switch (method) {
      case '微信':
        return 'bg-green-100 text-green-700';
      case '支付宝':
        return 'bg-blue-100 text-blue-700';
      case '银行转账':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">收款记录</h1>
        <p className="text-slate-500 mt-1">查看所有收款记录</p>
      </div>

      {/* 收款记录列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Receipt className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无收款记录</p>
            <p className="text-sm mt-1">在销售订单中收款后会产生收款记录</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">收款时间</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">订单号</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">客户</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">付款方式</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">收款金额</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(record.payment_time).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {record.sales_order?.order_no || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {record.sales_order?.customer?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getMethodStyle(record.payment_method)}`}>
                          {record.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                        +¥{record.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {record.remark || '-'}
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
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package2 } from 'lucide-react';
import { useInboundStore } from '@/stores/inboundStore';

export function InboundDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { currentOrder, loading, fetchOrder, clearCurrentOrder } = useInboundStore();

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
    return () => {
      clearCurrentOrder();
    };
  }, [id]);

  if (loading || !currentOrder) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getTotalQuantity = () => {
    return currentOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/inbound')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回入库单列表
      </button>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">入库单详情</h1>
        <p className="text-slate-500 mt-1">入库单号：{currentOrder.order_no}</p>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500">仓库</p>
            <p className="text-base font-medium text-slate-900">{currentOrder.warehouse?.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">总数量</p>
            <p className="text-base font-medium text-slate-900">{getTotalQuantity()} 件</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">创建时间</p>
            <p className="text-base font-medium text-slate-900">
              {new Date(currentOrder.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
          {currentOrder.remark && (
            <div className="md:col-span-3">
              <p className="text-sm text-slate-500">备注</p>
              <p className="text-base font-medium text-slate-900">{currentOrder.remark}</p>
            </div>
          )}
        </div>
      </div>

      {/* 入库明细 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">入库明细</h3>
        </div>

        {currentOrder.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Package2 className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无入库明细</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">商品名称</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">规格</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">入库数量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentOrder.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {item.sku?.product?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.sku?.color} / {item.sku?.size}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                      {item.quantity} 件
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

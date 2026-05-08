import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search,
  Package2,
  Eye
} from 'lucide-react';
import { useInboundStore } from '@/stores/inboundStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Pagination } from '@/components/Pagination';
import type { InboundOrder } from '@/types';

export function InboundList() {
  const navigate = useNavigate();

  const {
    orders,
    total,
    loading,
    page,
    pageSize,
    warehouseId,
    fetchOrders,
    setPage,
    setPageSize,
    setWarehouseId,
  } = useInboundStore();

  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    fetchOrders();
    fetchWarehouses();
  }, []);

  const getTotalQuantity = (order: InboundOrder) => {
    return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">入库管理</h1>
          <p className="text-slate-500 mt-1">管理商品入库单据</p>
        </div>
        <button
          onClick={() => navigate('/inbound/new')}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增进库单
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 仓库筛选 */}
          <div className="flex-1">
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部仓库</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 入库单列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Package2 className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无入库单</p>
            <p className="text-sm mt-1">点击上方"新增入库单"按钮创建</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">入库单号</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">仓库</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">入库数量</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">备注</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">创建时间</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.order_no}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.warehouse?.name}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                        {getTotalQuantity(order)} 件
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.remark || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/inbound/${order.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
    </div>
  );
}

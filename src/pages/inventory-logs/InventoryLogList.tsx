import { useEffect, useState } from 'react';
import { 
  History,
  Filter,
  X
} from 'lucide-react';
import { useInventoryLogStore } from '@/stores/inventoryLogStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Pagination } from '@/components/Pagination';

export function InventoryLogList() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    logs,
    total,
    loading,
    page,
    pageSize,
    filters,
    fetchLogs,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  } = useInventoryLogStore();

  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    fetchLogs();
    fetchWarehouses();
  }, []);

  const hasActiveFilters = filters.warehouseId || filters.changeType;

  const getChangeTypeStyle = (type: string) => {
    switch (type) {
      case '入库':
        return 'bg-green-100 text-green-700';
      case '出库':
        return 'bg-red-100 text-red-700';
      case '调整':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">库存流水</h1>
        <p className="text-slate-500 mt-1">查看所有库存变动记录</p>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 仓库筛选 */}
          <div className="flex-1">
            <select
              value={filters.warehouseId || ''}
              onChange={(e) => setFilters({ warehouseId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部仓库</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
              ))}
            </select>
          </div>

          {/* 变动类型筛选 */}
          <div className="flex-1">
            <select
              value={filters.changeType || ''}
              onChange={(e) => setFilters({ changeType: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部类型</option>
              <option value="入库">入库</option>
              <option value="出库">出库</option>
              <option value="调整">调整</option>
            </select>
          </div>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-4 py-2.5 rounded-lg border font-medium transition-colors
              ${showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }
            `}
          >
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </button>
        </div>

        {/* 重置筛选 */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="flex items-center text-sm text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4 mr-1" />
              重置筛选
            </button>
          </div>
        )}
      </div>

      {/* 库存流水列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <History className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无库存流水</p>
            <p className="text-sm mt-1">入库、出库等操作会产生库存流水</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">时间</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">商品信息</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">仓库</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">变动类型</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">变动数量</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">变动前</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">变动后</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">关联单号</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(log.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{log.product_name}</p>
                          <p className="text-xs text-slate-500">
                            {log.sku_color} / {log.sku_size}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{log.warehouse_name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getChangeTypeStyle(log.change_type)}`}>
                          {log.change_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">{log.before_quantity}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">{log.after_quantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{log.reference_no || '-'}</td>
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

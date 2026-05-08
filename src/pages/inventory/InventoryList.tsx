import { useEffect, useState } from 'react';
import { 
  Package2,
  Filter,
  X,
  Download
} from 'lucide-react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Pagination } from '@/components/Pagination';
import { exportToExcel, formatCurrency, formatDateOnly } from '@/utils/export';

export function InventoryList() {
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    inventories,
    total,
    loading,
    page,
    pageSize,
    filters,
    fetchInventories,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  } = useInventoryStore();

  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    fetchInventories();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchInventories();
  }, [page, pageSize, filters]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await fetchInventories();
      
      const columns = [
        { header: '款号', key: 'product_code', width: 15 },
        { header: '商品名称', key: 'product_name', width: 25 },
        { header: '颜色', key: 'sku_color', width: 10 },
        { header: '尺码', key: 'sku_size', width: 8 },
        { header: '仓库', key: 'warehouse_name', width: 12 },
        { header: '库存数量', key: 'quantity', width: 10 },
        { header: '成本价', key: 'sku_cost_price', width: 12, formatter: (val: number) => formatCurrency(val) },
        { header: '库存价值', key: 'total_value', width: 12, formatter: (_, row) => formatCurrency(row.quantity * row.sku_cost_price) },
        { header: '更新时间', key: 'updated_at', width: 18, formatter: (val: string) => formatDateOnly(val) },
      ];

      exportToExcel({
        filename: '库存列表',
        sheetName: '库存',
        columns,
        data: inventories.map(inv => ({ ...inv, total_value: inv.quantity * inv.sku_cost_price })),
      });

      alert('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters = filters.warehouseId || filters.skuId;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">库存管理</h1>
          <p className="text-slate-500 mt-1">查看和管理商品库存</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting || inventories.length === 0}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg
            hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? '导出中...' : '导出Excel'}
        </button>
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
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {filters.warehouseId ? 1 : 0}
              </span>
            )}
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

      {/* 库存列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : inventories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Package2 className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无库存数据</p>
            <p className="text-sm mt-1">请先入库商品</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">商品信息</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">仓库</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">库存数量</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">成本价</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">库存价值</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">更新时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventories.map((inventory) => (
                    <tr key={inventory.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{inventory.product_name}</p>
                          <p className="text-sm text-slate-500">{inventory.product_code}</p>
                          <p className="text-sm text-slate-500">
                            {inventory.sku_color} / {inventory.sku_size}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{inventory.warehouse_name}</p>
                          <p className="text-xs text-slate-500">{inventory.warehouse_code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-medium ${inventory.quantity <= 10 ? 'text-red-600' : 'text-slate-900'}`}>
                          {inventory.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">
                        ¥{inventory.sku_cost_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                        ¥{(inventory.quantity * inventory.sku_cost_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500">
                        {new Date(inventory.updated_at).toLocaleDateString('zh-CN')}
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

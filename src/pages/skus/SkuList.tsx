import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2,
  Tags,
  X,
  Package
} from 'lucide-react';
import { useSkuStore } from '@/stores/skuStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { ProductSku } from '@/types';

export function SkuList() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skuToDelete, setSkuToDelete] = useState<ProductSku | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    skus,
    total,
    loading,
    page,
    pageSize,
    productId,
    color,
    size,
    colors,
    sizes,
    products,
    fetchSkus,
    setPage,
    setPageSize,
    setProductId,
    setColor,
    setSize,
    resetFilters,
    fetchOptions,
    fetchProducts,
    deleteSku,
  } = useSkuStore();

  useEffect(() => {
    fetchSkus();
    fetchOptions();
    fetchProducts();
  }, []);

  const handleDelete = (sku: ProductSku) => {
    setSkuToDelete(sku);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (skuToDelete) {
      try {
        await deleteSku(skuToDelete.id);
        setDeleteDialogOpen(false);
        setSkuToDelete(null);
      } catch (error) {
        alert('删除失败，请重试');
      }
    }
  };

  const hasActiveFilters = productId || color || size;

  // 获取商品名称
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || '-';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SKU管理</h1>
          <p className="text-slate-500 mt-1">管理商品规格信息</p>
        </div>
        <button
          onClick={() => navigate('/skus/new')}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增SKU
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 商品筛选 */}
          <div className="flex-1">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部商品</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
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
                {[productId, color, size].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* 筛选条件 */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 颜色筛选 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">颜色</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部颜色</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 尺码筛选 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">尺码</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部尺码</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
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
        )}
      </div>

      {/* SKU列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : skus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Tags className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无SKU</p>
            <p className="text-sm mt-1">点击上方"新增SKU"按钮添加</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">商品</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">颜色</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">尺码</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">条码</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">成本价</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">销售价</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">库存</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skus.map((sku) => (
                    <tr key={sku.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {sku.product?.image_url ? (
                            <img
                              src={sku.product.image_url}
                              alt={sku.product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{sku.product?.name || getProductName(sku.product_id)}</p>
                            <p className="text-xs text-slate-500">{sku.product?.product_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{sku.color}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{sku.size}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sku.barcode || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-right">¥{sku.cost_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-right">¥{sku.sale_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-medium ${sku.current_stock <= sku.warning_stock ? 'text-red-600' : 'text-slate-900'}`}>
                          {sku.current_stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/skus/${sku.id}/edit`)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sku)}
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

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除SKU"
        message={`确定要删除该SKU吗？颜色：${skuToDelete?.color}，尺码：${skuToDelete?.size}。此操作不可恢复。`}
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSkuToDelete(null);
        }}
      />
    </div>
  );
}

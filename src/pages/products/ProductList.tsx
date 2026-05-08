import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  Package,
  X,
  Download,
  ChevronRight
} from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ResponsiveTable, MobileCard } from '@/components/ResponsiveTable';
import type { Product } from '@/types';
import { exportToExcel, formatDateOnly, formatStatus } from '@/utils/export';

export function ProductList() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setViewMode('cards');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    products,
    total,
    loading,
    page,
    pageSize,
    search,
    category,
    brand,
    status,
    categories,
    brands,
    fetchProducts,
    setPage,
    setPageSize,
    setSearch,
    setCategory,
    setBrand,
    setStatus,
    resetFilters,
    fetchOptions,
    deleteProduct,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, search, category, brand, status]);

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        alert('删除失败，请重试');
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await fetchProducts();
      
      const columns = [
        { header: '款号', key: 'product_code', width: 15 },
        { header: '商品名称', key: 'name', width: 25 },
        { header: '分类', key: 'category', width: 12 },
        { header: '品牌', key: 'brand', width: 12 },
        { header: '季节', key: 'season', width: 10 },
        { header: '状态', key: 'status', width: 10, formatter: (val: string) => formatStatus(val) },
        { header: '创建时间', key: 'created_at', width: 18, formatter: (val: string) => formatDateOnly(val) },
      ];

      exportToExcel({
        filename: '商品列表',
        sheetName: '商品',
        columns,
        data: products,
      });

      alert('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters = category || brand || status;

  const productColumns = [
    { key: 'product_code', header: '款号', width: 120 },
    { key: 'name', header: '商品名称' },
    { key: 'category', header: '分类' },
    { key: 'brand', header: '品牌' },
    { key: 'season', header: '季节' },
    { key: 'status', header: '状态', render: (product: Product) => (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
        product.status === '上架'
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-600'
      }`}>
        {product.status}
      </span>
    )},
    { key: 'created_at', header: '创建时间', render: (product: Product) => formatDateOnly(product.created_at) },
    { key: 'actions', header: '操作', width: 140, render: (product: Product) => (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => navigate(`/products/${product.id}`)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="查看"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(`/products/${product.id}/edit`)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="编辑"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(product)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">商品管理</h1>
          <p className="text-slate-500 mt-1">管理商品档案信息</p>
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title={viewMode === 'table' ? '卡片视图' : '列表视图'}
            >
              {viewMode === 'table' ? (
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting || products.length === 0}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg
              hover:bg-green-700 transition-colors font-medium disabled:opacity-50 touch-manipulation"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{isExporting ? '导出中...' : '导出Excel'}</span>
            <span className="sm:hidden">{isExporting ? '导出' : '导出'}</span>
          </button>
          <button
            onClick={() => navigate('/products/new')}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 transition-colors font-medium touch-manipulation"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">新增商品</span>
            <span className="sm:hidden">新增</span>
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索商品名称或款号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                {[category, brand, status].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* 筛选条件 */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 分类筛选 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">分类</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部分类</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 品牌筛选 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">品牌</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部品牌</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* 状态筛选 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value="上架">上架</option>
                  <option value="下架">下架</option>
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

      {/* 商品列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Package className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无商品</p>
            <p className="text-sm mt-1">点击"新增商品"添加第一条记录</p>
          </div>
        ) : (
          <>
            {/* 桌面端：表格视图 */}
            {!isMobile && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">款号</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">商品名称</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">分类</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">品牌</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">季节</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">状态</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-slate-900">{product.product_code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{product.name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{product.category || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{product.brand || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{product.season || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === '上架'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="查看"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/products/${product.id}/edit`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
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
            )}

            {/* 移动端：卡片视图 */}
            {isMobile && (
              <div className="p-3 space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-slate-500">{product.product_code}</p>
                        <p className="font-medium text-slate-900 mt-1">{product.name}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === '上架'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-slate-500">分类：</span>
                        <span className="text-slate-700">{product.category || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">品牌：</span>
                        <span className="text-slate-700">{product.brand || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">季节：</span>
                        <span className="text-slate-700">{product.season || '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product.id}/edit`);
                        }}
                        className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors touch-manipulation"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product);
                        }}
                        className="flex-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors touch-manipulation"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">共 {total} 个商品</p>
                <Pagination
                  currentPage={page}
                  pageSize={pageSize}
                  total={total}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除商品"
        message={`确定要删除商品"${productToDelete?.name}"吗？此操作不可恢复。`}
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}

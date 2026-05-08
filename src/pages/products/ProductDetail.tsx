import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Package, Tags, Plus } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { useSkuStore } from '@/stores/skuStore';

export function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    currentProduct,
    loading: productLoading,
    fetchProduct,
    clearCurrentProduct,
  } = useProductStore();

  const {
    skusByProduct,
    loading: skuLoading,
    fetchSkusByProduct,
  } = useSkuStore();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchSkusByProduct(id);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [id]);

  if (productLoading || !currentProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回商品列表
      </button>

      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{currentProduct.name}</h1>
          <p className="text-slate-500 mt-1">款号: {currentProduct.product_code}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/products/${id}/edit`}
            className="flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            编辑商品
          </Link>
          <Link
            to={`/skus/new?productId=${id}`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加SKU
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：商品信息 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* 商品图片 */}
            <div className="aspect-square bg-slate-100 flex items-center justify-center">
              {currentProduct.image_url ? (
                <img
                  src={currentProduct.image_url}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-20 h-20 text-slate-300" />
              )}
            </div>

            {/* 商品信息 */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">状态</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium
                  ${currentProduct.status === '上架' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-600'
                  }
                `}>
                  {currentProduct.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">分类</span>
                <span className="text-sm font-medium text-slate-900">{currentProduct.category || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">品牌</span>
                <span className="text-sm font-medium text-slate-900">{currentProduct.brand || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">季节</span>
                <span className="text-sm font-medium text-slate-900">{currentProduct.season || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">创建时间</span>
                <span className="text-sm font-medium text-slate-900">
                  {new Date(currentProduct.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：SKU列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tags className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">SKU列表</h2>
              </div>
              <span className="text-sm text-slate-500">
                共 {skusByProduct.length} 个SKU
              </span>
            </div>

            {skuLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : skusByProduct.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Tags className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium">暂无SKU</p>
                <p className="text-sm mt-1">点击"添加SKU"按钮创建</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">颜色</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">尺码</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">条码</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">成本价</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">销售价</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">库存</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skusByProduct.map((sku) => (
                      <tr key={sku.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-900">{sku.color}</td>
                        <td className="px-6 py-3 text-sm text-slate-900">{sku.size}</td>
                        <td className="px-6 py-3 text-sm text-slate-600">{sku.barcode || '-'}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 text-right">¥{sku.cost_price.toFixed(2)}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 text-right">¥{sku.sale_price.toFixed(2)}</td>
                        <td className="px-6 py-3 text-sm text-right">
                          <span className={`font-medium ${sku.current_stock <= sku.warning_stock ? 'text-red-600' : 'text-slate-900'}`}>
                            {sku.current_stock}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <Link
                            to={`/skus/${sku.id}/edit`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            编辑
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Tags } from 'lucide-react';
import { useSkuStore } from '@/stores/skuStore';
import type { SkuFormData } from '@/types';

export function SkuForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const initialProductId = searchParams.get('productId') || '';

  const {
    currentSku,
    loading,
    submitting,
    products,
    fetchSku,
    createSku,
    updateSku,
    fetchProducts,
    clearCurrentSku,
  } = useSkuStore();

  const [formData, setFormData] = useState<SkuFormData>({
    product_id: initialProductId,
    color: '',
    size: '',
    barcode: null,
    cost_price: 0,
    sale_price: 0,
    warning_stock: 0,
    current_stock: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts();
    if (isEdit && id) {
      fetchSku(id);
    }
    return () => {
      clearCurrentSku();
    };
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit && currentSku) {
      setFormData({
        product_id: currentSku.product_id,
        color: currentSku.color,
        size: currentSku.size,
        barcode: currentSku.barcode,
        cost_price: currentSku.cost_price,
        sale_price: currentSku.sale_price,
        warning_stock: currentSku.warning_stock,
        current_stock: currentSku.current_stock,
      });
    }
  }, [currentSku, isEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = '请选择商品';
    }

    if (!formData.color.trim()) {
      newErrors.color = '请输入颜色';
    }

    if (!formData.size.trim()) {
      newErrors.size = '请输入尺码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEdit && id) {
        await updateSku(id, formData);
      } else {
        await createSku(formData);
      }
      navigate('/skus');
    } catch (error: any) {
      console.error('保存失败:', error);
      if (error.message?.includes('unique constraint')) {
        alert('保存失败：该商品已存在相同颜色和尺码的SKU');
      } else {
        alert('保存失败，请重试');
      }
    }
  };

  const handleChange = (field: keyof SkuFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberChange = (field: keyof SkuFormData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/skus')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回SKU列表
      </button>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? '编辑SKU' : '新增SKU'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isEdit ? '修改SKU信息' : '为商品添加新的规格'}
        </p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 商品选择 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  所属商品 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleChange('product_id', e.target.value)}
                  disabled={isEdit}
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors
                    ${errors.product_id 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                    ${isEdit ? 'bg-slate-50 cursor-not-allowed' : ''}
                  `}
                >
                  <option value="">请选择商品</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.product_code})
                    </option>
                  ))}
                </select>
                {errors.product_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>
                )}
                {isEdit && (
                  <p className="mt-1 text-sm text-slate-500">SKU创建后不能更改所属商品</p>
                )}
              </div>

              {/* 颜色 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  颜色 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="例如：白色、黑色、红色"
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors
                    ${errors.color 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                  `}
                />
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                )}
              </div>

              {/* 尺码 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  尺码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  placeholder="例如：S、M、L、XL"
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors
                    ${errors.size 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                  `}
                />
                {errors.size && (
                  <p className="mt-1 text-sm text-red-600">{errors.size}</p>
                )}
              </div>

              {/* 条码 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">条码</label>
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => handleChange('barcode', e.target.value || null)}
                  placeholder="请输入商品条码（可选）"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 价格信息 */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">价格信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 成本价 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">成本价</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price || ''}
                    onChange={(e) => handleNumberChange('cost_price', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 销售价 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">销售价</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sale_price || ''}
                    onChange={(e) => handleNumberChange('sale_price', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 库存信息 */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">库存信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 安全库存 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">安全库存</label>
                <input
                  type="number"
                  min="0"
                  value={formData.warning_stock || ''}
                  onChange={(e) => handleNumberChange('warning_stock', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-slate-500">库存低于此值时将发出预警</p>
              </div>

              {/* 当前库存 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">当前库存</label>
                <input
                  type="number"
                  min="0"
                  value={formData.current_stock || ''}
                  onChange={(e) => handleNumberChange('current_stock', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-slate-500">第一阶段可手动设置，后续将通过出入库自动计算</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/skus')}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-white transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isEdit ? '保存修改' : '创建SKU'}
          </button>
        </div>
      </form>
    </div>
  );
}

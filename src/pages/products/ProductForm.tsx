import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Upload, X } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import type { ProductFormData } from '@/types';

const seasons = ['春季', '夏季', '秋季', '冬季', '四季'];
const statuses = [
  { value: '上架', label: '上架' },
  { value: '下架', label: '下架' },
];

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const {
    currentProduct,
    loading,
    submitting,
    fetchProduct,
    createProduct,
    updateProduct,
    clearCurrentProduct,
  } = useProductStore();

  const [formData, setFormData] = useState<ProductFormData>({
    product_code: '',
    name: '',
    category: '',
    brand: '',
    season: '',
    image_url: null,
    status: '上架',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchProduct(id);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit && currentProduct) {
      setFormData({
        product_code: currentProduct.product_code,
        name: currentProduct.name,
        category: currentProduct.category,
        brand: currentProduct.brand,
        season: currentProduct.season,
        image_url: currentProduct.image_url,
        status: currentProduct.status,
      });
    }
  }, [currentProduct, isEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_code.trim()) {
      newErrors.product_code = '请输入款号';
    }

    if (!formData.name.trim()) {
      newErrors.name = '请输入商品名称';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEdit && id) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      navigate('/products');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 这里简化处理，实际应该上传到Supabase Storage
    // 现在使用FileReader生成临时预览URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image_url: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image_url: null }));
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
        onClick={() => navigate('/products')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-4 lg:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">返回商品列表</span>
        <span className="sm:hidden">返回</span>
      </button>

      {/* 页面标题 */}
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {isEdit ? '编辑商品' : '新增商品'}
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          {isEdit ? '修改商品信息' : '录入新的商品档案'}
        </p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 sm:p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* 款号 */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  款号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.product_code}
                  onChange={(e) => handleChange('product_code', e.target.value)}
                  placeholder="请输入款号"
                  className={`w-full px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg border text-base sm:text-sm focus:outline-none focus:ring-2 transition-colors touch-manipulation
                    ${errors.product_code 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                  `}
                />
                {errors.product_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_code}</p>
                )}
              </div>

              {/* 商品名称 */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  商品名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="请输入商品名称"
                  className={`w-full px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg border text-base sm:text-sm focus:outline-none focus:ring-2 transition-colors touch-manipulation
                    ${errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                  `}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">分类</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="请输入分类"
                  className="w-full px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                />
              </div>

              {/* 品牌 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">品牌</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="请输入品牌"
                  className="w-full px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                />
              </div>

              {/* 季节 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">季节</label>
                <select
                  value={formData.season}
                  onChange={(e) => handleChange('season', e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation bg-white"
                >
                  <option value="">请选择季节</option>
                  {seasons.map((season) => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as '上架' | '下架')}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation bg-white"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 商品图片 */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">商品图片</h3>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {formData.image_url ? (
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="商品预览"
                    className="w-32 h-32 rounded-lg object-cover bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1.5 sm:p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full sm:w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500">上传图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
              <div className="text-sm text-slate-500">
                <p>支持 JPG、PNG 格式</p>
                <p>建议尺寸 800x800 像素</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 sm:px-6 py-3 sm:py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-white transition-colors touch-manipulation"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center px-6 sm:px-8 py-3 sm:py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-w-[120px]"
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isEdit ? '保存修改' : '创建商品'}
          </button>
        </div>
      </form>
    </div>
  );
}

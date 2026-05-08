import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import type { WarehouseFormData } from '@/types';

export function WarehouseForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const {
    currentWarehouse,
    loading,
    submitting,
    fetchWarehouse,
    createWarehouse,
    updateWarehouse,
    clearCurrentWarehouse,
  } = useWarehouseStore();

  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    code: '',
    location: null,
    status: '启用',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchWarehouse(id);
    }
    return () => {
      clearCurrentWarehouse();
    };
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit && currentWarehouse) {
      setFormData({
        name: currentWarehouse.name,
        code: currentWarehouse.code,
        location: currentWarehouse.location,
        status: currentWarehouse.status,
      });
    }
  }, [currentWarehouse, isEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入仓库名称';
    }

    if (!formData.code.trim()) {
      newErrors.code = '请输入仓库编码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEdit && id) {
        await updateWarehouse(id, formData);
      } else {
        await createWarehouse(formData);
      }
      navigate('/warehouses');
    } catch (error: any) {
      console.error('保存失败:', error);
      if (error.message?.includes('unique constraint')) {
        alert('保存失败：仓库编码已存在');
      } else {
        alert('保存失败，请重试');
      }
    }
  };

  const handleChange = (field: keyof WarehouseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/warehouses')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回仓库列表
      </button>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? '编辑仓库' : '新增仓库'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isEdit ? '修改仓库信息' : '添加新的仓库'}
        </p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="space-y-4">
              {/* 仓库名称 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  仓库名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="请输入仓库名称"
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors
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

              {/* 仓库编码 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  仓库编码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="例如：WH001"
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors
                    ${errors.code 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                  `}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              {/* 仓库地址 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">仓库地址</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value || '')}
                  placeholder="请输入仓库地址"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="启用">启用</option>
                  <option value="停用">停用</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/warehouses')}
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
            {isEdit ? '保存修改' : '创建仓库'}
          </button>
        </div>
      </form>
    </div>
  );
}

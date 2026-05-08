import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCustomerStore } from '@/stores/customerStore';
import type { CustomerFormData } from '@/types';

const customerTypes = [
  { value: '普通客户', label: '普通客户' },
  { value: 'VIP客户', label: 'VIP客户' },
  { value: '批发商', label: '批发商' },
];

export function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const {
    currentCustomer,
    loading,
    submitting,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    clearCurrentCustomer,
  } = useCustomerStore();

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: null,
    address: null,
    customer_type: '普通客户',
    credit_limit: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchCustomer(id);
    }
    return () => {
      clearCurrentCustomer();
    };
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit && currentCustomer) {
      setFormData({
        name: currentCustomer.name,
        phone: currentCustomer.phone,
        address: currentCustomer.address,
        customer_type: currentCustomer.customer_type,
        credit_limit: currentCustomer.credit_limit,
      });
    }
  }, [currentCustomer, isEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入客户名称';
    }

    if (formData.credit_limit < 0) {
      newErrors.credit_limit = '信用额度不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEdit && id) {
        await updateCustomer(id, formData);
      } else {
        await createCustomer(formData);
      }
      navigate('/customers');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: any) => {
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
        onClick={() => navigate('/customers')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回客户列表
      </button>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? '编辑客户' : '新增客户'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isEdit ? '修改客户信息' : '添加新客户'}
        </p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="space-y-4">
              {/* 客户名称 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  客户名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="请输入客户名称"
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

              {/* 联系电话 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">联系电话</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value || null)}
                  placeholder="请输入联系电话"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 客户地址 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">客户地址</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value || null)}
                  placeholder="请输入客户地址"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 客户类型 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">客户类型</label>
                <select
                  value={formData.customer_type}
                  onChange={(e) => handleChange('customer_type', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {customerTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* 信用额度 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">信用额度</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.credit_limit || ''}
                    onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.credit_limit && (
                  <p className="mt-1 text-sm text-red-600">{errors.credit_limit}</p>
                )}
                <p className="mt-1 text-sm text-slate-500">允许的最大欠款额度</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/customers')}
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
            {isEdit ? '保存修改' : '创建客户'}
          </button>
        </div>
      </form>
    </div>
  );
}

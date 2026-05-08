import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useInboundStore } from '@/stores/inboundStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useSkuStore } from '@/stores/skuStore';
import type { InboundItemFormData } from '@/types';

export function InboundForm() {
  const navigate = useNavigate();

  const { submitting, createOrder } = useInboundStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const { skus, fetchSkus } = useSkuStore();

  const [warehouseId, setWarehouseId] = useState('');
  const [remark, setRemark] = useState('');
  const [items, setItems] = useState<Array<{ skuId: string; quantity: number }>>([
    { skuId: '', quantity: 1 }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWarehouses();
    fetchSkus();
  }, []);

  const addItem = () => {
    setItems([...items, { skuId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: 'skuId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    if (field === 'skuId') {
      newItems[index].skuId = value as string;
    } else {
      newItems[index].quantity = Math.max(1, value as number);
    }
    setItems(newItems);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!warehouseId) {
      newErrors.warehouse = '请选择仓库';
    }

    const validItems = items.filter(item => item.skuId && item.quantity > 0);
    if (validItems.length === 0) {
      newErrors.items = '请至少添加一个有效的SKU';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const validItems: InboundItemFormData[] = items
        .filter(item => item.skuId && item.quantity > 0)
        .map(item => ({
          sku_id: item.skuId,
          quantity: item.quantity
        }));

      await createOrder(
        {
          warehouse_id: warehouseId,
          remark: remark || null
        },
        validItems
      );

      navigate('/inbound');
    } catch (error) {
      console.error('创建入库单失败:', error);
      alert('创建入库单失败，请重试');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/inbound')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回入库单列表
      </button>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">新增入库单</h1>
        <p className="text-slate-500 mt-1">创建新的入库单据</p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 仓库 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  仓库 <span className="text-red-500">*</span>
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors
                    ${errors.warehouse 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                  `}
                >
                  <option value="">请选择仓库</option>
                  {warehouses.filter(w => w.status === '启用').map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
                {errors.warehouse && (
                  <p className="mt-1 text-sm text-red-600">{errors.warehouse}</p>
                )}
              </div>

              {/* 备注 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="请输入备注信息（可选）"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 入库明细 */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">入库明细</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加SKU
              </button>
            </div>

            {errors.items && (
              <p className="mb-4 text-sm text-red-600">{errors.items}</p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <select
                      value={item.skuId}
                      onChange={(e) => updateItem(index, 'skuId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">选择SKU</option>
                      {skus.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.product?.name} - {sku.color} / {sku.size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-32">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="数量"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 总数量 */}
            <div className="mt-4 text-right text-lg font-semibold text-slate-900">
              总数量：{items.reduce((sum, item) => sum + (item.quantity || 0), 0)} 件
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/inbound')}
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
            确认入库
          </button>
        </div>
      </form>
    </div>
  );
}

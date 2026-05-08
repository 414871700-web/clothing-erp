import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useSalesOrderStore } from '@/stores/salesOrderStore';
import { useCustomerStore } from '@/stores/customerStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useSkuStore } from '@/stores/skuStore';
import type { SalesOrderFormData } from '@/types';

export function SalesOrderForm() {
  const navigate = useNavigate();

  const { submitting, createOrder } = useSalesOrderStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const { skus, fetchSkus } = useSkuStore();

  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState<Array<{ skuId: string; quantity: number; unitPrice: number }>>([
    { skuId: '', quantity: 1, unitPrice: 0 }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCustomers();
    fetchWarehouses();
    fetchSkus();
  }, []);

  useEffect(() => {
    if (skus.length > 0) {
      const selectedSku = skus.find(s => s.id === items[0]?.skuId);
      if (selectedSku && items[0].unitPrice === 0) {
        const newItems = [...items];
        newItems[0].unitPrice = selectedSku.sale_price;
        setItems(newItems);
      }
    }
  }, [skus]);

  const addItem = () => {
    setItems([...items, { skuId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: 'skuId' | 'quantity' | 'unitPrice', value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'skuId') {
      const selectedSku = skus.find(s => s.id === value);
      if (selectedSku) {
        newItems[index].unitPrice = selectedSku.sale_price;
      }
    }
    
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customer = '请选择客户';
    }

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
      const validItems = items
        .filter(item => item.skuId && item.quantity > 0)
        .map(item => ({
          sku_id: item.skuId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        }));

      const orderData: SalesOrderFormData = {
        customer_id: customerId,
        warehouse_id: warehouseId,
        items: validItems,
      };

      await createOrder(orderData);
      navigate('/sales');
    } catch (error) {
      console.error('创建销售订单失败:', error);
      alert('创建销售订单失败，请重试');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/sales')}
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回销售订单列表
      </button>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">销售开单</h1>
        <p className="text-slate-500 mt-1">创建新的销售订单</p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 客户选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  客户 <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors
                    ${errors.customer 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                    }
                  `}
                >
                  <option value="">选择客户</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
                )}
              </div>

              {/* 仓库选择 */}
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
                  <option value="">选择仓库</option>
                  {warehouses.filter(w => w.status === '启用').map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
                {errors.warehouse && (
                  <p className="mt-1 text-sm text-red-600">{errors.warehouse}</p>
                )}
              </div>
            </div>
          </div>

          {/* 订单明细 */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">订单明细</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加商品
              </button>
            </div>

            {errors.items && (
              <p className="mb-4 text-sm text-red-600">{errors.items}</p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">SKU</label>
                    <select
                      value={item.skuId}
                      onChange={(e) => updateItem(index, 'skuId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">选择SKU</option>
                      {skus.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.product?.name} - {sku.color} / {sku.size} (¥{sku.sale_price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs text-slate-500 mb-1">数量</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs text-slate-500 mb-1">单价</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs text-slate-500 mb-1">小计</label>
                    <div className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-right font-medium">
                      ¥{(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 总金额 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>订单总金额：</span>
                <span className="text-2xl text-blue-600">¥{getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            type="button"
            onClick={() => navigate('/sales')}
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
            确认开单
          </button>
        </div>
      </form>
    </div>
  );
}

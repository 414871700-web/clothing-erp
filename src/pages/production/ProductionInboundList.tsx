import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Package, ArrowLeft } from 'lucide-react';
import { useProductionInboundStore } from '@/stores/productionInboundStore';
import { useSkuStore } from '@/stores/skuStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { ProductionInboundOrder } from '@/types';

export function ProductionInboundList() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<ProductionInboundOrder | null>(null);
  const [formData, setFormData] = useState({
    sku_id: '',
    warehouse_id: '',
    quantity: 1,
    production_batch_no: '',
    remark: '',
  });

  const {
    inboundOrders,
    total,
    loading,
    submitting,
    page,
    pageSize,
    fetchInboundOrders,
    createInboundOrder,
    deleteInboundOrder,
    setPage,
    setPageSize,
  } = useProductionInboundStore();

  const { skus, fetchSkus } = useSkuStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    fetchInboundOrders();
    fetchSkus();
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku_id || !formData.warehouse_id || !formData.quantity) {
      alert('请填写完整信息');
      return;
    }

    try {
      await createInboundOrder(formData);
      setShowForm(false);
      setFormData({
        sku_id: '',
        warehouse_id: '',
        quantity: 1,
        production_batch_no: '',
        remark: '',
      });
    } catch (error) {
      alert('创建失败，请重试');
    }
  };

  const handleDelete = (order: ProductionInboundOrder) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteInboundOrder(orderToDelete.id);
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
      } catch (error) {
        alert('删除失败，请重试');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">生产入库</h1>
          <p className="text-slate-500 mt-1">管理生产成品入库</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增入库
        </button>
      </div>

      {/* 入库表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">新增生产入库</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                SKU <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sku_id}
                onChange={(e) => setFormData({ ...formData, sku_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择SKU</option>
                {skus.map((sku) => (
                  <option key={sku.id} value={sku.id}>
                    {sku.product?.name} - {sku.color} / {sku.size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                仓库 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.warehouse_id}
                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择仓库</option>
                {warehouses.filter(w => w.status === '启用').map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                入库数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">生产批次号</label>
              <input
                type="text"
                value={formData.production_batch_no}
                onChange={(e) => setFormData({ ...formData, production_batch_no: e.target.value })}
                placeholder="例如：BATCH-2024-001"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="可选备注信息"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '确认入库'}
            </button>
          </div>
        </form>
      )}

      {/* 入库列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : inboundOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Package className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无入库记录</p>
            <p className="text-sm mt-1">点击"新增入库"按钮添加</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">入库单号</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">SKU</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">数量</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">生产批次</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">创建时间</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inboundOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.order_no}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.sku?.product?.name} - {order.sku?.color} / {order.sku?.size}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.production_batch_no || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(order)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
        title="删除入库单"
        message="确定要删除这条入库记录吗？库存和流水记录不会被删除。"
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setOrderToDelete(null);
        }}
      />
    </div>
  );
}

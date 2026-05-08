import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, DollarSign } from 'lucide-react';
import { useProductionCostStore } from '@/stores/productionCostStore';
import { useSkuStore } from '@/stores/skuStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { ProductionCost } from '@/types';

export function ProductionCostList() {
  const [showForm, setShowForm] = useState(false);
  const [editCost, setEditCost] = useState<ProductionCost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costToDelete, setCostToDelete] = useState<ProductionCost | null>(null);
  const [formData, setFormData] = useState({
    sku_id: '',
    batch_no: '',
    material_cost: 0,
    labor_cost: 0,
    other_cost: 0,
  });

  const {
    costs,
    total,
    loading,
    submitting,
    page,
    pageSize,
    fetchCosts,
    createCost,
    updateCost,
    deleteCost,
    setPage,
    setPageSize,
  } = useProductionCostStore();

  const { skus, fetchSkus } = useSkuStore();

  useEffect(() => {
    fetchCosts();
    fetchSkus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku_id) {
      alert('请选择SKU');
      return;
    }

    try {
      if (editCost) {
        await updateCost(editCost.id, formData);
      } else {
        await createCost(formData);
      }
      setShowForm(false);
      setEditCost(null);
      setFormData({
        sku_id: '',
        batch_no: '',
        material_cost: 0,
        labor_cost: 0,
        other_cost: 0,
      });
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (cost: ProductionCost) => {
    setEditCost(cost);
    setFormData({
      sku_id: cost.sku_id,
      batch_no: cost.batch_no || '',
      material_cost: cost.material_cost,
      labor_cost: cost.labor_cost,
      other_cost: cost.other_cost,
    });
    setShowForm(true);
  };

  const handleDelete = (cost: ProductionCost) => {
    setCostToDelete(cost);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (costToDelete) {
      try {
        await deleteCost(costToDelete.id);
        setDeleteDialogOpen(false);
        setCostToDelete(null);
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
          <h1 className="text-2xl font-bold text-slate-900">生产成本</h1>
          <p className="text-slate-500 mt-1">记录生产成本明细</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditCost(null);
            setFormData({
              sku_id: '',
              batch_no: '',
              material_cost: 0,
              labor_cost: 0,
              other_cost: 0,
            });
          }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增成本
        </button>
      </div>

      {/* 成本表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editCost ? '编辑生产成本' : '新增生产成本'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">批次号</label>
              <input
                type="text"
                value={formData.batch_no}
                onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })}
                placeholder="例如：BATCH-2024-001"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">原料成本</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.material_cost}
                  onChange={(e) => setFormData({ ...formData, material_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">人工成本</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">其他成本</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.other_cost}
                  onChange={(e) => setFormData({ ...formData, other_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">总成本</label>
              <div className="px-3 py-2.5 bg-slate-100 rounded-lg text-right font-semibold text-lg text-blue-600">
                ¥{(formData.material_cost + formData.labor_cost + formData.other_cost).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditCost(null);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '保存'}
            </button>
          </div>
        </form>
      )}

      {/* 成本列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : costs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <DollarSign className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无成本记录</p>
            <p className="text-sm mt-1">点击"新增成本"按钮添加</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">SKU</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">批次</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">原料</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">人工</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">其他</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">总成本</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {costs.map((cost) => (
                    <tr key={cost.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {cost.sku?.product?.name} - {cost.sku?.color} / {cost.sku?.size}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{cost.batch_no || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">¥{cost.material_cost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">¥{cost.labor_cost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">¥{cost.other_cost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">¥{cost.total_cost.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cost)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cost)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        title="删除成本记录"
        message="确定要删除这条成本记录吗？"
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setCostToDelete(null);
        }}
      />
    </div>
  );
}

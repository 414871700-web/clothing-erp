import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Warehouse as WarehouseIcon,
  X
} from 'lucide-react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Warehouse } from '@/types';

export function WarehouseList() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);

  const {
    warehouses,
    total,
    loading,
    fetchWarehouses,
    deleteWarehouse,
  } = useWarehouseStore();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleDelete = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (warehouseToDelete) {
      try {
        await deleteWarehouse(warehouseToDelete.id);
        setDeleteDialogOpen(false);
        setWarehouseToDelete(null);
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
          <h1 className="text-2xl font-bold text-slate-900">仓库管理</h1>
          <p className="text-slate-500 mt-1">管理仓库信息</p>
        </div>
        <button
          onClick={() => navigate('/warehouses/new')}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增仓库
        </button>
      </div>

      {/* 仓库列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <WarehouseIcon className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">暂无仓库</p>
            <p className="text-sm mt-1">点击上方"新增仓库"按钮添加</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">仓库编码</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">仓库名称</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">仓库地址</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">状态</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{warehouse.code}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{warehouse.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{warehouse.location || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium
                          ${warehouse.status === '启用' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600'
                          }
                        `}>
                          {warehouse.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/warehouses/${warehouse.id}/edit`)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(warehouse)}
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

            {/* 统计信息 */}
            <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-600">
              共 {total} 个仓库
            </div>
          </>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="删除仓库"
        message={`确定要删除仓库"${warehouseToDelete?.name}"吗？此操作不可恢复。`}
        type="danger"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setWarehouseToDelete(null);
        }}
      />
    </div>
  );
}

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  width?: number;
  className?: string;
  render?: (row: T, index: number) => ReactNode;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  emptyDescription?: string;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  emptyText = '暂无数据',
  emptyDescription,
  className = '',
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <svg
          className="w-12 h-12 mb-4 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium">{emptyText}</p>
        {emptyDescription && <p className="text-sm mt-1">{emptyDescription}</p>}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-full inline-block align-middle">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-slate-900 whitespace-nowrap ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className="hover:bg-slate-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-slate-900 ${
                      col.className || ''
                    }`}
                  >
                    {col.render
                      ? col.render(row, index)
                      : row[col.key]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface MobileCardProps<T> {
  data: T;
  columns: Column<T>[];
  onClick?: () => void;
  renderActions?: (row: T) => ReactNode;
}

export function MobileCard<T extends Record<string, any>>({
  data,
  columns,
  onClick,
  renderActions,
}: MobileCardProps<T>) {
  const visibleColumns = columns.filter(
    (col) => !col.key.includes('action') && col.key !== 'actions' && !col.key.includes('操作')
  );

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {visibleColumns.slice(0, 3).map((col) => (
        <div key={col.key} className="flex justify-between items-start">
          <span className="text-xs text-slate-500">{col.header}</span>
          <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">
            {col.render
              ? col.render(data, 0)
              : data[col.key]?.toString() || '-'}
          </span>
        </div>
      ))}
      
      {visibleColumns.length > 3 && (
        <div className="pt-2 border-t border-slate-100">
          {visibleColumns.slice(3).map((col) => (
            <div key={col.key} className="flex justify-between items-start mt-2">
              <span className="text-xs text-slate-500">{col.header}</span>
              <span className="text-sm text-slate-700 text-right max-w-[60%]">
                {col.render
                  ? col.render(data, 0)
                  : data[col.key]?.toString() || '-'}
              </span>
            </div>
          ))}
        </div>
      )}

      {renderActions && (
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          {renderActions(data)}
        </div>
      )}
    </div>
  );
}

interface MobileListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

export function MobileList<T>({
  items,
  renderItem,
  loading,
  emptyText = '暂无数据',
  className = '',
}: MobileListProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <p className="text-lg font-medium">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}

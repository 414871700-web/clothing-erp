import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 sm:py-4">
      {/* 左侧：统计信息 */}
      <div className="text-xs sm:text-sm text-slate-600 order-2 sm:order-1">
        <span className="hidden sm:inline">
          显示第 <span className="font-medium">{startItem}</span> 到{' '}
          <span className="font-medium">{endItem}</span> 条，共{' '}
          <span className="font-medium">{total}</span> 条
        </span>
        <span className="sm:hidden">
          {startItem}-{endItem} / {total}
        </span>
      </div>

      {/* 中间：分页控制 */}
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        {/* 上一页 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-600
            hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 页码 */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`min-w-[40px] h-10 sm:min-w-[36px] sm:h-9 px-2 sm:px-3 rounded-lg text-sm font-medium transition-colors touch-manipulation
                ${page === currentPage
                  ? 'bg-blue-600 text-white shadow-md'
                  : page === '...'
                  ? 'text-slate-400 cursor-default bg-transparent border-0'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        {/* 下一页 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-600
            hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors touch-manipulation"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 右侧：每页条数 */}
      {onPageSizeChange && (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 order-3">
          <span className="hidden sm:inline">每页</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1.5 sm:px-2 sm:py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation text-base sm:text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline">条</span>
        </div>
      )}
    </div>
  );
}

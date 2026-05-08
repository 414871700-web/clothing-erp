import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  formatter?: (value: any, row: any) => string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: any[];
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export function exportToExcel(options: ExportOptions) {
  const { filename, sheetName = 'Sheet1', columns, data, dateRange } = options;

  const processedData = data.map(row => {
    const newRow: Record<string, any> = {};
    columns.forEach(col => {
      const value = row[col.key];
      newRow[col.header] = col.formatter ? col.formatter(value, row) : value;
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(processedData);

  worksheet['!cols'] = columns.map(col => ({
    wch: col.width || 15
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  let finalFilename = filename;
  if (dateRange?.startDate || dateRange?.endDate) {
    const dateStr = [];
    if (dateRange.startDate) dateStr.push(dateRange.startDate);
    if (dateRange.endDate) dateStr.push(dateRange.endDate);
    finalFilename = `${filename}_${dateStr.join('_')}`;
  }

  finalFilename = `${finalFilename}_${formatDate(new Date())}.xlsx`;

  XLSX.writeFile(workbook, finalFilename);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '¥0.00';
  return `¥${num.toFixed(2)}`;
};

export const formatQuantity = (value: number | string): string => {
  const num = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(num)) return '0';
  return num.toString();
};

export const formatDateTime = (value: string): string => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateOnly = (value: string): string => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('zh-CN');
};

export const formatStatus = (value: string): string => {
  const statusMap: Record<string, string> = {
    'active': '启用',
    'inactive': '停用',
    '上架': '上架',
    '下架': '下架',
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'cancelled': '已取消',
  };
  return statusMap[value] || value;
};

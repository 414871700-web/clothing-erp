import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Package } from 'lucide-react';
import { financeReportApi } from '@/lib/finance';
import type { FinanceReport } from '@/types';

export function FinanceReportView() {
  const [report, setReport] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await financeReportApi.getReport({});
      setReport(data);
    } catch (error) {
      console.error('获取报表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <BarChart3 className="w-12 h-12 mb-4 text-slate-300" />
        <p className="text-lg font-medium">暂无数据</p>
      </div>
    );
  }

  const stats = [
    {
      label: '销售收入',
      value: report.totalSalesRevenue,
      icon: TrendingUp,
      color: 'blue',
      prefix: '¥',
    },
    {
      label: '生产成本',
      value: report.totalProductionCost,
      icon: Package,
      color: 'orange',
      prefix: '¥',
    },
    {
      label: '运营支出',
      value: report.totalExpenses,
      icon: TrendingDown,
      color: 'red',
      prefix: '¥',
    },
    {
      label: '净利润',
      value: report.profit,
      icon: report.profit >= 0 ? DollarSign : TrendingDown,
      color: report.profit >= 0 ? 'green' : 'red',
      prefix: '¥',
    },
    {
      label: '应收账款',
      value: report.totalReceivable,
      icon: Users,
      color: 'purple',
      prefix: '¥',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">财务报表</h1>
        <p className="text-slate-500 mt-1">查看财务概况</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            red: 'bg-red-50 text-red-600',
            orange: 'bg-orange-50 text-orange-600',
            purple: 'bg-purple-50 text-purple-600',
          };

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${
                  stat.color === 'green' ? 'text-green-600' : 
                  stat.color === 'red' ? 'text-red-600' : 
                  'text-slate-900'
                }`}>
                  {stat.prefix}{Math.abs(stat.value).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 销售订单统计 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">销售订单统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">订单总数</p>
            <p className="text-2xl font-bold text-slate-900">{report.salesOrdersCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">已收款</p>
            <p className="text-2xl font-bold text-green-600">¥{report.paidAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">未收款</p>
            <p className="text-2xl font-bold text-red-600">¥{report.unpaidAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 利润分析 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">利润分析</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">销售收入</span>
            <span className="font-semibold text-blue-600">¥{report.totalSalesRevenue.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">生产成本</span>
            <span className="font-semibold text-orange-600">-¥{report.totalProductionCost.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">运营支出</span>
            <span className="font-semibold text-red-600">-¥{report.totalExpenses.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-slate-900">净利润</span>
            <span className={`text-lg font-bold ${
              report.profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {report.profit >= 0 ? '+' : '-'}¥{Math.abs(report.profit).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 利润率 */}
      {report.totalSalesRevenue > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">利润率</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, (report.profit / report.totalSalesRevenue) * 100))}%` }}
                ></div>
              </div>
            </div>
            <span className={`text-2xl font-bold ${
              report.profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {((report.profit / report.totalSalesRevenue) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

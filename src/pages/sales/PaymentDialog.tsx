import { useState } from 'react';
import { X } from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import type { SalesOrder } from '@/types';

interface PaymentDialogProps {
  isOpen: boolean;
  order: SalesOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: '现金', label: '现金' },
  { value: '银行转账', label: '银行转账' },
  { value: '微信', label: '微信' },
  { value: '支付宝', label: '支付宝' },
  { value: '其他', label: '其他' },
];

export function PaymentDialog({ isOpen, order, onClose, onSuccess }: PaymentDialogProps) {
  const { submitting, createPayment } = usePaymentStore();

  const [amount, setAmount] = useState(order?.unpaid_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState<'现金' | '银行转账' | '微信' | '支付宝' | '其他'>('现金');
  const [remark, setRemark] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      alert('请输入正确的付款金额');
      return;
    }

    if (amount > order.unpaid_amount) {
      alert('付款金额不能超过未付金额');
      return;
    }

    try {
      await createPayment({
        sales_order_id: order.id,
        payment_method: paymentMethod,
        amount: amount,
        remark: remark || null,
      });

      onSuccess();
    } catch (error) {
      console.error('收款失败:', error);
      alert('收款失败，请重试');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 对话框 */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* 标题 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">收款</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 订单信息 */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">订单号</span>
              <span className="font-medium text-slate-900">{order.order_no}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">订单金额</span>
              <span className="font-medium text-slate-900">¥{order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">已付金额</span>
              <span className="font-medium text-green-600">¥{order.paid_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">未付金额</span>
              <span className="font-medium text-red-600">¥{order.unpaid_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* 付款金额 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              付款金额 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
              <input
                type="number"
                min="0.01"
                max={order.unpaid_amount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 付款方式 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              付款方式 <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入备注信息（可选）"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '处理中...' : '确认收款'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* 对话框 - 移动端底部弹出，桌面端居中 */}
      <div className="relative bg-white sm:rounded-xl shadow-2xl w-full sm:max-w-md animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 sm:animate-in">
        {/* 关闭按钮 */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-6">
          {/* 图标和标题 */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5">
                {title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* 按钮 - 移动端全宽按钮 */}
          <div className="flex flex-col sm:flex-row-reverse justify-end gap-2 sm:gap-3">
            <button
              onClick={onConfirm}
              className={`w-full sm:w-auto px-6 py-3 sm:py-2 rounded-lg text-white font-medium ${styles.button} transition-colors touch-manipulation`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-lg border border-slate-200 text-slate-700 font-medium
                hover:bg-slate-50 transition-colors touch-manipulation"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

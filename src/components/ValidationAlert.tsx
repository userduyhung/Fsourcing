import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationAlertProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  messages: string[];
  onClose?: () => void;
  className?: string;
}

const ValidationAlert: React.FC<ValidationAlertProps> = ({
  type,
  title,
  messages,
  onClose,
  className = ''
}) => {
  if (messages.length === 0) return null;

  const config = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      icon: XCircle,
      defaultTitle: 'Lỗi'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      icon: AlertTriangle,
      defaultTitle: 'Cảnh báo'
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      icon: CheckCircle,
      defaultTitle: 'Thành công'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: AlertCircle,
      defaultTitle: 'Thông tin'
    }
  };

  const { bgColor, borderColor, textColor, iconColor, icon: Icon, defaultTitle } = config[type];

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex gap-3">
        <Icon className={`${iconColor} h-5 w-5 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h3 className={`${textColor} font-semibold mb-2`}>
              {title || defaultTitle}
            </h3>
          )}
          {messages.length === 1 ? (
            <p className={`${textColor} text-sm`}>{messages[0]}</p>
          ) : (
            <ul className={`${textColor} text-sm list-disc list-inside space-y-1`}>
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${textColor} hover:opacity-70 transition-opacity`}
            aria-label="Đóng"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ValidationAlert;

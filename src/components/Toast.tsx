import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  index?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 5000,
  onClose,
  index = 0
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(true);

  useEffect(() => {
    // Don't auto-close loading toasts
    if (type === 'loading') return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, type]);
  
  useEffect(() => {
    // Remove bounce after animation completes
    const bounceTimer = setTimeout(() => {
      setShouldBounce(false);
    }, 600);
    return () => clearTimeout(bounceTimer);
  }, []);

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
    loading: <Loader2 className="w-6 h-6 animate-spin" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    loading: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    loading: 'text-blue-500'
  };

  const topOffset = 16 + (index * 80); // 16px base + 80px per toast
  
  return (
    <div 
      className={`fixed right-4 z-50 transition-all duration-300 ${
        shouldBounce ? 'animate-bounce-in' : ''
      } ${
        isExiting ? 'animate-slide-out-right opacity-0' : ''
      }`}
      style={{ top: `${topOffset}px` }}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-md ${colors[type]}`}>
        <div className={iconColors[type]}>
          {icons[type]}
        </div>
        <p className="flex-1 text-sm font-medium font-sans">{message}</p>
        {type !== 'loading' && (
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;

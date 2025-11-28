import React, { useEffect, useState } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastEventDetail {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

const ToastListener: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastEventDetail;
      if (!detail) return;
      
      const newToast: ToastItem = {
        id: Date.now() + Math.random(), // Unique ID
        message: detail.message || '',
        type: (detail.type as ToastType) || 'info',
        duration: detail.duration ?? 3000
      };
      
      setToasts(prev => [...prev, newToast]);
    };
    window.addEventListener('app:toast', handler as EventListener);
    return () => window.removeEventListener('app:toast', handler as EventListener);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          index={index}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastListener;

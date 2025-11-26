import { useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export const useApiToast = () => {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'info' });
  };

  const showLoading = (message: string = 'Đang xử lý...') => {
    showToast(message, 'loading');
  };

  const showSuccess = (message: string) => {
    showToast(message, 'success');
  };

  const showError = (message: string) => {
    showToast(message, 'error');
  };

  return {
    toast,
    showToast,
    hideToast,
    showLoading,
    showSuccess,
    showError
  };
};

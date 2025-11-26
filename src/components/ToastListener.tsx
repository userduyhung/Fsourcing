import React, { useEffect, useState } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastEventDetail {
  message: string;
  type?: ToastType;
  duration?: number;
}

const ToastListener: React.FC = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastEventDetail;
      if (!detail) return;
      setMessage(detail.message || '');
      setType((detail.type as ToastType) || 'info');
      setDuration(detail.duration ?? 3000);
      setShow(true);
    };
    window.addEventListener('app:toast', handler as EventListener);
    return () => window.removeEventListener('app:toast', handler as EventListener);
  }, []);

  if (!show) return null;

  return (
    <Toast
      message={message}
      type={type}
      duration={duration}
      onClose={() => setShow(false)}
    />
  );
};

export default ToastListener;

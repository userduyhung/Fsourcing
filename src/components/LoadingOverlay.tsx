import React, { useEffect, useState } from 'react';
import { loader } from '../services/loaderService';

const LoadingOverlay: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail || { loading: false };
      setLoading(!!detail.loading);
    };

    window.addEventListener(loader.EVENT_NAME, handler as EventListener);
    // ensure initial state
    setLoading(loader.isLoading());

    return () => {
      window.removeEventListener(loader.EVENT_NAME, handler as EventListener);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm">
      <div className="inline-flex items-center space-x-3 bg-white/95 px-6 py-4 rounded-lg shadow-lg border border-gray-200">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-gray-800 font-medium">Đang tải...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

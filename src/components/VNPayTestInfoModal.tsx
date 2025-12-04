import React, { useEffect, useState } from 'react';
import showAppToast from '../utils/toast';

interface VNPayTestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  countdownSeconds?: number;
}

const VNPayTestInfoModal: React.FC<VNPayTestInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinue,
  countdownSeconds = 10
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(countdownSeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdownSeconds, onContinue]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showAppToast(`✅ Đã sao chép ${label}`, 'success', 1500);
    }).catch(() => {
      showAppToast(`❌ Không thể sao chép ${label}`, 'error', 1500);
    });
  };

  if (!isOpen) return null;

  const testData = [
    { label: 'Ngân hàng', value: 'NCB', icon: '🏦' },
    { label: 'Số thẻ', value: '9704198526191432198', icon: '💳' },
    { label: 'Tên chủ thẻ', value: 'NGUYEN VAN A', icon: '👤' },
    { label: 'Ngày phát hành', value: '07/15', icon: '📅' },
    { label: 'Mật khẩu OTP', value: '123456', icon: '🔐' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🧪 Thông tin thẻ Test</h2>
              <p className="text-blue-100 text-sm mt-1">Môi trường Sandbox - VNPay</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 font-medium">
                  Sử dụng thông tin dưới đây để thanh toán thử nghiệm
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {testData.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                    <div className="text-sm font-mono font-semibold text-gray-900 mt-1 select-all">
                      {item.value}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className="ml-2 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Sao chép"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="flex-1">
                Bạn sẽ được chuyển đến trang thanh toán VNPay sau <strong className="text-blue-900 text-lg">{countdown}</strong> giây
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>Tiếp tục ({countdown}s)</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VNPayTestInfoModal;

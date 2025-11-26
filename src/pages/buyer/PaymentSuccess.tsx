import React from 'react';
import { Link } from 'react-router-dom';

interface PaymentSuccessProps {
  orderId?: string;
  amount?: number;
  transactionId?: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderId, amount, transactionId }) => {  return (
    <div className="bg-app min-h-screen font-sans flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
        <img src="/success.svg" alt="Thanh toán thành công" className="mx-auto mb-6 w-20 h-20" />
        <h2 className="text-2xl font-bold text-green-600 mb-4">Thanh toán thành công!</h2>
        <p className="text-gray-700 mb-4">Cảm ơn bạn đã mua hàng tại Fsourcing.<br />Đơn hàng của bạn sẽ được xử lý và giao trong thời gian sớm nhất.</p>
        {orderId ? (
          <Link
            to={`/buyer/order-detail/${orderId}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Xem đơn hàng
          </Link>
        ) : (
          <span className="inline-block bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed">Không tìm thấy đơn hàng</span>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;

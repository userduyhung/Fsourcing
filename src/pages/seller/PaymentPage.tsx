import React, { useState } from 'react';

const mockQRUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FSourcing-Premium-Payment';

const PaymentPage: React.FC = () => {
  const [isPaid, setIsPaid] = useState(false);

  const handlePayment = () => {
    setIsPaid(true);
  };

  return (
    <div className="bg-app min-h-screen font-sans flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Nâng cấp Premium</h2>
        <p className="mb-4 text-center">Quét mã QR để thanh toán phí nâng cấp Premium cho tài khoản của bạn.</p>
        <div className="flex justify-center mb-6">
          <img src={mockQRUrl} alt="QR thanh toán" className="w-40 h-40 border" />
        </div>
        {!isPaid ? (
          <button
            className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
            onClick={handlePayment}
          >
            Xác nhận đã thanh toán
          </button>
        ) : (
          <div className="text-green-600 font-bold text-center mt-4">Thanh toán thành công! Tài khoản của bạn đã được nâng cấp Premium.</div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

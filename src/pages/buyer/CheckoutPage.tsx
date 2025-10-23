  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
import React, { useState } from 'react';
import { CartItem } from '../../types';
import QRCode from 'react-qr-code';

interface CheckoutPageProps {
  cart: CartItem[];
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart }) => {

  const [address, setAddress] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [loadingRef, setLoadingRef] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Early return for empty cart
  if (cart.length === 0) {
    return (
      <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn đang trống.</h2>
        </div>
      </div>
    );
  }

  if (showPayment) {
    // Show loading while requesting payment reference
    if (loadingRef) {
      return (
        <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đang tạo mã thanh toán...</h2>
          </div>
        </div>
      );
    }
    // Show error if failed to get payment reference
    if (refError) {
      return (
        <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi tạo mã thanh toán</h2>
            <p className="text-gray-700 mb-4">{refError}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold" onClick={() => { setShowPayment(false); setRefError(null); }}>
              Thử lại
            </button>
          </div>
        </div>
      );
    }
    // Show payment UI with QR code if reference is available
    return (
      <div className="bg-[#f8ecd7] min-h-screen font-sans">
        <main className="flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl mx-auto mt-10 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Thông tin đơn hàng</h2>
              <ul className="mb-4">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-base">{item.name}</span>
                    <span className="ml-auto text-blue-600 font-semibold">{item.price} đ</span>
                    <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="font-bold text-lg mb-2">Tổng cộng: <span className="text-blue-600">{total} đ</span></div>
              <div className="mb-2">Địa chỉ giao hàng: <span className="font-medium">{address}</span></div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-4">Quét mã QR để thanh toán</h2>
              {paymentRef && <QRCode value={paymentRef} size={200} />}
              <div className="mt-4 text-gray-500 text-sm">Vui lòng quét mã QR bằng ứng dụng ngân hàng để hoàn tất thanh toán.</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans">
      {/* <header className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <img src="/logo192.png" alt="Fsourcing" className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold text-gray-900">Fsourcing</span>
        </div>
      </header> */}
      <main className="flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-auto mt-10 relative">
          <h2 className="text-2xl font-bold mb-4">Xác nhận đơn hàng</h2>
          <ul className="mb-4">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3 mb-2">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded" />
                <span className="font-medium text-base">{item.name}</span>
                <span className="ml-auto text-blue-600 font-semibold">{item.price} đ</span>
                <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center font-bold text-lg mb-4">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{total} đ</span>
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block font-medium mb-2">Địa chỉ giao hàng</label>
            <input
              id="address"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ giao hàng..."
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base"
            onClick={async () => {
              setShowPayment(true);
              setLoadingRef(true);
              setRefError(null);
              try {
                // Call backend API to create payment reference
                const response = await fetch('/api/create-payment-ref', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    cart,
                    address,
                    total
                  })
                });
                if (!response.ok) throw new Error('Không thể tạo mã thanh toán.');
                const data = await response.json();
                if (!data.reference) throw new Error('Phản hồi không hợp lệ từ máy chủ.');
                setPaymentRef(data.reference);
                setLoadingRef(false);
              } catch (err: any) {
                setRefError(err.message || 'Đã xảy ra lỗi.');
                setLoadingRef(false);
              }
            }}
          >
            Xác nhận đặt hàng
          </button>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

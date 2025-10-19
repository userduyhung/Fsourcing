import React, { useState } from 'react';
import { CartItem } from '../App';
import QRCode from 'react-qr-code';

interface CheckoutPageProps {
  cart: CartItem[];
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart }) => {
  const [address, setAddress] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (showPayment) {
    return (
      <div className="bg-[#f8ecd7] min-h-screen">
        {/* <header className="bg-white border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
            <img src="/logo192.png" alt="Fsourcing" className="h-8 w-8" />
            <span className="ml-2 text-xl font-bold text-gray-900">Fsourcing</span>
          </div>
        </header> */}
        <main className="flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl mx-auto mt-10 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
              <ul className="mb-4">
                {cart.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-auto text-blue-600">{item.price} đ</span>
                    <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="font-bold text-lg mb-2">Tổng cộng: <span className="text-blue-600">{total} đ</span></div>
              <div className="mb-2">Địa chỉ giao hàng: <span className="font-medium">{address}</span></div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold mb-4">Quét mã QR để thanh toán</h2>
              <QRCode value={`Thanh toán đơn hàng ${total} đ cho địa chỉ: ${address}`} size={200} />
              <div className="mt-4 text-gray-500 text-sm">Vui lòng quét mã QR bằng app ngân hàng để hoàn tất thanh toán.</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f8ecd7] min-h-screen">
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <img src="/logo192.png" alt="Fsourcing" className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold text-gray-900">Fsourcing</span>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto mt-10 relative">
          <h2 className="text-xl font-bold mb-4">Xác nhận đơn hàng</h2>
          <ul className="mb-4">
            {cart.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 mb-2">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded" />
                <span className="font-medium">{item.name}</span>
                <span className="ml-auto text-blue-600">{item.price} đ</span>
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
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold" onClick={() => setShowPayment(true)}>
            Xác nhận đặt hàng
          </button>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

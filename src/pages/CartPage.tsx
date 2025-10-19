import React from 'react';
import { CartItem } from '../App';

interface CartPageProps {
  cart: CartItem[];
}

const CartPage: React.FC<CartPageProps> = ({ cart }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className="bg-[#f8ecd7] min-h-screen">
      <header className="bg-white border-b border-gray-200 mb-8">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <img src="/logo192.png" alt="Fsourcing" className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold text-gray-900">Fsourcing</span>
        </div> */}
      </header>
      <main className="flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto mt-20 relative">
          <h2 className="text-xl font-bold mb-4">Giỏ hàng của bạn</h2>
          {cart.length === 0 ? (
            <div className="text-gray-500">Chưa có sản phẩm nào trong giỏ hàng.</div>
          ) : (
            <>
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
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
                onClick={() => window.location.href = '/checkout'}
              >Thanh toán</button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CartPage;

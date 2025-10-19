import React from 'react';
import { CartItem } from '../App';

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ cart, onClose }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Giỏ hàng của bạn</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500">Chưa có sản phẩm nào trong giỏ hàng.</div>
        ) : (
          <ul className="divide-y divide-gray-200 mb-4">
            {cart.map((item) => (
              <li key={item.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />}
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-blue-600">{item.price.toLocaleString()} ₫</span>
              </li>
            ))}
          </ul>
        )}
        <div className="font-bold text-right mb-2">Tổng cộng: <span className="text-blue-600">{total.toLocaleString()} ₫</span></div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Thanh toán</button>
      </div>
    </div>
  );
};

export default CartModal;

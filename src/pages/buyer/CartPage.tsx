  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../../types';

interface CartPageProps {
  cart: CartItem[];
}

const CartPage: React.FC<CartPageProps> = ({ cart }) => {
  const navigate = useNavigate();
  const [cartState, setCartState] = React.useState<CartItem[]>(cart);
  const total = cartState.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    navigate('/buyer/checkout');
  };

  const handleRemove = (id: string) => {
    setCartState(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans">
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-2xl mx-auto mt-10 relative">
          <h2 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h2>
          {cartState.length === 0 ? (
            <div className="text-gray-500">Chưa có sản phẩm nào trong giỏ hàng.</div>
          ) : (
            <>
              <ul className="mb-6">
                {cartState.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 mb-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded" />
                    <span className="font-medium text-base">{item.name}</span>
                    <span className="ml-auto text-blue-600 font-semibold">{item.price} đ</span>
                    <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                    <button
                      className="ml-4 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                      onClick={() => handleRemove(item.id)}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center font-bold text-lg mb-6">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{total} đ</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base"
                onClick={handleCheckout}
              >
                Thanh toán
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CartPage;

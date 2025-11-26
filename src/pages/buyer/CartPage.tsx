import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../../types';
import { updateCartItem, deleteCartItem, getCart } from '../../services/cartService';
import { sanitizeCartItems } from '../../utils/cartValidation';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartState, setCartState] = useState<CartItem[]>([]);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const stored = await getCart();
        if (!mounted) return;
        setCartState(sanitizeCartItems(stored.items as any));
      } catch (e) {
        console.error('Failed to load cart from storage', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const refreshFromStorage = async () => {
    try {
      const stored = await getCart();
      console.log('🔍 Raw cart from storage:', stored);
      console.log('🔍 Cart items:', stored.items);
      const sanitized = sanitizeCartItems(stored.items as any);
      console.log('🔍 Sanitized cart items:', sanitized);
      setCartState(sanitized);
    } catch (e) {
      console.error('Failed to refresh cart from storage', e);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingIds((s) => (s.includes(id) ? s : [...s, id]));
    try {
      await updateCartItem(id, quantity);
      await refreshFromStorage();
    } catch (err) {
      console.error('Failed to update cart item:', err);
    } finally {
      setUpdatingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleRemove = async (id: string) => {
    setUpdatingIds((s) => (s.includes(id) ? s : [...s, id]));
    try {
      await deleteCartItem(id);
      await refreshFromStorage();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    } finally {
      setUpdatingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const total = cartState.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-semibold mb-4">Giỏ hàng</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded shadow-sm">
          {cartState.length === 0 ? (
            <div className="text-center py-12 text-gray-600">Giỏ hàng trống</div>
          ) : (
            <ul className="space-y-4">
              {cartState.map((item) => {
                const isUpdating = updatingIds.includes(item.id);
                return (
                  <li key={item.id} className="flex gap-4 items-start">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(Number(item.price) || 0)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-700">{formatCurrency((Number(item.price) || 0) * item.quantity)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className={`flex items-center border rounded-md overflow-hidden ${isUpdating ? 'opacity-60' : ''}`}>
                          <button
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Giảm số lượng"
                            disabled={isUpdating}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                            className="w-16 text-center px-2 py-1 outline-none no-spin"
                            disabled={isUpdating}
                          />
                          <button
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Tăng số lượng"
                            disabled={isUpdating}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded hover:bg-red-100 disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="bg-white p-4 rounded shadow-sm">
          <div className="text-lg font-medium">Tổng</div>
          <div className="text-2xl font-bold my-3">{formatCurrency(total)}</div>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            onClick={() => navigate('/buyer/checkout')}
            disabled={cartState.length === 0}
          >
            Xác nhận đặt hàng
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
 

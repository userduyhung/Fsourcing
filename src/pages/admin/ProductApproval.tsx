import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  approved: boolean;
}

const ProductApproval: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // WARNING: localStorage is for demo only. Use backend API in production!
    const saved = localStorage.getItem('sellerProducts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setProducts(parsed);
        } else {
          logger.error('ProductApproval', 'parsed sellerProducts is not an array', { type: typeof parsed });
          setProducts([]);
        }
      } catch (err) {
        logger.error('ProductApproval', 'error parsing sellerProducts from localStorage', err);
        setProducts([]);
      }
    } else {
      setProducts([]);
    }

    // Example for production: fetch from backend
    // (async () => {
    //   try {
    //     const res = await fetch('/api/admin/pending-products', { credentials: 'include' });
    //     if (!res.ok) throw new Error('Network error');
    //     const data = await res.json();
    //     if (Array.isArray(data)) setProducts(data);
    //     else throw new Error('Invalid response');
    //   } catch (err) {
    //     console.error('Failed to fetch products:', err);
    //     setProducts([]);
    //   }
    // })();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      logger.debug('ProductApproval', 'approving product', { productId: id });
      const res = await fetch(`/api/admin/products/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        logger.error('ProductApproval', 'approval API failed', { productId: id, status: res.status });
        throw new Error('Không thể duyệt sản phẩm.');
      }
      // Only update state if backend succeeded
      const updated = products.map(p =>
        p.id === id ? { ...p, approved: true } : p
      );
      setProducts(updated);
      logger.info('ProductApproval', 'product approved successfully', { productId: id });
    } catch (err) {
      logger.error('ProductApproval', 'error approving product', { productId: id, error: err });
      alert('❌ Duyệt sản phẩm thất bại. Vui lòng thử lại hoặc kiểm tra kết nối.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Duyệt sản phẩm Seller đăng</h2>
        {products.length === 0 ? (
          <div className="text-center text-gray-500">Không có sản phẩm nào cần duyệt.</div>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3">Ảnh</th>
                <th className="py-2 px-3">Tên sản phẩm</th>
                <th className="py-2 px-3">Giá</th>
                <th className="py-2 px-3">Seller</th>
                <th className="py-2 px-3">Trạng thái</th>
                <th className="py-2 px-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b">
                  <td className="py-2 px-3">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  </td>
                  <td className="py-2 px-3 font-medium">{product.name}</td>
                  <td className="py-2 px-3 text-blue-600 font-semibold">{product.price} đ</td>
                  <td className="py-2 px-3">{product.seller}</td>
                  <td className="py-2 px-3">
                    {product.approved ? (
                      <span className="text-green-600 font-bold">Đã duyệt</span>
                    ) : (
                      <span className="text-yellow-600 font-bold">Chờ duyệt</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {!product.approved && (
                      <button
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                        onClick={() => handleApprove(product.id)}
                      >
                        Duyệt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductApproval;

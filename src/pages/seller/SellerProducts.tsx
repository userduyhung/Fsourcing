import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface Product {
  id: string | number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  status: string;
  description: string;
}

const SellerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to fetch products from backend (server-only). Show error UI on failure.
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const resp = await apiClient.productsApi.list();
        const items = Array.isArray(resp) ? resp : (resp?.data || resp?.items || []);
        if (mounted) setProducts(items);
      } catch (err: any) {
        console.error('Failed to fetch products from API', err);
        if (mounted) setErrorMsg('Không thể tải sản phẩm — lỗi mạng hoặc máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();

    // Listen for product updates from other pages (add/edit/delete)
    const onProductsUpdated = (e: Event) => {
      fetchProducts();
    };
    window.addEventListener('sellerProductsUpdated', onProductsUpdated as EventListener);
    // Track whether seller profile is completed (keep this logic)
    try {
      const sp = localStorage.getItem('sellerProfile');
      const parsed = sp ? JSON.parse(sp) : null;
      const completed = !!(parsed && (parsed.company || parsed.fullName));
      localStorage.setItem('sellerProfileCompleted', completed ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('sellerProfileCompleted', { detail: { completed } }));
      console.log('Seller profile completed:', completed);
    } catch (e) {
      localStorage.setItem('sellerProfileCompleted', 'false');
    }

    return () => {
      mounted = false;
      window.removeEventListener('sellerProductsUpdated', onProductsUpdated as EventListener);
    };
  }, []);

  const confirmDelete = (id: string | number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      // call API to delete
      await apiClient.request('delete', `/products/${deleteId}`);
      // on success remove from UI
      setProducts(prev => prev.filter(p => p.id !== deleteId));
      try {
        window.dispatchEvent(new CustomEvent('sellerProductsUpdated', { detail: { deletedId: deleteId } }));
      } catch (e) {
        window.dispatchEvent(new Event('sellerProductsUpdated'));
      }
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete product via API', err);
      setErrorMsg('Xóa sản phẩm thất bại — kiểm tra kết nối hoặc quyền hạn và thử lại.');
      // keep modal open so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-app min-h-screen font-sans py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm của bạn</h2>
          <button onClick={() => navigate('/seller/add-product')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Thêm sản phẩm</button>
        </div>
        {loading && (
          <div className="mb-4 text-sm text-gray-600">Đang tải sản phẩm...</div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center justify-between gap-4">
              <div className="text-red-700 text-sm">{errorMsg}</div>
              <div className="flex gap-2">
                <button onClick={() => { setErrorMsg(null); window.dispatchEvent(new Event('sellerProductsUpdated')); }} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Thử lại</button>
                <button onClick={() => setErrorMsg(null)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">Đóng</button>
              </div>
            </div>
          </div>
        )}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Hình ảnh</th>
              <th className="p-3 text-left">Tên sản phẩm</th>
              <th className="p-3 text-left">Số lượng</th>
              <th className="p-3 text-left">Giá tiền</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 cursor-pointer" onClick={() => navigate('/seller/add-product')}>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Bạn chưa có sản phẩm nào</h3>
                    <p className="text-sm text-gray-500 mb-4">Nhấn vào đây để tạo sản phẩm đầu tiên và bắt đầu bán hàng.</p>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); navigate('/seller/add-product'); }} className="bg-green-600 text-white px-4 py-2 rounded">Thêm sản phẩm</button>
                      <button onClick={(e) => { e.stopPropagation(); navigate('/seller/profile'); }} className="bg-blue-600 text-white px-4 py-2 rounded">Hoàn thiện hồ sơ</button>
                      <button onClick={(e) => { e.stopPropagation(); navigate('/seller/orders'); }} className="bg-orange-600 text-white px-4 py-2 rounded">Xem đơn hàng</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Bạn luôn có thể quản lý sản phẩm và đơn hàng từ trang này.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="border-b">
                  <td className="p-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                      crossOrigin="anonymous"
                      onError={e => {
                        if (!e.currentTarget.dataset.fallback) {
                          e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image';
                          e.currentTarget.dataset.fallback = 'true';
                        }
                      }}
                      loading="lazy"
                      style={{ background: '#f3f3f3' }}
                    />
                  </td>
                  <td className="p-3 font-semibold">{product.name}</td>
                  <td className="p-3">{product.quantity}</td>
                  <td className="p-3 text-blue-600 font-bold">{(Number(product.price) || 0).toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{product.status === 'active' ? 'Đang bán' : 'Ẩn'}</span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link to={`/seller/edit-product/${product.id}`} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-xs">Sửa</Link>
                    <button onClick={() => confirmDelete(product.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">Bạn có chắc muốn xóa sản phẩm này?</h3>
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400"
                onClick={() => { setShowDeleteModal(false); setDeleteId(null); }}
              >Hủy</button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600"
                onClick={handleDelete}
              >Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  status: string;
  description: string;
}

const SellerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    // Lấy sản phẩm của seller từ localStorage
    const stored = localStorage.getItem('sellerProducts');
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      // Tạo dữ liệu demo nếu chưa có
      const demoProducts: Product[] = [
        {
          id: 1,
          name: 'Điện thoại X1',
          image: 'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_165bc2055e.png',
          quantity: 100,
          price: 199000,
          status: 'active',
          description: 'Điện thoại thông minh X1 với nhiều tính năng nổi bật.'
        },
        {
          id: 2,
          name: 'Tai nghe Bluetooth',
          image: 'https://antien.vn/files/products/photos/2024/03/19/soundPeats-gofree-den.jpg',
          quantity: 200,
          price: 29000,
          status: 'active',
          description: 'Tai nghe Bluetooth chất lượng cao, âm thanh sống động.'
        },
        {
          id: 3,
          name: 'Đồng hồ thông minh',
          image: 'https://phukiendienthoaigiasi.vn/wp-content/uploads/2024/08/dong-ho-thong-minh-dinh-vi-tre-em-Y63-1.jpg',
          quantity: 150,
          price: 49000,
          status: 'inactive',
          description: 'Đồng hồ thông minh dành cho trẻ em, định vị GPS.'
        },
      ];
      setProducts(demoProducts);
      localStorage.setItem('sellerProducts', JSON.stringify(demoProducts));
    }
  }, []);

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    const updated = products.filter(p => p.id !== deleteId);
    setProducts(updated);
    localStorage.setItem('sellerProducts', JSON.stringify(updated));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm của bạn</h2>
          <Link to="/seller/add-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Thêm sản phẩm</Link>
        </div>
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
              <tr><td colSpan={6} className="text-center py-6 text-gray-500">Không có sản phẩm nào.</td></tr>
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
                  <td className="p-3 text-blue-600 font-bold">{product.price.toLocaleString()} đ</td>
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

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string | number;
  name: string;
  price?: number;
  description?: string;
  image?: string;
}

const EditProduct: React.FC<{ productId: string }> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);
    const fetchProduct = async () => {
      try {
        const resp = await apiClient.productsApi.get(String(productId));
        const data = resp?.data ?? resp;
        if (isMounted) {
          if (data) {
            setProduct(data as Product);
            setName(data.name || '');
            setPrice((data.price ?? data.ReferencePrice ?? 0).toString());
            setDescription(data.description || '');
            setImage(data.image || data.imagePath || '');
          } else {
            setProduct(null);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch product', err);
        if (isMounted) setErrorMsg('Không thể tải sản phẩm. Vui lòng thử lại.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setErrorMsg(null);
    try {
      const payload = {
        name,
        description,
        referencePrice: Number(price),
        imagePath: image,
      };
      await apiClient.request('put', `/products/${productId}`, payload);
      alert('Cập nhật sản phẩm thành công!');
      // Refresh list
      window.dispatchEvent(new Event('sellerProductsUpdated'));
      navigate('/seller/products');
    } catch (err: any) {
      console.error('Update product failed', err);
      setErrorMsg('Cập nhật thất bại — kiểm tra kết nối hoặc quyền và thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="bg-app min-h-screen font-sans flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">Đang tải sản phẩm...</div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="bg-app min-h-screen font-sans flex items-center justify-center">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <div className="bg-app min-h-screen font-sans flex items-center justify-center">
      <form className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Chỉnh sửa sản phẩm</h2>
        <div className="mb-4">
          <label className="block font-medium mb-2">Tên sản phẩm</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Giá</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Mô tả</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2">Ảnh sản phẩm (URL)</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={image} onChange={e => setImage(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base">Cập nhật sản phẩm</button>
      </form>
    </div>
  );
};

export default EditProduct;

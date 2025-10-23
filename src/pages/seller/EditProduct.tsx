import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

const EditProduct: React.FC<{ productId: number }> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    try {
      const products: Product[] = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
      const found = products.find(p => p.id === productId);
      if (isMounted) {
        if (found) {
          setProduct(found);
          setName(found.name);
          setPrice(found.price.toString());
          setDescription(found.description);
          setImage(found.image);
        } else {
          setProduct(null);
        }
        setLoading(false);
      }
    } catch (err) {
      if (isMounted) {
        setProduct(null);
        setLoading(false);
      }
    }
    return () => { isMounted = false; };
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const products: Product[] = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    const updated = products.map(p =>
      p.id === productId
        ? { ...p, name, price: Number(price), description, image }
        : p
    );
    localStorage.setItem('sellerProducts', JSON.stringify(updated));
    alert('Cập nhật sản phẩm thành công!');
  };

  if (loading) {
    return (
      <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">Đang tải sản phẩm...</div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
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

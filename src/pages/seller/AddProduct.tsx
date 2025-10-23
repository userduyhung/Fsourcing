import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid'; // Uncomment if uuid is installed

const AddProduct: React.FC = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    // Validate
    if (!name.trim() || !price.trim() || !quantity.trim() || !description.trim() || !image.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin sản phẩm.');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg('Giá sản phẩm phải là số lớn hơn 0.');
      return;
    }
    if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      setErrorMsg('Số lượng phải là số không âm.');
      return;
    }
    // Giả lập lưu sản phẩm mới vào localStorage
    const products = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    const newProduct = {
      // id: uuidv4(), // Use this if uuid is installed
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      price: Number(price),
      quantity: Number(quantity),
      description,
      image,
      status: 'active',
    };
    let success = false;
    try {
      localStorage.setItem('sellerProducts', JSON.stringify([newProduct, ...products]));
      success = true;
    } catch (err: any) {
      // QuotaExceededError detection
      const isQuotaError = err instanceof DOMException && (
        err.name === 'QuotaExceededError' ||
        err.code === 22 ||
        (typeof err.message === 'string' && err.message.includes('QuotaExceeded'))
      );
      if (isQuotaError) {
        // Try to free space by removing oldest product
        try {
          const currentProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
          if (currentProducts.length > 0) {
            currentProducts.pop(); // Remove oldest
            localStorage.setItem('sellerProducts', JSON.stringify(currentProducts));
            // Try again
            localStorage.setItem('sellerProducts', JSON.stringify([newProduct, ...currentProducts]));
            success = true;
          } else {
            // Fallback to sessionStorage
            sessionStorage.setItem('sellerProducts', JSON.stringify([newProduct]));
            success = true;
          }
        } catch (innerErr) {
          console.error('Quota error recovery failed:', innerErr);
          setErrorMsg('Bộ nhớ trình duyệt đã đầy, không thể lưu sản phẩm mới. Vui lòng xóa bớt sản phẩm hoặc thử lại sau.');
        }
      } else {
        setErrorMsg('Đã xảy ra lỗi khi lưu sản phẩm.');
      }
      console.error('Lỗi lưu sản phẩm:', err);
    }
    if (success) {
      setName('');
      setPrice('');
      setQuantity('');
      setDescription('');
      setImage('');
      alert('Thêm sản phẩm thành công!');
      navigate(-1);
    }
  };

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
      <form className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h2>
        {errorMsg && (
          <div className="mb-4 text-red-600 font-semibold text-center">{errorMsg}</div>
        )}
        <div className="mb-4">
          <label className="block font-medium mb-2">Tên sản phẩm</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Giá</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} required min={1} />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Số lượng</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={quantity} onChange={e => setQuantity(e.target.value)} required min={0} />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Mô tả</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
        </div>
        <div className="mb-6">
          <label className="block font-medium mb-2">Ảnh sản phẩm (URL)</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={image} onChange={e => setImage(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base">Thêm sản phẩm</button>
      </form>
    </div>
  );
};

export default AddProduct;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
// import { v4 as uuidv4 } from 'uuid'; // Uncomment if uuid is installed

const AddProduct: React.FC = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!name.trim()) return setErrorMsg('Tên sản phẩm không được để trống.');
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return setErrorMsg('Giá sản phẩm không hợp lệ.');
    if (isNaN(Number(quantity)) || Number(quantity) < 0) return setErrorMsg('Số lượng không hợp lệ.');

    const newProductPayload: any = {
      name: name.trim(),
      price: Number(price),
      quantity: Number(quantity),
      description: description.trim(),
      image: image?.trim() || undefined,
    };

    let created: any = null;

    // If there is a file, upload using FormData
    if (imageFile) {
      try {
        /* API TEMPORARILY DISABLED - USING LOCAL STORAGE ONLY
        const formData = new FormData();
        formData.append('Name', newProductPayload.name);
        formData.append('Description', newProductPayload.description || '');
        formData.append('ReferencePrice', String(newProductPayload.price));
        formData.append('Quantity', String(newProductPayload.quantity));
        if (newProductPayload.category) formData.append('Category', newProductPayload.category);
        formData.append('ImageFile', imageFile, imageFile.name);

        setIsUploading(true);
        setUploadProgress(0);
        const resp = await apiClient.client.post('/Products', formData, {
          onUploadProgress: (progressEvent: any) => {
            try {
              const { loaded, total } = progressEvent;
              if (total && total > 0) {
                const percent = Math.round((loaded / total) * 100);
                setUploadProgress(percent);
              }
            } catch {
              // ignore
            }
          }
        });
        created = resp?.data?.data ?? resp?.data ?? resp;
        */
        
        // Local storage fallback with fake upload
        setIsUploading(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // fake delay
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        await new Promise(resolve => {
            reader.onloadend = () => {
                newProductPayload.image = reader.result as string;
                resolve(null);
            };
        });
        
        const localProducts = localStorage.getItem('sellerProducts');
        const items = localProducts ? JSON.parse(localProducts) : [];
        created = { ...newProductPayload, id: Date.now(), status: 'active' };
        items.push(created);
        localStorage.setItem('sellerProducts', JSON.stringify(items));
        
      } catch (err: any) {
        console.error('FormData upload failed', err);
        setErrorMsg('Tải ảnh thất bại — kiểm tra kết nối hoặc thử lại.');
        return;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // No file: use JSON API create
      try {
        /* API TEMPORARILY DISABLED - USING LOCAL STORAGE ONLY
        created = await apiClient.productsApi.create(newProductPayload);
        */
        
        // Local storage fallback
        const localProducts = localStorage.getItem('sellerProducts');
        const items = localProducts ? JSON.parse(localProducts) : [];
        created = { ...newProductPayload, id: Date.now(), status: 'active' };
        items.push(created);
        localStorage.setItem('sellerProducts', JSON.stringify(items));
        
      } catch (err: any) {
        console.error('API create product failed', err);
        setErrorMsg('Không thể tạo sản phẩm: lỗi máy chủ hoặc mất kết nối. Vui lòng thử lại.');
        return;
      }
    }

    // Notify other parts of the app and navigate to products list
    try {
      window.dispatchEvent(new CustomEvent('sellerProductsUpdated', { detail: { product: created } }));
    } catch (e) {
      window.dispatchEvent(new Event('sellerProductsUpdated'));
    }
    setName('');
    setPrice('');
    setQuantity('');
    setDescription('');
    setImage('');
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    alert('Thêm sản phẩm thành công!');
    navigate('/seller/products');
  };

  return (
    <div className="bg-app min-h-screen font-sans flex items-center justify-center">
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
          <input type="text" className="w-full border rounded px-3 py-2 mb-2" value={image} onChange={e => setImage(e.target.value)} placeholder="Hoặc dán URL ảnh ở đây (không bắt buộc khi upload file)" />
          <div className="text-sm text-gray-600 mb-2">Hoặc upload file ảnh:</div>
          <input type="file" accept="image/*" onChange={e => {
            const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
            setImageFile(f);
            if (f) {
              const url = URL.createObjectURL(f);
              setPreviewUrl(url);
              // clear the text URL field when a file is chosen
              setImage('');
            } else {
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }
            }
          }} />
          {previewUrl && (
            <div className="mt-3">
              <div className="mb-2 font-medium">Xem trước ảnh đã chọn</div>
              <img src={previewUrl} alt="preview" className="w-40 h-40 object-cover rounded border" />
            </div>
          )}
          {isUploading && (
            <div className="mt-3">
              <div className="text-sm mb-1">Đang tải lên: {uploadProgress}%</div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div className="bg-green-500 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base">Thêm sản phẩm</button>
      </form>
    </div>
  );
};

export default AddProduct;

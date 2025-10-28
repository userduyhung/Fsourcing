import React, { useState } from 'react';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName?: string;
  onSubmit: (data: { subject: string; message: string }) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, sellerName, onSubmit }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ subject, message });
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans">Tạo Yêu cầu báo giá (RFQ) cho {sellerName}</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Tiêu đề RFQ</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Nội dung</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Gửi RFQ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;

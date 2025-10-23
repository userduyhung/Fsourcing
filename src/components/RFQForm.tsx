import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface RFQFormProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  onSubmit: (rfq: { subject: string; message: string }) => void;
}

const RFQForm: React.FC<RFQFormProps> = ({ isOpen, onClose, sellerName, onSubmit }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      onSubmit({ subject, message });
      setIsSending(false);
      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 font-sans">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans">Tạo Yêu cầu báo giá (RFQ) cho {sellerName}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Tiêu đề RFQ</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 font-sans"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Nội dung yêu cầu</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 font-sans"
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Nhập nội dung chi tiết..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 font-sans"
            disabled={isSending}
          >
            {isSending ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
          {success && <div className="text-green-600 text-sm mt-2 font-sans">Đã gửi yêu cầu thành công!</div>}
        </form>
      </div>

    </div>
  );
}

export default RFQForm;

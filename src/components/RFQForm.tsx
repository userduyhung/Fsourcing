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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tạo RFQ cho {sellerName}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề RFQ</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              placeholder="Ví dụ: Industrial Machinery Parts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung yêu cầu</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Mô tả chi tiết về sản phẩm, số lượng, yêu cầu kỹ thuật..."
            />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center font-semibold hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Đang gửi...' : 'Gửi RFQ'}
          </button>
          {success && (
            <div className="text-green-600 text-sm text-center mt-2">RFQ đã được gửi thành công!</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RFQForm;

import React, { useState } from 'react';
import { Flag } from 'lucide-react';

interface SellerReportProps {
  sellerId: number;
}

const SellerReport: React.FC<SellerReportProps> = ({ sellerId }) => {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const buyer = localStorage.getItem('userName') || 'Người mua';
    const reports = JSON.parse(localStorage.getItem(`sellerReports_${sellerId}`) || '[]');
    const newReport = { id: Date.now(), user: buyer, reason, detail };
    localStorage.setItem(`sellerReports_${sellerId}`, JSON.stringify([newReport, ...reports]));
    setSuccess(true);
    setReason('');
    setDetail('');
    setTimeout(() => setSuccess(false), 1200);
  };

  return (
    <div className="mb-8 font-sans">
      <h3 className="font-semibold text-gray-800 mb-2 font-sans">Báo cáo Người bán</h3>
      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 font-sans"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Lý do báo cáo..."
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 font-sans"
          rows={2}
          value={detail}
          onChange={e => setDetail(e.target.value)}
          placeholder="Chi tiết báo cáo..."
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center font-sans"
          type="submit"
        >
          <Flag className="w-4 h-4 mr-2" /> Gửi báo cáo
        </button>
        {success && <div className="text-green-600 text-sm mt-2 font-sans">Đã gửi báo cáo!</div>}
      </form>
    </div>
  );
};

export default SellerReport;

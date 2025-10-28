import React from 'react';
import { BadgeCheck, Send, Mail } from 'lucide-react';

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

interface RFQ {
  id: number;
  sellerId: number;
  sellerName: string;
  buyer: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
}

const OrderList: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const rfqs: RFQ[] = JSON.parse(localStorage.getItem('buyerRFQs') || '[]');

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">RFQ đã gửi</h2>
      {rfqs.length === 0 ? (
        <div className="text-gray-500">Bạn chưa gửi RFQ nào.</div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq: any) => (
            <div key={rfq.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-gray-900">{rfq.subject}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[rfq.status as keyof typeof statusColor] || 'bg-gray-100 text-gray-800'}`}>{rfq.status}</span>
              </div>
              <div className="text-gray-700 mb-2">{rfq.message}</div>
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="w-4 h-4 mr-1" /> {rfq.sellerName}
                <span className="mx-2">|</span>
                {new Date(rfq.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;

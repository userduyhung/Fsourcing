import React from 'react';
import { Bell, Mail } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'rfq', message: 'New RFQ response received', seller: 'ABC Manufacturing', time: '2 hours ago' },
  { id: 2, type: 'profile', message: 'Seller profile viewed', seller: 'Tech Solutions Co', time: '4 hours ago' }
];

const Notification: React.FC = () => {
  // Replace with real notification logic
  const notifications = mockNotifications;

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-xs">
      <div className="flex items-center mb-3">
        <Bell className="w-5 h-5 text-blue-600 mr-2" />
        <span className="font-semibold text-gray-900">Thông báo</span>
      </div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className="flex items-center text-sm text-gray-700">
            <Mail className="w-4 h-4 text-green-500 mr-2" />
            <span>{n.message}</span>
            <span className="ml-2 text-gray-400">{n.seller} • {n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;

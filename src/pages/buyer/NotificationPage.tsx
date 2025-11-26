import React, { useEffect, useState } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Giả lập lấy thông báo từ localStorage
    const saved = localStorage.getItem('buyerNotifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="bg-app min-h-screen font-sans">
      <div className="max-w-2xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6">Thông báo của bạn</h2>
        {notifications.length === 0 ? (
          <div className="text-gray-500">Không có thông báo nào.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map(n => (
              <li key={n.id} className={`bg-white rounded-lg shadow p-4 ${n.read ? '' : 'border-l-4 border-blue-600'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-base">{n.title}</span>
                  <span className="text-xs text-gray-400">{n.date}</span>
                </div>
                <div className="text-gray-700 mb-1">{n.message}</div>
                {!n.read && <span className="text-xs text-blue-600 font-semibold">Chưa đọc</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;

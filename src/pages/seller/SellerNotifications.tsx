import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const SellerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'success',
      title: 'Đơn hàng mới',
      message: 'Bạn có đơn hàng mới từ ABC Manufacturing Co. Mã đơn: #12345',
      timestamp: '10 phút trước',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Sản phẩm sắp hết hàng',
      message: 'Sản phẩm "Linh kiện điện tử XYZ" chỉ còn 5 đơn vị trong kho',
      timestamp: '2 giờ trước',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ bảo trì vào 2:00 AM ngày mai. Thời gian dự kiến: 1 giờ',
      timestamp: '5 giờ trước',
      read: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Thanh toán thành công',
      message: 'Đơn hàng #12340 đã được thanh toán. Số tiền: 15,000,000 VND',
      timestamp: '1 ngày trước',
      read: true
    },
    {
      id: 5,
      type: 'info',
      title: 'Đánh giá mới',
      message: 'Bạn nhận được đánh giá 5 sao từ khách hàng John Buyer',
      timestamp: '2 ngày trước',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 font-sans">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full font-sans">
              {unreadCount} mới
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700 font-semibold font-sans"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-sans">Không có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all ${
                notification.read
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold font-sans ${
                      notification.read ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap font-sans">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 font-sans ${
                    notification.read ? 'text-gray-600' : 'text-gray-700'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold font-sans"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 font-sans"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerNotifications;

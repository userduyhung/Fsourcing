
import React, { useEffect, useState } from 'react';
import { Users, Store, ShoppingCart, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';

interface Order {
  total: number;
  // Add other properties as needed
}

const AnalyticsPage: React.FC = () => {
  const [buyerCount, setBuyerCount] = useState(0);
  const [sellerCount, setSellerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    // Giả lập lấy dữ liệu từ localStorage
    if (typeof window !== 'undefined') {
      try {
        const buyers = window.localStorage.getItem('buyers');
        const sellers = window.localStorage.getItem('sellers');
        const orders = window.localStorage.getItem('allOrders');

        setBuyerCount(buyers ? JSON.parse(buyers).length : 0);
        setSellerCount(sellers ? JSON.parse(sellers).length : 0);
        if (orders) {
          const orderArr = JSON.parse(orders);
          setOrderCount(orderArr.length);
          setRevenue(orderArr.reduce((sum: number, o: Order) => sum + (o.total || 0), 0));
        } else {
          setOrderCount(0);
          setRevenue(0);
        }
      } catch (err) {
        setBuyerCount(0);
        setSellerCount(0);
        setOrderCount(0);
        setRevenue(0);
        console.error('Lỗi đọc dữ liệu thống kê:', err);
      }
    } else {
      setBuyerCount(0);
      setSellerCount(0);
      setOrderCount(0);
      setRevenue(0);
    }
  }, []);

  const stats = [
    {
      title: 'Tổng số Buyer',
      value: buyerCount,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Tổng số Seller',
      value: sellerCount,
      icon: Store,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Tổng đơn hàng',
      value: orderCount,
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+23%',
      trend: 'up'
    },
    {
      title: 'Tổng doanh thu',
      value: `${revenue.toLocaleString()} đ`,
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: '+18%',
      trend: 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Thống kê hệ thống
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Tổng quan về hoạt động và hiệu suất của nền tảng</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
            >
              {/* Gradient background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative p-6">
                {/* Icon and trend badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-600">{stat.change}</span>
                  </div>
                </div>

                {/* Value */}
                <div className="mb-2">
                  <h3 className="text-3xl font-bold font-heading text-gray-900 group-hover:scale-105 transition-transform duration-300 origin-left">
                    {stat.value}
                  </h3>
                </div>

                {/* Title */}
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Overview */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold font-heading text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              Tổng quan nhanh
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                <span className="text-sm font-semibold text-gray-900">24.5%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm text-gray-600">Giá trị đơn hàng TB</span>
                <span className="text-sm font-semibold text-gray-900">
                  {orderCount > 0 ? Math.round(revenue / orderCount).toLocaleString() : 0} đ
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm text-gray-600">Tổng người dùng</span>
                <span className="text-sm font-semibold text-gray-900">{buyerCount + sellerCount}</span>
              </div>
            </div>
          </div>

          {/* Performance Highlights */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Hiệu suất nổi bật
            </h3>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tăng trưởng người dùng</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold">+15.3%</div>
                <div className="text-xs text-white/70 mt-1">So với tháng trước</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tăng trưởng doanh thu</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold">+18.7%</div>
                <div className="text-xs text-white/70 mt-1">So với tháng trước</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

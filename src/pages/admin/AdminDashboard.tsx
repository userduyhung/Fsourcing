import React from 'react';
import { Users, UserCheck, ShoppingBag, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Sellers',
      value: '23',
      change: '+5',
      icon: UserCheck,
      color: 'bg-orange-500'
    },
    {
      title: 'Active Products',
      value: '1,256',
      change: '+8%',
      icon: ShoppingBag,
      color: 'bg-green-500'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'New seller registration', user: 'ABC Manufacturing', time: '2 minutes ago', type: 'seller' },
    { id: 2, action: 'Product report submitted', user: 'John Doe', time: '15 minutes ago', type: 'report' },
    { id: 3, action: 'Premium package purchased', user: 'XYZ Corp', time: '1 hour ago', type: 'payment' },
    { id: 4, action: 'User account blocked', user: 'Admin System', time: '2 hours ago', type: 'admin' },
    { id: 5, action: 'New product listed', user: 'Tech Solutions', time: '3 hours ago', type: 'product' }
  ];

  const pendingReviews = [
    { id: 1, type: 'Seller Verification', company: 'Green Energy Ltd', submitted: '2 days ago' },
    { id: 2, type: 'Product Report', product: 'Industrial Pump XL-200', submitted: '1 day ago' },
    { id: 3, type: 'Content Review', content: 'Company Profile Update', submitted: '5 hours ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor platform activity and manage key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'seller' ? 'bg-blue-500' :
                  activity.type === 'report' ? 'bg-red-500' :
                  activity.type === 'payment' ? 'bg-green-500' :
                  activity.type === 'admin' ? 'bg-orange-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review.id} className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm font-medium text-gray-900">{review.type}</p>
                <p className="text-xs text-gray-600">{review.company || review.product || review.content}</p>
                <p className="text-xs text-gray-500 mt-1">Submitted {review.submitted}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-red-600 hover:text-red-700 font-medium">
            View All Pending Items →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <UserCheck className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Approve Sellers</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Review Products</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
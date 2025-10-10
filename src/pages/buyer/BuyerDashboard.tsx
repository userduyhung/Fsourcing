import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Bell, 
  Star,
  TrendingUp,
  Users,
  Package,
  Clock
} from 'lucide-react';

const BuyerDashboard: React.FC = () => {
  // Get buyer profile from localStorage
  const buyerProfile = JSON.parse(localStorage.getItem('buyerProfile') || '{}');

  // Mock data for dashboard
  const stats = [
    { title: 'Active RFQs', value: '8', change: '+2 this week', icon: FileText, color: 'bg-blue-500' },
    { title: 'Saved Sellers', value: '12', change: '+3 new', icon: Users, color: 'bg-green-500' },
    { title: 'Total Reviews', value: '24', change: '4.8 avg rating', icon: Star, color: 'bg-yellow-500' },
    { title: 'Notifications', value: '3', change: 'unread', icon: Bell, color: 'bg-red-500' }
  ];

  const recentRFQs = [
    { id: 1, title: 'Industrial Machinery Parts', seller: 'Tech Manufacturing Co', status: 'responded', date: '2 days ago' },
    { id: 2, title: 'Electronic Components', seller: 'Global Electronics Ltd', status: 'pending', date: '3 days ago' },
    { id: 3, title: 'Raw Materials for Production', seller: 'Material Suppliers Inc', status: 'closed', date: '1 week ago' }
  ];

  const recentActivity = [
    { id: 1, action: 'New RFQ response received', from: 'ABC Manufacturing', time: '2 hours ago', type: 'response' },
    { id: 2, action: 'Seller profile viewed', from: 'Tech Solutions Co', time: '4 hours ago', type: 'view' },
    { id: 3, action: 'Review submitted', from: 'Quality Parts Ltd', time: '1 day ago', type: 'review' },
    { id: 4, action: 'RFQ created', from: 'System', time: '2 days ago', type: 'rfq' }
  ];

  const suggestedSellers = [
    { id: 1, name: 'Premium Electronics Co', rating: 4.9, speciality: 'Electronics', verified: true },
    { id: 2, name: 'Global Manufacturing Ltd', rating: 4.7, speciality: 'Machinery', verified: true },
    { id: 3, name: 'Quality Materials Inc', rating: 4.8, speciality: 'Raw Materials', verified: false }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'response': return <FileText className="w-4 h-4 text-green-500" />;
      case 'view': return <Search className="w-4 h-4 text-blue-500" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'rfq': return <Package className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {buyerProfile.fullName?.split(' ')[0] || 'Buyer'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your procurement activities
        </p>
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
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
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
        {/* Recent RFQs */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent RFQs</h3>
            <Link to="/buyer/rfq" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentRFQs.map((rfq) => (
              <div key={rfq.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rfq.title}</h4>
                  <p className="text-sm text-gray-500">To: {rfq.seller}</p>
                  <p className="text-xs text-gray-400">{rfq.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq.status)}`}>
                  {rfq.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.from} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions and Suggested Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/buyer/rfq/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-center transition-colors"
            >
              <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Create RFQ</span>
            </Link>
            <Link 
              to="/buyer/sellers"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 text-center transition-colors"
            >
              <Search className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Find Sellers</span>
            </Link>
          </div>
        </div>

        {/* Suggested Sellers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Suggested Sellers</h3>
            <Link to="/buyer/sellers" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {suggestedSellers.map((seller) => (
              <div key={seller.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900 text-sm">{seller.name}</h4>
                    {seller.verified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{seller.speciality}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600 ml-1">{seller.rating}</span>
                  </div>
                </div>
                <Link 
                  to={`/buyer/sellers/${seller.id}`}
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Market Insights</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-sm text-gray-600">New Sellers This Month</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">89%</p>
            <p className="text-sm text-gray-600">RFQ Response Rate</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">4.7</p>
            <p className="text-sm text-gray-600">Average Seller Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
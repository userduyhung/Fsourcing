import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, Shield } from 'lucide-react';

const UnifiedRegister: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  const roles = [
    {
      id: 'buyer',
      title: 'Người mua',
      description: 'Tôi muốn tìm nguồn hàng và nhà cung cấp',
      icon: User,
      color: 'blue',
      features: [
        'Tìm kiếm & kết nối với nhà cung cấp đã xác thực',
        'Gửi yêu cầu báo giá và quản lý mua sắm',
        'Đánh giá và nhận xét nhà cung cấp',
        'Truy cập mạng lưới nhà cung cấp toàn cầu'
      ]
    },
    {
      id: 'seller',
      title: 'Người bán',
      description: 'Tôi muốn bán sản phẩm và phục vụ người mua',
      icon: Building2,
      color: 'green',
      features: [
        'Trưng bày sản phẩm & dịch vụ',
        'Nhận và phản hồi yêu cầu báo giá',
        'Xây dựng hồ sơ nhà cung cấp',
        'Kết nối với người mua toàn cầu'
      ]
    }
  ];

  const handleRoleSelection = (roleId: string) => {
    setSelectedRole(roleId);
    if (roleId === 'buyer') {
      navigate('/buyer/register');
    } else if (roleId === 'seller') {
      navigate('/seller/register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Đăng ký Fsourcing</h2>
          <p className="mt-2 text-lg text-gray-600">Chọn vai trò để bắt đầu trên sàn B2B của chúng tôi</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            const borderClass = selectedRole === role.id
              ? `border-${role.color}-500 ring-2 ring-${role.color}-200`
              : 'border-gray-200 hover:border-gray-300';
            const bgClass = role.color === 'blue'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white';
            return (
              <div
                key={role.id}
                className={`relative bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${borderClass}`}
                onClick={() => handleRoleSelection(role.id)}
              >
                <div className="text-center">
                  <div className={`mx-auto w-16 h-16 bg-${role.color}-100 rounded-full flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 text-${role.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h3>
                  <p className="text-gray-600 mb-6">{role.description}</p>
                  <div className="text-left space-y-3">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`w-2 h-2 bg-${role.color}-500 rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`w-full mt-8 py-3 px-6 rounded-lg font-medium transition-colors ${bgClass}`}
                  >
                    Tham gia với vai trò {role.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Admin Access */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
            <Shield className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Truy cập quản trị? 
              <Link to="/login" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
                Đăng nhập quản trị
              </Link>
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;



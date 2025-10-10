import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, Shield } from 'lucide-react';

const UnifiedRegister: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | ''>('');
  const navigate = useNavigate();

  const roles = [
    {
      id: 'buyer' as const,
      title: 'Buyer',
      description: 'I want to source products and find suppliers',
      icon: User,
      color: 'blue',
      features: [
        'Search & connect with verified suppliers',
        'Send RFQs and manage procurement',
        'Rate and review suppliers',
        'Access to global supplier network'
      ]
    },
    {
      id: 'seller' as const,
      title: 'Seller/Supplier',
      description: 'I want to sell products and serve buyers',
      icon: Building2,
      color: 'green',
      features: [
        'Showcase your products & services',
        'Receive and respond to RFQs', 
        'Build your supplier profile',
        'Connect with global buyers'
      ]
    }
  ];

  const handleRoleSelection = (role: 'buyer' | 'seller') => {
    setSelectedRole(role);
    
    // Navigate to specific registration page
    if (role === 'buyer') {
      navigate('/buyer/register');
    } else {
      navigate('/supplier-register');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-2xl font-bold text-blue-600 mb-6">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">F</span>
            Fsourcing
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Join Fsourcing</h2>
          <p className="mt-2 text-lg text-gray-600">
            Choose your role to get started on our B2B marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className={`relative bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                  selectedRole === role.id 
                    ? `border-${role.color}-500 ring-2 ring-${role.color}-200` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
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
                    className={`w-full mt-8 py-3 px-6 rounded-lg font-medium transition-colors ${
                      role.color === 'blue'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    Join as {role.title}
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
              Administrative access? 
              <Link to="/login" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
                Admin Login
              </Link>
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;
import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Ban, 
  CheckCircle, 
  Mail, 
  Phone,
  Calendar,
  User,
  Building,
  Shield
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller';
  status: 'active' | 'blocked' | 'pending';
  joinDate: string;
  company?: string;
  verified: boolean;
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'buyer' | 'seller'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'blocked' | 'pending'>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      type: 'buyer',
      status: 'active',
      joinDate: '2024-01-15',
      verified: true,
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Tech Solutions Inc',
      email: 'contact@techsolutions.com',
      phone: '+1-555-0456',
      type: 'seller',
      status: 'active',
      joinDate: '2024-02-20',
      company: 'Tech Solutions Inc',
      verified: true,
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0789',
      type: 'buyer',
      status: 'blocked',
      joinDate: '2024-03-10',
      verified: false,
      lastActive: '1 week ago'
    },
    {
      id: 4,
      name: 'Green Manufacturing',
      email: 'info@greenmanufacturing.com',
      phone: '+1-555-0321',
      type: 'seller',
      status: 'pending',
      joinDate: '2024-03-25',
      company: 'Green Manufacturing Co',
      verified: false,
      lastActive: '3 days ago'
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || user.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleUserAction = (userId: number, action: 'view' | 'block' | 'unblock' | 'verify') => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'block':
              return { ...user, status: 'blocked' as const };
            case 'unblock':
              return { ...user, status: 'active' as const };
            case 'verify':
              return { ...user, verified: true };
            case 'view':
              setSelectedUser(user);
              setShowUserModal(true);
              return user;
            default:
              return user;
          }
        }
        return user;
      })
    );
  };

  const handleBulkAction = (action: 'block' | 'unblock' | 'verify') => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (selectedUsers.includes(user.id)) {
          switch (action) {
            case 'block':
              return { ...user, status: 'blocked' as const };
            case 'unblock':
              return { ...user, status: 'active' as const };
            case 'verify':
              return { ...user, verified: true };
            default:
              return user;
          }
        }
        return user;
      })
    );
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'seller' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage buyers and sellers on the platform</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('verify')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleBulkAction('block')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Block
                </button>
                <button
                  onClick={() => handleBulkAction('unblock')}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Unblock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {user.type === 'seller' ? (
                            <Building className="w-5 h-5 text-gray-600" />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          {user.verified && (
                            <Shield className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.company && (
                          <div className="text-xs text-gray-400">{user.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(user.type)}`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'view')}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'block')}
                          className="text-red-600 hover:text-red-900"
                          title="Block User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : user.status === 'blocked' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'unblock')}
                          className="text-green-600 hover:text-green-900"
                          title="Unblock User"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : null}

                      {!user.verified && (
                        <button
                          onClick={() => handleUserAction(user.id, 'verify')}
                          className="text-purple-600 hover:text-purple-900"
                          title="Verify User"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    {selectedUser.type === 'seller' ? (
                      <Building className="w-8 h-8 text-gray-600" />
                    ) : (
                      <User className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium text-gray-900">{selectedUser.name}</h4>
                      {selectedUser.verified && (
                        <Shield className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedUser.type)}`}>
                      {selectedUser.type}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedUser.phone}</span>
                  </div>
                  {selectedUser.company && (
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedUser.company}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Joined {new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 flex space-x-3">
                  {selectedUser.status === 'active' ? (
                    <button
                      onClick={() => {
                        handleUserAction(selectedUser.id, 'block');
                        setShowUserModal(false);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Block User
                    </button>
                  ) : selectedUser.status === 'blocked' ? (
                    <button
                      onClick={() => {
                        handleUserAction(selectedUser.id, 'unblock');
                        setShowUserModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Unblock User
                    </button>
                  ) : null}
                  
                  {!selectedUser.verified && (
                    <button
                      onClick={() => {
                        handleUserAction(selectedUser.id, 'verify');
                        setShowUserModal(false);
                      }}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                      Verify User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
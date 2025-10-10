import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  FileText, 
  Building, 
  Calendar,
  Clock,
  Award,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';

interface SellerApplication {
  id: number;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  website?: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    businessLicense: string;
    taxCertificate: string;
    bankStatement: string;
  };
  reviewNotes?: string;
}

const SellerApproval: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Mock data
  const [applications, setApplications] = useState<SellerApplication[]>([
    {
      id: 1,
      companyName: 'Green Energy Solutions Ltd',
      ownerName: 'Michael Chen',
      email: 'michael@greenenergy.com',
      phone: '+1-555-0234',
      businessType: 'Manufacturing',
      registrationNumber: 'REG-2024-001',
      taxId: 'TAX-789456123',
      address: '123 Industrial Ave, Tech City, TC 12345',
      website: 'https://greenenergy.com',
      description: 'Leading manufacturer of solar panels and renewable energy equipment with 15+ years of experience.',
      submittedAt: '2024-03-20T10:30:00Z',
      status: 'pending',
      documents: {
        businessLicense: 'business-license-001.pdf',
        taxCertificate: 'tax-cert-001.pdf',
        bankStatement: 'bank-stmt-001.pdf'
      }
    },
    {
      id: 2,
      companyName: 'Tech Manufacturing Corp',
      ownerName: 'Sarah Johnson',
      email: 'sarah@techmanuf.com',
      phone: '+1-555-0567',
      businessType: 'Technology',
      registrationNumber: 'REG-2024-002',
      taxId: 'TAX-456789012',
      address: '456 Tech Park, Innovation City, IC 54321',
      website: 'https://techmanuf.com',
      description: 'Specialized in electronic components and PCB manufacturing for automotive industry.',
      submittedAt: '2024-03-18T14:15:00Z',
      status: 'pending',
      documents: {
        businessLicense: 'business-license-002.pdf',
        taxCertificate: 'tax-cert-002.pdf',
        bankStatement: 'bank-stmt-002.pdf'
      }
    },
    {
      id: 3,
      companyName: 'Quality Tools Inc',
      ownerName: 'Robert Martinez',
      email: 'robert@qualitytools.com',
      phone: '+1-555-0890',
      businessType: 'Manufacturing',
      registrationNumber: 'REG-2024-003',
      taxId: 'TAX-123456789',
      address: '789 Manufacturing St, Industrial Zone, IZ 67890',
      description: 'Industrial tools and equipment manufacturer serving construction and automotive sectors.',
      submittedAt: '2024-03-15T09:45:00Z',
      status: 'approved',
      documents: {
        businessLicense: 'business-license-003.pdf',
        taxCertificate: 'tax-cert-003.pdf',
        bankStatement: 'bank-stmt-003.pdf'
      },
      reviewNotes: 'All documents verified. Established business with good financial standing.'
    }
  ]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleApplicationAction = (applicationId: number, action: 'approve' | 'reject', notes?: string) => {
    setApplications(prevApplications =>
      prevApplications.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,
            status: action === 'approve' ? 'approved' as const : 'rejected' as const,
            reviewNotes: notes || ''
          };
        }
        return app;
      })
    );
    setShowApplicationModal(false);
    setReviewNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seller Approval</h1>
        <p className="text-gray-600 mt-2">Review and approve seller registration applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Pending Reviews', value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          { title: 'Approved Today', value: '5', icon: Check, color: 'bg-green-500' },
          { title: 'Total Approved', value: applications.filter(a => a.status === 'approved').length, icon: Award, color: 'bg-blue-500' },
          { title: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, icon: X, color: 'bg-red-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Building className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{application.companyName}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                        {application.website && (
                          <div className="text-xs text-blue-600 flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Website
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.ownerName}</div>
                    <div className="text-sm text-gray-500">{application.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.businessType}</div>
                    <div className="text-xs text-gray-500">{application.registrationNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(application.submittedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApplicationAction(application.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">Application Details</h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <p className="text-sm text-gray-900">{selectedApplication.companyName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                        <p className="text-sm text-gray-900">{selectedApplication.ownerName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900">{selectedApplication.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <p className="text-sm text-gray-900">{selectedApplication.businessType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                        <p className="text-sm text-gray-900">{selectedApplication.registrationNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                        <p className="text-sm text-gray-900">{selectedApplication.taxId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <p className="text-sm text-gray-900">{selectedApplication.address}</p>
                      </div>
                      {selectedApplication.website && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Website</label>
                          <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                            {selectedApplication.website}
                          </a>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="text-sm text-gray-900">{selectedApplication.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents and Review */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Documents</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedApplication.documents).map(([key, filename]) => (
                        <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </p>
                              <p className="text-xs text-gray-500">{filename}</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedApplication.status === 'pending' && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Review</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                          <textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Add notes about your review decision..."
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApplicationAction(selectedApplication.id, 'approve', reviewNotes)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve Application
                          </button>
                          <button
                            onClick={() => handleApplicationAction(selectedApplication.id, 'reject', reviewNotes)}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject Application
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedApplication.reviewNotes && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Previous Review</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedApplication.reviewNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-800">
                          <strong>Status:</strong> {selectedApplication.status}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Submitted: {formatDate(selectedApplication.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApproval;
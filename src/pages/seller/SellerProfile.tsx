import React from 'react';

const SellerProfile: React.FC = () => {
  // Giả lập dữ liệu hồ sơ công ty
  const company = {
    name: 'Công ty TNHH ABC',
    owner: 'Nguyễn Văn A',
    address: '123 Đường Lớn, Quận 1, TP. Hồ Chí Minh',
    phone: '0123 456 789',
    email: 'contact@abc.com',
    industry: 'Dệt may',
    certifications: ['ISO 9001', 'CE'],
    description: 'Chuyên sản xuất và xuất khẩu các sản phẩm dệt may chất lượng cao.'
  };

  return (
    <div className="bg-app min-h-screen font-sans">
      <div className="max-w-2xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6">Hồ sơ công ty</h2>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-4">
            <span className="font-semibold">Tên công ty:</span> {company.name}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Chủ sở hữu:</span> {company.owner}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Địa chỉ:</span> {company.address}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Điện thoại:</span> {company.phone}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Email:</span> {company.email}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Ngành nghề:</span> {company.industry}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Chứng nhận:</span> {company.certifications.join(', ')}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Giới thiệu:</span> {company.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;

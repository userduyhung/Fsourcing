import React from 'react';

const Services: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">Dịch vụ của chúng tôi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Giải pháp toàn diện cho mọi nhu cầu sourcing và thương mại điện tử B2B
          </p>
        </div>

        {/* Overview Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Chúng tôi cung cấp một hệ sinh thái dịch vụ hoàn chỉnh để giúp người mua và nhà cung cấp thành công 
            trong môi trường thương mại toàn cầu. Từ xác minh nhà cung cấp đến hỗ trợ logistics, chúng tôi đồng 
            hành cùng bạn trong mọi bước của hành trình kinh doanh.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Service 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white">Xác minh & Kiểm tra nhà cung cấp</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Đảm bảo mọi giao dịch an toàn với hệ thống xác minh nhà cung cấp toàn diện của chúng tôi.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Xác thực giấy phép kinh doanh và chứng nhận</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Kiểm tra năng lực sản xuất và chất lượng</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Đánh giá uy tín và lịch sử giao dịch</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Kiểm tra hiện trường tại nhà máy (nếu cần)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Service 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-green-600 p-6">
              <h2 className="text-2xl font-bold text-white">Đảm bảo thương mại & Thanh toán</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Bảo vệ giao dịch của bạn với hệ thống đảm bảo thương mại và thanh toán an toàn.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Giữ tiền ký quỹ an toàn cho đến khi nhận hàng</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Hỗ trợ nhiều phương thức thanh toán quốc tế</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Bảo hiểm cho các giao dịch giá trị cao</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Giải quyết tranh chấp công bằng và nhanh chóng</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Service 3 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-orange-600 p-6">
              <h2 className="text-2xl font-bold text-white">Hỗ trợ Logistics & Vận chuyển</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Đơn giản hóa quy trình vận chuyển quốc tế với dịch vụ logistics toàn diện.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Tìm kiếm và so sánh giá vận chuyển tốt nhất</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Hỗ trợ thủ tục hải quan và chứng từ</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Theo dõi lô hàng real-time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  <span>Bảo hiểm hàng hóa trong quá trình vận chuyển</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Service 4 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white">Phân tích & Thông tin thị trường</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Đưa ra quyết định thông minh với dữ liệu và phân tích thị trường chuyên sâu.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Báo cáo xu hướng thị trường và ngành hàng</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Phân tích giá cả và đối thủ cạnh tranh</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Dự báo nhu cầu và cơ hội kinh doanh</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Tư vấn chiến lược sourcing tối ưu</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Dịch vụ bổ sung</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-blue-600 text-4xl mb-3">📋</div>
              <h3 className="font-semibold mb-2">Quản lý RFQ</h3>
              <p className="text-gray-600 text-sm">Gửi yêu cầu báo giá và nhận đề xuất từ nhiều nhà cung cấp</p>
            </div>
            <div className="text-center p-4">
              <div className="text-green-600 text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">Kiểm tra chất lượng</h3>
              <p className="text-gray-600 text-sm">Dịch vụ kiểm định chất lượng sản phẩm trước khi xuất khẩu</p>
            </div>
            <div className="text-center p-4">
              <div className="text-orange-600 text-4xl mb-3">💬</div>
              <h3 className="font-semibold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600 text-sm">Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ mọi lúc</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Tham gia cùng hàng ngàn doanh nghiệp đang sử dụng Fsourcing để phát triển kinh doanh
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Đăng ký ngay
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
